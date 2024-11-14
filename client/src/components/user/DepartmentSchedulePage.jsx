import React from 'react';
import { format } from 'date-fns';
import CurrentDayShift from '../CurrentDayShift';
import DepartmentWeeklySchedule from '../DepartmentWeeklySchedule';
import PersonalSchedule from '../PersonalSchedule';
import CreateSchedule from './CreateSchedule';

const DepartmentSchedulePage = () => {
  const department = { id: 1, name: 'Sales Department' };
  const employees = [
    { id: 1, name: 'John Doe', avatar: '/path/to/avatar1.jpg' },
    { id: 2, name: 'Jane Smith', avatar: '/path/to/avatar2.jpg' },
    // ... more employees
  ];
  const schedules = [
    { employeeId: 1, date: '2024-09-14', shift: 'Morning', startTime: '2024-09-14T09:00:00', endTime: '2024-09-14T17:00:00' },
    { employeeId: 2, date: '2024-09-13', shift: 'Afternoon', startTime: '2024-09-13T19:00:00', endTime: '2024-09-14T01:00:00' },
    { employeeId: 2, date: '2024-09-16', shift: 'Afternoon', startTime: '2024-09-16T19:00:00', endTime: '2024-09-16T01:00:00' },
    { employeeId: 1, date: '2024-09-16', shift: 'Afternoon', startTime: '2024-09-16T19:00:00', endTime: '2024-09-16T01:00:00' },

    // ... more schedules
  ];
  const currentUserSchedule = schedules.find(s => s.employeeId === 1 && s.date === format(new Date(), 'yyyy-MM-dd'));


  return (
    <>
    <CreateSchedule/>
    <DepartmentWeeklySchedule
          department={department}
          employees={employees}
          schedules={schedules} />
                <PersonalSchedule schedules={schedules.filter(s => s.employeeId === 1)} />

          <CurrentDayShift schedule={currentUserSchedule} /></>

  );
};

export default DepartmentSchedulePage;