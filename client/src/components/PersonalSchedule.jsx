import React, { useState, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, CoffeeIcon, CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { useSelector } from 'react-redux';
import { selectAuth } from '@/store/slices/authSlice';
import { shiftApi } from '@/services/api/shiftApi';
import ErrorAlert from './ErrorAlert';

const PersonalSchedule = () => {
  const { user } = useSelector(selectAuth);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState([]);
  const [expandedShift, setExpandedShift] = useState(null);
  const carouselRef = useRef(null);
  const [startX, setStartX] = useState(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await shiftApi.getShifts(user.userId);
        console.log(response.Shifts);
        if (isMounted && response && response.Shifts) {
          setShifts(response.Shifts);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching shifts:", error);
        if (isMounted) {
          setError("Failed to fetch shifts");
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
    if (carouselRef.current) {
      const middleCard = carouselRef.current.querySelector('.middle-card');
      if (middleCard) {
        middleCard.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }
  }, [currentDate]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <ErrorAlert error={error} />;

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const handleMouseDown = (e) => {
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setStartX(null);
  };

  const handleMouseUp = () => {
    setStartX(null);
  };

  const handleMouseMove = (e) => {
    if (!startX) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const toggleShiftExpansion = (shift) => {
    setExpandedShift(expandedShift === shift ? null : shift);
  };

  const renderShiftCard = (day) => {
    const shift = shifts.find(s => isSameDay(parseISO(s.date), day));
    const isCurrentDay = isToday(day);
    const cardStyle = shift ? { backgroundColor: shift.position.colour } : {};
    
    return (
      <div 
        key={format(day, 'yyyy-MM-dd')} 
        className={`flex-shrink-0 ${
      isCurrentDay ? 'w-80 h-60 middle-card' : 'w-64 h-40'} p-4 m-2 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl`}
        style={cardStyle}
      >
        <h3 className={`font-bold mb-2 ${isCurrentDay ? 'text-2xl' : 'text-lg'}`}>
          {isCurrentDay ? ['Today ' ,format(day, 'd ,MMM')] :format(day, 'EEEE d, MMM yy')}
        </h3>        
        {shift ? (
          <>
           <p className={`mb-1 ${isCurrentDay ? 'text-lg' : 'text-sm'}`}>{shift.position.name}</p>
            <p className={`mb-1 ${isCurrentDay ? 'text-lg' : 'text-sm'}`}>
              {format(shift.scheduledStartTime, 'HH:mm')} - {format(shift.scheduledEndTime, 'HH:mm')}
            </p>
          </>
        ) : (
          <p className={`mb-1 ${isCurrentDay ? 'text-lg' : 'text-sm'}`}>Free Day</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPreviousMonth} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
        <button onClick={goToNextMonth} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
          <ChevronRight size={24} />
        </button>
      </div>

      <div 
        ref={carouselRef}
        className="flex overflow-x-auto pb-4"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {daysInMonth.map(renderShiftCard)}
      </div>

      <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">Completed Shifts</h3>
            {shifts.map((shift, index) => (
              <Card key={index} onClick={() => toggleShiftExpansion(shift)} className="mb-4 bg-gray-200 bg-opacity-50 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-1" />
                      <span>{format(shift.date, 'MMM d')}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-1" />
                      <span>{format(shift.scheduledStartTime, 'HH:mm')}</span>
                    </div>
                    <div className="hidden sm:block flex-grow border-t-2 border-gray-300"></div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-1" />
                      <span>{format(shift.scheduledEndTime, 'HH:mm')}</span>
                    </div>
                    <div className="flex items-center">
                      <CoffeeIcon className="h-5 w-5 mr-1" />
                      <span>{shift.pause}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-1" />
                      <span>{shift.duration}</span>
                    </div>
                    {expandedShift === shift ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                  
                  {expandedShift === shift && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-300">
                      <p><strong>Position:</strong> {shift.position.name}</p>
                      <p><strong>Description:</strong> {shift.position.description}</p>
                      <p><strong>Hourly Rate:</strong> ${shift.position.hourlyRate}</p>
                      <p><strong>Break:</strong> {shift.pause}</p>
                      <p><strong>Total Hours:</strong> {shift.duration} hours</p>
                      <p><strong>Is Done:</strong> {shift.isDone ? 'Yes' : 'No'}</p>
                      <p><strong>Is Published:</strong> {shift.isPublished ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
    </div>
  );
};

export default PersonalSchedule;