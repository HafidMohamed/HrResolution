import React, { useEffect, useState } from 'react';
import { format, parseISO, isToday } from 'date-fns';
import { Calendar, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from "@/app/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/ui/avatar";
import { Badge } from "@/app/ui/badge";
import { departmentApi } from '@/services/api/departmentApi';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/store/slices/authSlice';
import useTranslation from '@/hooks/useTranslation';
import ErrorAlert from '../ErrorAlert';



const positionColors = {
  '66edada7c779fe26535a3998': 'bg-blue-100 text-blue-800 border-blue-200',
  '66f454a2b58258ae751c8a3a': 'bg-green-100 text-green-800 border-green-200',
  '66f455a4b58258ae751c8a40': 'bg-purple-100 text-purple-800 border-purple-200',
  '66f45564b58258ae751c8a3d': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  '66f45641b58258ae751c8a48': 'bg-pink-100 text-pink-800 border-pink-200',
};
function transformScheduleData(backendResponse) {
  console.log('Backend Response:', backendResponse); // For debugging

  const transformedData = [];

  if (!Array.isArray(backendResponse) || backendResponse.length === 0) {
    console.error('Invalid backend response structure:', backendResponse);
    return transformedData;
  }

  backendResponse.forEach(schedule => {
    if (!schedule || !schedule.dayShift || !Array.isArray(schedule.dayShift)) {
      console.error('Invalid schedule structure:', schedule);
      return;
    }

    schedule.dayShift.forEach(day => {
      if (!day || !day.day || !day.employeesShifts || !Array.isArray(day.employeesShifts)) {
        console.error('Invalid day structure:', day);
        return;
      }

      const date = new Date(day.day).toISOString().split('T')[0];

      day.employeesShifts.forEach(employeeShift => {
        if (!employeeShift || !employeeShift.shift || !employeeShift.userprofile) {
          console.error('Invalid employeeShift structure:', employeeShift);
          return;
        }

        const shift = employeeShift.shift;
        const employee = employeeShift.userprofile;

        transformedData.push({
          date: date,
          position: shift.position ? shift.position.name : 'Unknown Position',
          employeeName: employee.firstName && employee.lastName ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee',
          scheduledStartTime: shift.scheduledStartTime ? new Date(shift.scheduledStartTime).toTimeString().slice(0, 5) : 'N/A',
          scheduledEndTime: shift.scheduledEndTime ? new Date(shift.scheduledEndTime).toTimeString().slice(0, 5) : 'N/A'
        });
      });
    });
  });
  console.log('Transformed Data:', transformedData); // For debugging
  return transformedData;
}
const ScheduleItem = ({ shift }) => (
  <Card className="mb-2 p-2 shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-t-0 border-r-0 border-b-0 rounded-l-md" style={{ borderLeftColor: positionColors[shift.position]?.split(' ')[1]?.replace('text-', '') || 'gray' }}>
    <CardContent className="p-2">
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className={`${positionColors[shift.position]} text-xs font-semibold`}>
          {shift.position.slice(-4)}
        </Badge>
        <Badge variant={shift.isOnline ? "success" : "secondary"} className="text-xs">
          {shift.isOnline ? "Online" : "Offline"}
        </Badge>
      </div>
      <div className="flex items-center space-x-2 text-sm">
        <Clock className="h-4 w-4" />
        <span>{shift.scheduledStartTime} - {shift.scheduledEndTime}</span>
      </div>
    </CardContent>
  </Card>
);

const Schedule = () => {
  const { user } = useSelector(selectAuth);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [showInitialDialog, setShowInitialDialog] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        company:'',
        department:'',
      });
      const { t, language,getTranslations } = useTranslation();
      const [translations, setTranslations] = useState({});
      const [translationsKeys, setTranslationsKeys] = useState({});
      const [Data, setData] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState('');
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
                    company: result.companies[0]._id
                  }));
                }
              }if (result && result.data.company){
                setDepartments(result.data.company.department);
                setFormData(prev => ({
                  ...prev,
                  company: result.data.company._id
                }));
              } else if (user.role.name === 'Department_Manager' || user.role.name === 'Shift_Manager' || user.role.name === 'Employee') {
                if (result.data.department) {
                  console.log(result.data.department);
                  setFormData(prev => ({
                    ...prev,
                    department: result.data.department._id
                  }));
                  setShowInitialDialog(false);
                  fetchSchedules();
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
      useEffect(() => {
        if (!showInitialDialog) {
          fetchSchedules();
        }
      }, [showInitialDialog, selectedCompany, selectedDepartment]);

      useEffect(() => {
        if (formData.company) {
          const selectedCompany = Data.find(c => c._id === formData.company);
          setDepartments(selectedCompany ? selectedCompany.department : []);
        }
      }, [formData.company, Data]);
      const fetchSchedules = async () => {
        try {
          setIsLoading(true);
          const result = await departmentApi.getSchedules(formData);
          const transformedSchedule = transformScheduleData(result.data.schedules);
          setScheduleData(transformedSchedule);
          if (result.data.schedules.length === 0) {
            toast({
              title: translationsKeys.uavailableData,
              description: translationsKeys.departmentPositionNull,
            });
          }
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching positions:", error);
          setError(translationsKeys.failedPositionFetch);
          setIsLoading(false);
        }
      };
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
  const groupedSchedule = scheduleData.reduce((acc, shift) => {
    if (!acc[shift.date]) {
      acc[shift.date] = {};
    }
    acc[shift.date][shift.employeeName] = shift;
    return acc;
  }, {});

  const dates = Object.keys(groupedSchedule).sort();
  const employees = [...new Set(scheduleData.map(shift => shift.employeeName))].sort();

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    return format(date, 'yyyy-MM-dd');
  });

  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };
 if (user.role.name === 'Owner' || user.role.name === 'Admin'){

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
}else if((user.role.name === 'Customer_Company_Owner')){
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
            { departments.length > 0 && (
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
    
}
  const handleBrowseOtherDepartments = () => {
    setShowInitialDialog(true);
    setFormData({ company: '', department: '' });
    setError(''); // Clear any existing errors

};

  if (isLoading) return <div>{translationsKeys.loading}</div>;
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
    <Card className="w-full bg-white dark:bg-gray-800 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">Employee Schedule</CardTitle>
       {!(user.role.name === 'Department_Manager' || user.role.name === 'Shift_Manager' || user.role.name === 'Employee')  && <div className="p-6 w-full mx-auto overflow-x-auto " >
        <Button onClick={handleBrowseOtherDepartments}>{translationsKeys.browseOtherDepartmentPositions}</Button>
            
        </div>}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
      </CardHeader>
      <CardContent className="p-0">
          <div className="flex flex-col w-full max-w mx-auto rounded-lg shadow">
            
            <div className="flex">
              <div className="w-24 flex-shrink-0  bg-white dark:bg-gray-800">
                <div className="h-16 border-b border-r p-2 font-bold text-gray-600 dark:text-gray-300">Dates</div>
                {weekDates.map(date => (
                  <div key={date} className={`h-32  border-b border-r p-2 ${isToday(parseISO(date)) ? 'bg-blue-50 dark:bg-blue-900' : 'bg-gray-50 dark:bg-gray-700'}`}>
                    <div className="flex justify-between items-center space-y-1 text-xs text-gray-600 dark:text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span>{format(parseISO(date), 'EEE')}</span>
                      <span className="font-semibold">{format(parseISO(date), 'MMM dd')}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex-grow overflow-x-auto">
                <div className="flex">
                  {employees.map(employee => (
                    <div key={employee} className="w-48 flex-shrink-0">
                      <div className="h-16 border-b border-r p-2 font-bold flex items-center space-x-2 bg-gray-100 dark:bg-gray-600">
                        <Avatar>
                          <AvatarImage src={groupedSchedule[dates[0]]?.[employee]?.photoUrl} alt={employee} />
                          <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-800 dark:text-white truncate">{employee}</span>
                      </div>
                      {weekDates.map(date => (
                        <div key={`${employee}-${date}`} className={`h-32 border-b border-r p-2 ${isToday(parseISO(date)) ? 'bg-blue-50 dark:bg-blue-900' : ''}`}>
                          {groupedSchedule[date]?.[employee] && (
                            <ScheduleItem shift={groupedSchedule[date][employee]} />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
      </CardContent>
    </Card>
  );
};

export default Schedule;