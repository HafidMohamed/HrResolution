import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek,isToday, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isBefore, startOfDay,  isSameDay, parseISO ,isEqual,addMinutes,differenceInHours, isAfter, endOfDay} from 'date-fns';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { selectAuth } from '@/store/slices/authSlice';
import { Button } from "@/components/ui/button";
import {  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle, } from "@/app/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/app/ui/avatar";
import { X, Clock, ChevronLeft, ChevronRight, Loader2,Check, Edit, AlertCircle, Save, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { departmentApi } from '@/services/api/departmentApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/ui/select";
import useTranslation from '@/hooks/useTranslation';
import ErrorAlert from '@/components/ErrorAlert';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/ui/popover';
import { saveAs } from 'file-saver';
import { utils as XLSXUtils, write as XLSXWrite } from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {  useLocation } from 'react-router-dom';
import { scheduleApi } from '@/services/api/scheduleApi';
import { userApi } from '@/services/api/userApi';
import { Progress } from '@/app/ui/progress';

const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;
const CELL_WIDTH = 60;
const PIXELS_PER_MINUTE = CELL_WIDTH / MINUTES_IN_HOUR;
const RESIZE_HANDLE_WIDTH = 10; // Width of the resize handle area


const CreateSchedule = () => {
  const location = useLocation();
  const { scheduleId, dep,scheduleEndDate,scheduleStartDate } = location.state || {};
  const [schedule, setSchedule] = useState({});
  const [shifts, setShifts] = useState({});
  const [positions, setPositions] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([...allEmployees]);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { user } = useSelector(selectAuth);
  const [isLoading, setIsLoading] = useState(true);
  const [Data, setData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const { t, language,getTranslations } = useTranslation();
  const [translations, setTranslations] = useState({});
  const [translationsKeys, setTranslationsKeys] = useState({});
  const [period, setPeriod] = useState();
  const timeHeaderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeEdge, setResizeEdge] = useState(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [initialStartTime, setInitialStartTime] = useState(null);
  const [initialEndTime, setInitialEndTime] = useState(null);
  const [activeShift, setActiveShift] = useState(null);
  const [currentDate, setCurrentDate] =  useState(new Date());
  let  [startDate, setStartDate] = useState(null);
  let  [endDate, setEndDate] = useState(null);
  let [formData, setFormData] =useState(null); 
  let  [showInitialDialog, setShowInitialDialog] = useState(null);
  const  [sId, setSId] = useState('');
  const [progress, setProgress] = useState(0)

  if(scheduleId){

    [startDate, setStartDate] = useState(scheduleStartDate);
    [endDate, setEndDate] = useState(scheduleEndDate);
    [showInitialDialog, setShowInitialDialog] = useState(false);
    [formData, setFormData]= useState({
      company:'',
      department:dep,
      user: user,
      schedule:{}
    });
  }else {
    [startDate, setStartDate] = useState(null);
    [endDate, setEndDate] = useState(null);
    [showInitialDialog, setShowInitialDialog] = useState(true);
    [formData, setFormData]= useState({
      company:'',
      department:'',
      user: user,
      schedule:{}
    });
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    let intervalId;
    if (isLoading) {
      intervalId = setInterval(() => {
        setProgress((prevProgress) => (prevProgress + 1) % 100);
      }, 30);
    } else {
      setProgress(0);
    }
    return () => clearInterval(intervalId);
  }, [isLoading]);
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      try {
        const response = await userApi.searchQuery({query,company:formData.company});
        
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching employees:', error);
      }
    } else {
      setSearchResults([]);
    }
  };
    useEffect(() => {
      const handleScroll = () => {
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        if (timeHeaderRef.current) {
          timeHeaderRef.current.style.transform = `translateX(${scrollLeft}px)`;
        }
      };
  
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  const getColorForPosition = (position) => {
    const colors = [
      'bg-red-100 border-red-300 text-red-800',
      'bg-blue-100 border-blue-300 text-blue-800',
      'bg-green-100 border-green-300 text-green-800',
      'bg-yellow-100 border-yellow-300 text-yellow-800',
      'bg-purple-100 border-purple-300 text-purple-800',
      'bg-pink-100 border-pink-300 text-pink-800',
      'bg-indigo-100 border-indigo-300 text-indigo-800',
      'bg-gray-100 border-gray-300 text-gray-800',
    ];
    
    // Create a simple hash of the position name
    const hash = position.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // Use the hash to select a color
    return colors[Math.abs(hash) % colors.length];
  };
  const calculateShiftWidth = (start, end) => {
    let startMinutes = parseTimeToMinutes(start);
    let endMinutes = parseTimeToMinutes(end);
    
    if (endMinutes <= startMinutes) {
      endMinutes += HOURS_IN_DAY * MINUTES_IN_HOUR;
    }
    
    const durationMinutes = endMinutes - startMinutes;
    return (durationMinutes / MINUTES_IN_HOUR) * CELL_WIDTH;
  };

  const parseTimeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * MINUTES_IN_HOUR + minutes;
  };

  const minutesToTimeString = (minutes) => {
    const hours = Math.floor(minutes / MINUTES_IN_HOUR);
    const mins = minutes % MINUTES_IN_HOUR;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };
  const calculateShiftPosition = (start) => {
    const startMinutes = parseTimeToMinutes(start);
    return (startMinutes / MINUTES_IN_HOUR) * CELL_WIDTH;
  };
  const handleMouseDown = (e, position, index, edge = null) => {
    if (edge) {
      setIsResizing(true);
      setResizeEdge(edge);
    } else {
      setIsDragging(true);
    }    
    setDragStartX(e.clientX);
    setActiveShift({ position, index });
    setInitialStartTime(shifts[position][index].startTime);
    setInitialEndTime(shifts[position][index].endTime);
  };

  const handleMouseMove = (e) => {
    if ((!isDragging && !isResizing)|| !activeShift) return;

    const deltaX = e.clientX - dragStartX;
    const deltaMinutes = Math.round(deltaX / PIXELS_PER_MINUTE);

    if (isResizing) {
      if (resizeEdge === 'left') {
        const newStartTime = addMinutes(new Date(initialStartTime), deltaMinutes);
        handleShiftChange(
          activeShift.position,
          activeShift.index,
          newStartTime,
          initialEndTime
        );
      } else if (resizeEdge === 'right') {
        const newEndTime = addMinutes(new Date(initialEndTime), deltaMinutes);
        handleShiftChange(
          activeShift.position,
          activeShift.index,
          initialStartTime,
          newEndTime
        );
      }
    } else if (isDragging) {
    

    const newStartTime = addMinutes(new Date(initialStartTime), deltaMinutes);
    const newEndTime = addMinutes(new Date(initialEndTime), deltaMinutes);

    handleShiftChange(
      activeShift.position,
      activeShift.index,
      newStartTime,
      newEndTime
    );
  }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeEdge(null);
    setActiveShift(null);
    setInitialStartTime(null);
    setInitialEndTime(null);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging,isResizing, activeShift, initialStartTime, initialEndTime]);
  useEffect(() => {
    const updateTranslations = async () => {
      const newTranslations = {
        
      };
      setTranslations(newTranslations);
    };

    updateTranslations();
  }, [language, t]); 
  useEffect(() => {
    const fetchTranslations = async () => {
      const keys = [
        'errorFetchDepartment', 'uavailableData', 'departmentPositionNull',
        'failedPositionFetch', 'pleaseSelectCompany', 'pleaseSelectDepratment',
        'selectCompanyDepartment', 'failedPositionDelete', 'pleaseSelectCompanyDepartmentToView',
        'namecompany', 'SelectCompany', 'namedepartment', 'selectDepartment',
        'viewPositions', 'loading', 'browseOtherDepartmentPositions', 'positions',
        'searchPositions', 'namekey', 'description', 'hourlyRate', 'createdAt',
        'actions', 'delete', 'edit', 'editPosition', 'update', 'confirmDeletion',
        'areYouSureYouWantToDelete', 'thisActionCannotBeUndone', 'cancel'
      ];    const newTranslations = await getTranslations(keys);
      setTranslationsKeys(prev => ({
        ...prev,
        ...newTranslations
      }));
    };     
    fetchTranslations();
  }, [language, getTranslations]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const exportSchedule = (format) => {
    // Convert schedule object to array of entries
    const scheduleEntries = Object.entries(schedule);
  
    // Prepare data in a format suitable for all export types
    const data = scheduleEntries.flatMap(([date, positions]) =>
      Object.entries(positions).flatMap(([position, shifts]) =>
        shifts.map(shift => [
          date,
          position,
          shift.name,
          shift.startTime,
          shift.endTime
        ])
      )
    );
  
    const headers = ['Date', 'Position', 'Employee Name', 'Start Time', 'End Time'];
  
    switch (format) {
      case 'pdf':
        exportToPDF(data, headers);
        break;
      case 'csv':
        exportToCSV(data, headers);
        break;
      case 'excel':
        exportToExcel(data, headers);
        break;
      default:
        console.error('Unsupported export format');
    }
  };
  
  const exportToPDF = (data, headers) => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [headers],
      body: data,
    });
    doc.save(`schedule_export_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };
  
  const exportToCSV = (data, headers) => {
    let csvContent = headers.join(',') + '\n';
    csvContent += data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `schedule_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };
  
  const exportToExcel = (data, headers) => {
    const ws = XLSXUtils.aoa_to_sheet([headers, ...data]);
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, 'Schedule');
    const excelBuffer = XLSXWrite(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `schedule_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };
  
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await departmentApi.getDepartments(user);

        if (isMounted) {
          if (result && result.data.companies && Array.isArray(result.data.companies)) {
            setData(result.data.companies);
            if (result.data.companies.length === 1) {
              setFormData(prev => ({
                ...prev,
                company: result.data.companies[0]._id
              }));
            }
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        if (isMounted) {
          setError(translationsKeys.errorFetchDepartment);
          setIsLoading(false);
        }
      }
    };
   
      fetchData();
    
   
  
    return () => {
      isMounted = false;
    };
  }, [user]);

const transformScheduleData = (scheduleData) => {
  
  const transformedSchedule = {};
  
  scheduleData.dayShift.forEach(day => {
    const dateKey = new Date(day.day).toISOString().split('T')[0];
    
    transformedSchedule[dateKey] = {};
    transformedSchedule.dayShiftId=day._id;
    day.employeesShifts.forEach(employeeShift => {
      const positionId = employeeShift.shift.position._id;
      
      if (!transformedSchedule[dateKey][positionId]) {
        transformedSchedule[dateKey][positionId] = [];
      }
      transformedSchedule[dateKey].employeeShiftId=employeeShift._id;

      transformedSchedule[dateKey][positionId].push({
        shiftId:employeeShift.shift._id,
        id: employeeShift.userprofile._id,
        userId: employeeShift.userprofile.user._id,
        email:employeeShift.userprofile.user.email,
        name: `${employeeShift.userprofile.firstName} ${employeeShift.userprofile.lastName}`,
        position: {
          name: employeeShift.shift.position.name,
          colour: employeeShift.shift.position._id
        },
        colour: `bg-${employeeShift.shift.position.colour} border-${employeeShift.shift.position.colour} text-${employeeShift.shift.position.colour}`,
        picture: `https://i.pravatar.cc/150?u=${employeeShift.userprofile._id}`,
        startTime: employeeShift.shift.scheduledStartTime,
        endTime: employeeShift.shift.scheduledEndTime,
        date: dateKey
      });
    });
  });

  return transformedSchedule;
};
 
