import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/ui/select";
import { selectAuth } from '@/store/slices/authSlice';
import { useToast } from "@/hooks/use-toast";
import { scheduleApi } from '@/services/api/scheduleApi';
import { departmentApi } from '@/services/api/departmentApi';
import { eachDayOfInterval, format } from 'date-fns';
import useTranslation from '@/hooks/useTranslation';
import ErrorAlert from '@/components/ErrorAlert';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/ui/avatar';
import { ScrollArea } from '@/app/ui/scroll-area';
import { useNavigate } from 'react-router-dom';



const ScheduleList = () => {
  const { toast } = useToast();
  const { user } = useSelector(selectAuth);
  const [schedules, setSchedules] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showInitialDialog, setShowInitialDialog] = useState(true);
  const [showScheduleDialog, setshowScheduleDialog] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [Data, setData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [formData, setFormData] = useState({
    company:'',
    department:'',
  });
  const navigate = useNavigate();
  const { t, language, getTranslations } = useTranslation();
  const [translationsKeys, setTranslationsKeys] = useState({});
  const formatDate = (dateString) => format(new Date(dateString), 'MMM dd, yyyy');
  const formatTime = (dateString) => format(new Date(dateString), 'HH:mm');
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
      ];
      const newTranslations = await getTranslations(keys);
      setTranslationsKeys(newTranslations);
    };
    fetchTranslations();
  }, [language, getTranslations]);
  
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
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  useEffect(() => {
    if (!showInitialDialog) {
      fetchSchedules();
    }
  }, [showInitialDialog,selectedCompany, selectedDepartment]);


  useEffect(() => {
    if (formData.company) {
      const selectedCompany = Data.find(c => c._id === formData.company);
      setDepartments(selectedCompany ? selectedCompany.department : []);
    }
  }, [formData.company, Data]);
  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const result = await scheduleApi.getSchedules(formData);
      if (result.data.schedules.length === 0) {
        toast({
          title: translationsKeys.unavailableData,
          description: translationsKeys.departmentScheduleNull,
        });
      }
      setSchedules(result.data.schedules);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setError(translationsKeys.failedScheduleFetch);
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

  const filterAndSortSchedules = () => {
    let filtered = schedules.filter(schedule =>
      schedule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredSchedules(filtered);
  };

  const handleSort = (field) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleView = async (scheduleId) => {
    try {
        const response=await scheduleApi.getSchedule(scheduleId);
        setSchedule(response.data.schedule);
        setshowScheduleDialog(true);
    } catch (error) {
        
    }
  };
  
  if (showScheduleDialog) {
    const days = eachDayOfInterval({ start: new Date(schedule.startDate), end: new Date(schedule.endDate) });
    const employees = Array.from(new Set(schedule.dayShift.flatMap(day => day.employeesShifts.map(shift => shift.userprofile.firstName + ' ' + shift.userprofile.lastName))));

    return (
        <Dialog open={showScheduleDialog} onOpenChange={setshowScheduleDialog}>
        <DialogContent className="max-w-7xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold mb-4">
              Schedule: {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[calc(90vh-200px)]">
            <Table className="border">
              <TableHeader>
                <TableRow >
                  <TableHead className="border">Date</TableHead>
                  {employees.map((employee, index) => (
                    <TableHead key={employee} className="text-center border-r border-l">
                      <div className="flex flex-col items-center space-y-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://i.pravatar.cc/150?img=${index + 1}`} alt={employee} />
                          <AvatarFallback>{employee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span>{employee}</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {days.map(day => {
                  const dayShift = schedule.dayShift.find(shift => new Date(shift.day).toDateString() === day.toDateString());
                  return (
                    <TableRow className="mr-2" key={day.toISOString()}>
                      <TableCell  className="font-medium border ">{formatDate(day)}</TableCell>
                      {employees.map((employee, index) => {
                        const shift = dayShift?.employeesShifts.find(shift => 
                          `${shift.userprofile.firstName} ${shift.userprofile.lastName}` === employee
                        );
                        if (shift) {
                          return (
                            <TableCell key={employee} className={`${"bg-"+shift.shift.position.colour} border`}>
                              <div className="text-sm">
                                <div className="font-semibold">{shift.shift.position.name}</div>
                                <div>{formatTime(shift.shift.scheduledStartTime)} - {formatTime(shift.shift.scheduledEndTime)}</div>
                              </div>
                            </TableCell>
                          );
                        }
                        return <TableCell key={employee} ></TableCell>;
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
}

  const handleEdit = (schedule) => {
    const sched=schedule.schedule;
    navigate(`/${language}/CreateSchedule`, {
        state: {
            scheduleId: sched._id,
            scheduleStartDate:new Date(sched.startDate),
            scheduleEndDate:new Date(sched.endDate),
          dep: formData.department
        }
      });
  };

  
  const handleDelete = (scheduleId) => {
    setScheduleToDelete(scheduleId);
    setIsDeleteDialogOpen(true);

  };
  const confirmDelete = async () => {
      try {
        await scheduleApi.deleteSchedule(scheduleToDelete);
        setSchedules(schedules.filter(s => s._id !== scheduleToDelete));
        setIsDeleteDialogOpen(false);
        toast({
          title: "Success",
          description: "Schedule deleted successfully",
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete schedule",
          variant: "destructive",
        });
      }
  };

  const handleBrowseOtherDepartments = () => {
    setShowInitialDialog(true);
    setFormData({ company: '', department: '' });
    setError('');
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
    <Card className="flex flex-col w-full max-w mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{translationsKeys.schedules}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-6 w-full mx-auto overflow-x-auto">
          <Button onClick={handleBrowseOtherDepartments}>{translationsKeys.browseOtherDepartmentSchedules}</Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder={translationsKeys.searchSchedules}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('type')} className="cursor-pointer">
                {translationsKeys.type} {sortBy === 'type' && (sortOrder === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead onClick={() => handleSort('startDate')} className="cursor-pointer">
                {translationsKeys.startDate} {sortBy === 'startDate' && (sortOrder === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead onClick={() => handleSort('endDate')} className="cursor-pointer">
                {translationsKeys.endDate} {sortBy === 'endDate' && (sortOrder === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead>{translationsKeys.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule._id}>
                <TableCell>{schedule.type}</TableCell>
                <TableCell>{new Date(schedule.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(schedule.endDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button onClick={() => handleView(schedule._id)} className="mr-2">{translationsKeys.view}</Button>
                  <Button onClick={() => handleEdit({schedule:schedule})} className="mr-2">{translationsKeys.edit}</Button>
                  <Button onClick={() => handleDelete(schedule._id)} variant="destructive">{translationsKeys.delete}</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>{translationsKeys.confirmDeletion}</DialogTitle>
            <DialogDescription>
              {translationsKeys.areYouSureYouWantToDeleteThePosition} " ?" {translationsKeys.thisActionCannotBeUndone}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDeleteDialogOpen(false)} variant="outline">{translationsKeys.cancel}</Button>
            <Button onClick={confirmDelete} variant="destructive">{translationsKeys.delete}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ScheduleList;