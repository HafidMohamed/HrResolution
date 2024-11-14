import React, {useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { ScrollArea } from "@/app/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";


const DepartmentWeeklySchedule = ({ department, employees, schedules }) => {
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

    const weekDays = [...Array(7)].map((_, index) => addDays(currentWeekStart, index));
  
    const getScheduleForEmployeeAndDay = (employeeId, date) => {
      return schedules.find(s => 
        s.employeeId === employeeId && 
        format(new Date(s.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
    };
  
    const getScheduleColor = (schedule) => {
      if (!schedule) return 'bg-gray-100';
      switch(schedule.shift) {
        case 'Morning': return 'bg-blue-100';
        case 'Afternoon': return 'bg-green-100';
        case 'Night': return 'bg-purple-100';
        default: return 'bg-gray-100';
      }
    };
  
    const goToPreviousWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    const goToNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{department.name} - Weekly Schedule</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold">
              {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-2 mb-4">
            <div className="font-semibold">Employee</div>
            {weekDays.map((day, index) => (
              <div key={index} className="font-semibold text-center">
                {format(day, 'EEE')}<br />
                {format(day, 'dd/MM')}
              </div>
            ))}
          </div>
          <ScrollArea className="h-[calc(100vh-250px)]">
            {employees.map((employee) => (
              <div key={employee.id} className="grid grid-cols-8 gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={employee.avatar} alt={employee.name} />
                    <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{employee.name}</span>
                </div>
                {weekDays.map((day, index) => {
                  const schedule = getScheduleForEmployeeAndDay(employee.id, day);
                  return (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className={`h-12 rounded-md ${getScheduleColor(schedule)} flex items-center justify-center cursor-pointer transition-colors duration-200 hover:opacity-80`}
                          >
                            {schedule && (
                              <span className="text-xs font-semibold">
                                {schedule.shift}
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{schedule ? `${schedule.shift} Shift` : 'No Schedule'}</p>
                          {schedule && (
                            <p>{`${format(new Date(schedule.startTime), 'HH:mm')} - ${format(new Date(schedule.endTime), 'HH:mm')}`}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };
  export default DepartmentWeeklySchedule;
