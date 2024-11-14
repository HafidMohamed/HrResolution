import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/app/ui/scroll-area"

const ModernCalendarShiftCarousel = ({ shifts }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    setCalendarDays(days);
  }, [currentDate]);

  const goToPreviousMonth = () => setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));

  const getShiftForDay = (day) => shifts.find(shift => isSameDay(parseISO(shift.date), day));

  const isSameDay = (date1, date2) => 
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();

  return (
    <Card className="w-full max-w-7xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between bg-white bg-opacity-70 p-4">
        <CardTitle className="text-2xl font-bold text-purple-700">Shift Calendar</CardTitle>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-lg">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="flex">
            {calendarDays.map((day, index) => {
              const shift = getShiftForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDay = isToday(day);

              return (
                <div 
                  key={index} 
                  className={`flex-shrink-0 w-20 h-32 border-r last:border-r-0 ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-100'
                  } ${isTodayDay ? 'border-2 border-blue-500' : ''}`}
                >
                  <div className={`text-center py-1 ${
                    isTodayDay ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  {shift ? (
                    <div 
                      className={`h-24 p-2 overflow-hidden text-xs ${
                        shift.position.colour ? `bg-${shift.position.colour}-200` : 'bg-gray-200'
                      }`}
                    >
                      <p className="font-semibold">{shift.position.name}</p>
                      <p>{format(parseISO(shift.beginTime), 'HH:mm')} - {format(parseISO(shift.endTime), 'HH:mm')}</p>
                    </div>
                  ) : (
                    <div className="h-24 p-2 bg-gray-100 text-xs flex items-center justify-center">
                      <p className="text-gray-500">Free Day</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ModernCalendarShiftCarousel;