const fetchScheduleData = useCallback(async () => {
  try {
    setIsLoading(true);
    const result = await departmentApi.getDepartmentData(formData);
    
    let startDate;
    let endDate;
    if (scheduleId) {
      const response = await scheduleApi.getSchedule(scheduleId);
      const transformedSchedule = transformScheduleData(response.data.schedule);
      setSId(response.data.schedule._id);
      setSchedule(transformedSchedule);
      startDate = new Date(response.data.schedule.startDate);
      endDate=new Date(response.data.schedule.endDate);
    } else {
      startDate = new Date(); // For new schedules, use current date
    }
    
    setCurrentDate(startDate);

    // Set other data
    const fetchedPositions = result.data.department.position.map(pos => ({
      name: pos.name,
      id: pos._id
    }));
    setPositions(fetchedPositions);

    const fetchedEmployees = result.data.department.userprofile.map(user => {
      const position = result.data.department.position.find(pos => pos._id === user.position);
      return {
        id: user._id,
        userId:user.user._id,
        name: `${user.firstName} ${user.lastName}`,
        email:user.user.email,
        position: {
          id: position ? position._id : 'unknown',
          name: position ? position.name : 'Unknown'
        },
        colour: getColorForPosition(position ? position.name : 'Unknown'),
        picture: `https://i.pravatar.cc/150?u=${user._id}`
      };
    });
    

    setPeriod(result.data.department.preferredSchedulingPeriod);
    setAllEmployees(fetchedEmployees);
    setAvailableEmployees(fetchedEmployees);
    setDepartment(result.data.department);
    
    setIsLoading(false);
    setShowInitialDialog(false);
  } catch (error) {
    console.error("Error fetching schedule data:", error);
    setError(translationsKeys.failedScheduleFetch);
    setIsLoading(false);
  }
}, [formData, scheduleId]);

useEffect(() => {
  if (scheduleId || !showInitialDialog) {
    fetchScheduleData();
  }
}, [fetchScheduleData, scheduleId, showInitialDialog]);


  const saveChanges = async () => {
    try {
      setIsLoading(true);

      const updatedFormData = {
        ...formData,
        id:sId,
        schedule: schedule,
        period: period,
        }
        let response;
        if(sId){
           response=await scheduleApi.updateSchedule(updatedFormData);
        }else{
           response=await departmentApi.saveSchedule(updatedFormData);
        }

    
      toast({
        title: "Success",
        description: response.data.message,
        variant: "default",
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Error",
        description: "Failed to save schedule. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
useEffect(() => {
 if(!scheduleId){
  if (!showInitialDialog) {
    fetchDepartmentUsersPositions();
  }
 }
    
  

}, [showInitialDialog, selectedCompany, selectedDepartment]);
useEffect(() => {
  if (formData.company) {
    const selectedCompany = Data.find(c => c._id === formData.company);
    setDepartments(selectedCompany ? selectedCompany.department : []);
  }
}, [formData.company, Data]);
const handleInitialDialogSubmit = () => {
  if ((user.role === 'Owner' || user.role === 'Admin') && !formData.company) {
    toast({
      title: "Error",
      description: translationsKeys.pleaseSelectCompany,
      variant: "destructive",
    });
    return;
  }
  if (!formData.department) {
    toast({
      title: "Error",
      description: translationsKeys.pleaseSelectDepratment,
      variant: "destructive",
    });
    return;
  }
  setShowInitialDialog(false);
};
const fetchDepartmentUsersPositions = async () => {
  try {
    setIsLoading(true);
    const result = await departmentApi.getDepartmentData(formData);
    if (result.data.department.length === 0) {
      toast({
        title: translationsKeys.uavailableData,
        description: translationsKeys.departmentPositionNull,
      });
    }
    // Set positions
    const fetchedPositions = result.data.department.position.map(pos => ({
      name: pos.name,
      id: pos._id
    }));
    setPositions(fetchedPositions);
    // Set employees
    const fetchedEmployees = result.data.department.userprofile.map(user => {
      const position = result.data.department.position.find(pos => pos._id === user.position);
      return {
        id: user._id,
        userId: user.user._id,
        name: `${user.firstName} ${user.lastName}`,
        email:user.user.email,
        position: {
          id: position ? position._id : 'unknown',
          name: position ? position.name : 'Unknown'
        },
        colour: getColorForPosition(position ? position.name : 'Unknown'),
        picture: `https://i.pravatar.cc/150?u=${user._id}`
      };
    });
    setPeriod(result.data.department.preferredSchedulingPeriod);
    const apiStartDate = new Date(result.data.startDate);
    // Use a local variable to store the new date
const newDate = apiStartDate;

// Update the states afterward
setStartDate(newDate);
setCurrentDate(newDate);
    setAllEmployees(fetchedEmployees);
    setAvailableEmployees(fetchedEmployees);
    setDepartment(result.data.department);
    setIsLoading(false);
  } catch (error) {
    console.error("Error fetching positions:", error);
    setError(translationsKeys.failedPositionFetch);
    setIsLoading(false);
  }
};
const handleBrowseOtherDepartments = () => {
  setShowInitialDialog(true);
  setFormData({ company: '', department: '' ,user: user});
  setError(''); // Clear any existing errors

};
  
const formatDateTime = (date, hours) => {
  const newDate = new Date(date);
  newDate.setHours(hours, 0, 0, 0);
  return newDate.toISOString().slice(0, 19) + ':00';
};
  useEffect(() => {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    console.log(schedule);
    if (schedule[dateKey]) {
      setShifts(schedule[dateKey]);
      updateAvailableEmployees(schedule[dateKey]);
    } else {
      setShifts({});
      setAvailableEmployees([...allEmployees]);
    }
  }, [currentDate, schedule]);
  const updateSchedule = (newShifts) => {
    const currentDateKey = format(currentDate, 'yyyy-MM-dd');
    setSchedule(prev => ({
      ...prev,
      [currentDateKey]: newShifts
    }));
  };
  const updateAvailableEmployees = (currentShifts) => {
    let assignedEmployeeIds = new Set();
  
    if (!showInitialDialog) {
      // This is for updating an existing schedule
      Object.entries(currentShifts).forEach(([positionId, positionData]) => {
        if (Array.isArray(positionData)) {
          positionData.forEach(shift => {
            if (shift.id) {
              assignedEmployeeIds.add(shift.id);
            }
          });
        }
      });
    } else {
      // This is for creating a new schedule
      assignedEmployeeIds = new Set(
        Object.values(currentShifts).flatMap(positionShifts => 
          positionShifts.map(shift => shift.id)
        )
      );
    }
  
    setAvailableEmployees(allEmployees.filter(emp => !assignedEmployeeIds.has(emp.id)));
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId && 
      source.index === destination.index)) {
    return;
  }

    const [destPos] = destination.droppableId.split('-');

    if (destination.droppableId === 'employees') {
      // Employee is being dragged back to the employee area
      const [sourcePos, sourceIndex] = source.droppableId.split('-');
      setShifts(prev => {
        const newShifts = { ...prev };
        const sourceShifts = [...(newShifts[sourcePos] || [])];
        const [movedEmployee] = sourceShifts.splice(parseInt(sourceIndex), 1);
        
        if (sourceShifts.length === 0) {
          delete newShifts[sourcePos];
        } else {
          newShifts[sourcePos] = sourceShifts;
        }
        updateSchedule(newShifts);
        setAvailableEmployees(prev => [...prev, movedEmployee]);
        return newShifts;
      });
    } else if (source.droppableId === 'employees') {
     
      const employee = availableEmployees.find(emp => emp.id === draggableId);
      const currentDateKey = format(currentDate, 'yyyy-MM-dd');
      if (employee) {
        setShifts(prev => {
          const newShifts = {
            ...prev,
            [destPos]: [...(prev[destPos] || []), { ...employee,startTime:`${currentDateKey}T08:00`,endTime:`${currentDateKey}T16:00`,date:currentDateKey }]
          };
          updateSchedule(newShifts);
          return newShifts;
        });
        setAvailableEmployees(prev => prev.filter(emp => emp.id !== employee.id));
      }
    } else {
      const [sourcePos] = source.droppableId.split('-');
      setShifts(prev => {
        const newShifts = { ...prev };
        const sourceShifts = [...(newShifts[sourcePos] || [])];
        const [movedEmployee] = sourceShifts.splice(source.index, 1);
        
        if (sourceShifts.length === 0) {
          delete newShifts[sourcePos];
        } else {
          newShifts[sourcePos] = sourceShifts;
        }

        newShifts[destPos] = [...(newShifts[destPos] || []), movedEmployee];
        newShifts[destPos].position=destPos;
        updateSchedule(newShifts);
        return newShifts;
      });
    }
  };

  const handleShiftChange = (position, index, startTime, endTime) => {

    setShifts(prev => {
      const newShifts = { ...prev };
      newShifts[position][index] = { ...newShifts[position][index], startTime, endTime };
      updateSchedule(newShifts);
      return newShifts;
    });
  };

  const removeShift = (position, index) => {
    const currentDateKey = format(currentDate, 'yyyy-MM-dd');
    setShifts(prev => {
      const newShifts = { ...prev };
      const [removedEmployee] = newShifts[position].splice(index, 1);
      //newShifts[position].splice(index, 1);
      if (newShifts[position].length === 0) {
        delete newShifts[position];
      }
      setAvailableEmployees(prevAvailable => [...prevAvailable, removedEmployee]);
      updateSchedule(newShifts);
      return newShifts;
    });
  };

  const handleDateChange = (direction) => {
    const currentDateKey = format(currentDate, 'yyyy-MM-dd');
    let newDate;
    switch (period) {
      case 'day':
        newDate = direction === 'next' ? addDays(currentDateKey, 1) : subDays(currentDateKey, 1);
        break;
      case 'week':
        newDate = direction === 'next' ? addWeeks(currentDateKey, 1) : subWeeks(currentDateKey, 1);
        break;
      case 'month':
        newDate = direction === 'next' ? addMonths(currentDateKey, 1) : subMonths(currentDateKey, 1);
        break;
    }

    if (!isDateDisabled(newDate)) {
      setCurrentDate(newDate);
    }
    };
    const isDateDisabled = (day) => {
      if (!showInitialDialog) {
        // For updating existing schedule
        return isBefore(day, startOfDay(startDate)) || isAfter(day, endOfDay(endDate));
      } else if (showInitialDialog) {
        // For creating new schedule
        return isBefore(day, startOfDay(startDate));
      }
    };
  const renderCalendar = () => {
  
    const renderDayContent = (day) => {
      const dayHasEvents = schedule[format(day, 'yyyy-MM-dd')] && Object.keys(schedule[format(day, 'yyyy-MM-dd')]).length > 0;
      return (
        <div className="w-full h-full flex flex-col">
          <span className={cn(
            "text-sm leading-none",
            isToday(day) && "font-bold text-blue-600",
            !isSameMonth(day, currentDate) && "text-gray-400"
          )}>
            {format(day, 'd')}
          </span>
          {dayHasEvents && (
            <div className="mt-1 h-1 w-1 bg-blue-500 rounded-full mx-auto"></div>
          )}
        </div>
      );
    };
  
    if (period === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start, end });
  
      return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-7 gap-px border-b border-gray-200">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center font-semibold text-sm py-2 bg-gray-50">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px">
            {days.map((day) => (
              <button
                key={day.toISOString()}
                onClick={() => setCurrentDate(day)}
                disabled={isDateDisabled(day)}
                className={cn(
                  "h-24 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors",
                  isEqual(day, currentDate) ? "bg-blue-50" : "hover:bg-gray-50",
                  isDateDisabled(day) && "opacity-50 cursor-not-allowed"
                )}
              >
                {renderDayContent(day)}
              </button>
            ))}
          </div>
        </div>
      );
    } else if (period === 'month') {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start, end });
  
      return (
        <div className="bg-white rounded-lg shadow overflow-hidden ">
          <div className="grid grid-cols-7 gap-px border-b border-gray-200 ">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center font-semibold text-sm py-2 bg-gray-50">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px">
            {days.map((day) => (
              <button
                key={day.toISOString()}
                onClick={() => setCurrentDate(day)}
                disabled={isDateDisabled(day)}
                className={cn(
                  "h-24 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors",
                  isEqual(day, currentDate) ? "bg-blue-50" : "hover:bg-gray-50",
                  !isSameMonth(day, currentDate) && "bg-gray-100",
                  isDateDisabled(day) && "opacity-50 cursor-not-allowed"
                )}
              >
                {renderDayContent(day)}
              </button>
            ))}
          </div>
        </div>
      );
    }
    
  
    return null;
  };
  if (showInitialDialog) {
    return (
      <Dialog open={showInitialDialog} onOpenChange={setShowInitialDialog}>
        <DialogContent className="sm:max-w-[425px]  text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>{translationsKeys.selectCompanyDepartment}</DialogTitle>
            <DialogDescription>
              {translationsKeys.pleaseSelectCompanyDepartmentToView}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {Data && Data.length > 0  && (
              <div className="space-y-2">
              <Label htmlFor="company">{translationsKeys.namecompany} </Label>
              <Select name="company" value={formData.company} onValueChange={(value) => handleInputChange({ target: { name: 'company', value } })}>
                <SelectTrigger>
                  <SelectValue placeholder={translationsKeys.SelectCompany} />
                </SelectTrigger>
                <SelectContent>
                  {Data.map((company) => (
                    <SelectItem key={company._id} value={company._id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            )}
            {formData.company && departments.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="department">{translationsKeys.namedepartment}</Label>
              <Select name="department" value={formData.department} onValueChange={(value) => handleInputChange({ target: { name: 'department', value } })}>
                <SelectTrigger>
                  <SelectValue placeholder={translationsKeys.selectDepartment} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department._id} value={department._id}>{department.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          </div>
          <DialogFooter>
            <Button onClick={handleInitialDialogSubmit}>{translationsKeys.viewPositions}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    
  }

  if (error) {
    return (
      <>
        <ErrorAlert error={error} />
        <div className="p-6 w-full mx-auto overflow-x-auto">
          <Button onClick={handleBrowseOtherDepartments}>
            {translationsKeys.browseOtherDepartmentPositions}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
    {isLoading && (
      <div className="fixed top-0 left-0 h-0.5 right-0 z-50">
        <Progress value={progress} className="w-full h-0.5" />
      </div>
    )}
       <Card className="w-full mx-auto shadow-lg rounded-lg overflow-hidden" >
               <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
  <div>
    <CardTitle>Create Schedule</CardTitle>
    <CardDescription>
      Manage your products and view their sales performance.
    </CardDescription>
  </div>
  <div className="flex space-x-2 w-full sm:w-auto justify-end">
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="bg-green-500 text-white hover:bg-green-600">
          Export
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="grid gap-4">
          <h4 className="font-medium leading-none">Export Options</h4>
          <div className="grid gap-2">
            <Button onClick={() => exportSchedule('pdf')} className="w-full">Export as PDF</Button>
            <Button onClick={() => exportSchedule('csv')} className="w-full">Export as CSV</Button>
            <Button onClick={() => exportSchedule('excel')} className="w-full">Export as Excel</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
    <Button 
      onClick={saveChanges} 
      className="bg-blue-500 text-white hover:bg-blue-600"
      disabled={isLoading}
    >Save Changes
      {isLoading ? (
        <Loader2 className="ml-2 mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Plus className=" ml-2 mr-2 h-4 w-4" /> 
      )}
    </Button>
  </div>
</CardHeader>
                <CardContent>
                <div className="p-6 w-full mx-auto overflow-x-auto " >
                <div className="flex flex-col mb-10 sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
          <Button 
            onClick={handleBrowseOtherDepartments}
            >          
            {translationsKeys.browseOtherDepartmentPositions}
          </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="period" className="text-sm font-medium text-gray-700">Planning Period</Label>
            <Select name="period" value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px] bg-white border-gray-300 text-gray-700">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <Button 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors duration-200" 
            onClick={() => handleDateChange('prev')}
            disabled={startDate && isBefore(addDays(currentDate, -1), startDate) } 
                      >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous {period}
          </Button>
          <h2 className="text-2xl font-semibold text-gray-800">
            {period === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
            {period === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMMM d, yyyy')}`}
            {period === 'month' && format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors duration-200" 
            onClick={() => handleDateChange('next')}
            disabled={endDate && isBefore(new Date(endDate), addDays(currentDate, 1))}
            >
            Next {period} <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 ">
          {renderCalendar()}
        </div>

      <DragDropContext className=" flex flex-col w-full max-w mx-auto"  onDragEnd={onDragEnd}>
      <Droppable droppableId="employees" direction="horizontal">
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="flex mb-6 pb-2 overflow-x-auto"
        >
          {availableEmployees.length > 0 ? (
            availableEmployees
              .sort((a, b) => 
                positions.findIndex(p => p.id === a.position) - positions.findIndex(p => p.id === b.position)
              )
              .map((employee, index) => (
                <Draggable key={employee.id} draggableId={employee.id} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={cn("flex flex-col items-center p-4 mr-4 w-40 h-48 flex-shrink-0", employee.colour)}
                    >
                      <Avatar className="w-24 h-24 mb-2">
                        <AvatarImage src={employee.picture} alt={employee.name} />
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="font-bold text-center">{employee.name}</p>
                      <p className="text-sm text-gray-500">
                        {positions.find(p => p.id === employee.position.id)?.name || 'Unknown Position'}
                      </p>
                    </Card>
                  )}
                </Draggable>
              ))
          ) : (
            <Card className="flex flex-col items-center justify-center p-4 mr-4 w-40 h-48 flex-shrink-0 bg-gray-100">
              <Avatar className="w-24 h-24 mb-2">
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              <p className="font-bold text-center text-gray-400">No Employee</p>
              <p className="text-sm text-gray-400">Employees place</p>
            </Card>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-40 h-48 flex-shrink-0">
                <Plus className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">Add Employee</h4>
                <Input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <div className="max-h-48 overflow-y-auto">
                  {searchResults.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleAddEmployee(employee)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={employee.picture} alt={`${employee.firstName} ${employee.lastName}`} />
                          <AvatarFallback>{`${employee.firstName} ${employee.lastName}`.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{`${employee.firstName} ${employee.lastName}`}</span>
                      </div>
                      <Button size="sm">Add</Button>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {provided.placeholder}
        </div>
      )}
    </Droppable>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <div className="flex">
              <div className="w-40 flex-shrink-0">
                <div className="bg-gray-800 text-white p-2 font-bold h-10 flex items-center justify-center">
                  Position
                </div>{positions.map(position => (
              <div key={position.id} style={{ height: `${Math.max(5, shifts[position.id]?.length || 0) * 48}px` }}
               className=" flex-grow overflow-x-auto bg-slate-100 border-slate-300 text-slate-800 p-2 font-semibold h-48 flex items-center justify-center">
                {position.name}
              </div>
            ))}
          </div>
          <div className="flex-grow">
          <div className="relative overflow-x-auto bg-white rounded-lg shadow" style={{ width: `${HOURS_IN_DAY * CELL_WIDTH}px` }}>
              <div ref={timeHeaderRef} className="sticky top-0 z-10 flex bg-gray-100">
                {Array.from({ length: HOURS_IN_DAY }, (_, i) => (
                  <div key={i} className="flex-shrink-0 w-[60px] p-2 text-center font-bold border-r border-gray-200">
                    {format(addMinutes(startOfDay(currentDate), i * MINUTES_IN_HOUR), 'HH:mm')}
                  </div>
                ))}
              </div>
              </div>
            {positions.map(position => (
              <Droppable key={position.id} droppableId={`${position.id}`} direction="vertical">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className=" flex-grow overflow-x-auto bg-white border-t  border-slate-300 relative"
                    style={{ height: `${Math.max(5, shifts[position.id]?.length || 0) * 48}px` }}
                  >
                    {shifts[position.id]?.map((employee, index) => (
                      <Draggable 
                        key={`${employee.id}-${index}`}
                        draggableId={`${employee.id}-${index}`} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn("absolute flex flex-col p-2 bg-red-100 border-red-300 text-red-800 shadow-md group transition-all duration-200 hover:z-10 hover:shadow-lg",employee.colour)}
                            style={{
                              left: `${calculateShiftPosition(format(employee.startTime, 'HH:mm'))}px`,
                              width: `${calculateShiftWidth(format(employee.startTime, 'HH:mm'), format(employee.endTime, 'HH:mm'))}px`,
                              top: `${index * 70}px`,
                              ...provided.draggableProps.style,
                            }}
                            onMouseDown={(e) => handleMouseDown(e, position.id, index)}
                          >
                             <div
                        className="absolute top-0 left-0 w-[10px] h-full cursor-ew-resize"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleMouseDown(e, position.id, index, 'left');
                        }}
                      />
                      <div
                        className="absolute top-0 right-0 w-[10px] h-full cursor-ew-resize"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleMouseDown(e, position.id, index, 'right');
                        }}
                      />
                             <CardContent className="p-1 flex flex-col justify-between h-full">
                                <div className="flex justify-between items-center">
                                  <h3 className="text-sm font-semibold truncate mr-2">{employee.name}</h3>
                                  <div className="flex items-center text-xs text-gray-600">
                                      <Clock className="w-3 h-3 mr-1" />
                                      <span>{Math.abs(differenceInHours(employee.endTime, employee.startTime) )} hours</span>
                                      </div>
                                </div>
                            <div className="flex justify-between items-center text-xs ">
                            <div className="space-y-1">
                            <span className="group-hover:hidden">{format(employee.startTime, 'HH:mm')}</span>
                                <Input
                                  id={`start-${employee.id}-${index}`}
                                  type="datetime-local"
                                  value={employee.startTime}
                                  onChange={(e) => handleShiftChange(position.id, index, e.target.value, employee.endTime)}
                                  className=" h-5 px-2 text-xs hidden group-hover:inline-block"
                                />
                              </div>
                              <div className="space-y-1">
                              <span className="group-hover:hidden">{format(employee.endTime, 'HH:mm')}</span>
                                <Input
                                  id={`end-${employee.id}-${index}`}
                                  type="datetime-local"
                                  value={employee.endTime}
                                  onChange={(e) => handleShiftChange(position.id, index, employee.startTime, e.target.value)}
                                  className="h-5 px-2 text-xs hidden group-hover:inline-block"
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute -top-2 -right-2 h-5 w-5 bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                              onClick={() => removeShift(position.id, index)}
                            >
                              <X className="h-3 w-3 text-red-600" />
                            </Button>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                  
                )}
              </Droppable>
              
            ))}
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
    </CardContent>
    </Card>
    </>
  );
};

export default CreateSchedule;