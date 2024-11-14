import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";

const CurrentDayShift = ({ schedule }) => {
  const today = new Date();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Today's Shift - {format(today, 'MMMM d, yyyy')}</CardTitle>
      </CardHeader>
      <CardContent>
        {schedule ? (
          <div className="text-center">
            <p className="text-2xl font-bold mb-2">{schedule.shift} Shift</p>
            <p className="text-lg">
              {format(new Date(schedule.startTime), 'HH:mm')} - {format(new Date(schedule.endTime), 'HH:mm')}
            </p>
          </div>
        ) : (
          <p className="text-center text-lg text-gray-500">No shift scheduled for today</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentDayShift;