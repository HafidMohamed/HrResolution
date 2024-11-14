import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ScheduleEmailTemplate = ({ scheduleType, shifts }) => {
  return (
    <div className="bg-white p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>New {scheduleType} Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Your new schedule has been created. Here are your upcoming shifts:</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Position</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((shift, index) => (
                <TableRow key={index}>
                  <TableCell>{shift.date}</TableCell>
                  <TableCell>{shift.startTime}</TableCell>
                  <TableCell>{shift.endTime}</TableCell>
                  <TableCell>{shift.position}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleEmailTemplate;