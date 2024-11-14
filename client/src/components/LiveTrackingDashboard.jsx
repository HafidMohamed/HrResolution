import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Briefcase, Clock, Timer, Pause, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/ui/avatar';
import { Progress } from '@/app/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/ui/tabs';
import { Badge } from '@/app/ui/badge';
import axios from 'axios';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/store/slices/authSlice';
import { API_BASE } from '@/config/apiConstant';

const formatDuration = (duration) => {
  if (typeof duration !== 'number') return 'N/A';
  const hours = Math.floor(duration);
  const minutes = Math.floor((duration - hours) * 60);
  return `${hours}h ${minutes}m`;
};

const ActiveShiftItem = ({ userprofile, duration, shiftTimeleft, isOnBreak, lastClockIn }) => {
  const clockInTime = new Date(lastClockIn);
  const formattedClockIn = `${clockInTime.getHours().toString().padStart(2, '0')}:${clockInTime.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-4 border-b last:border-b-0">
      <Avatar className="mb-2 sm:mb-0">
        <AvatarImage src={userprofile?.avatar || '/api/placeholder/32/32'} alt={`${userprofile?.firstName} ${userprofile?.lastName}`} />
        <AvatarFallback>{`${userprofile?.firstName?.[0]}${userprofile?.lastName?.[0]}`}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm font-medium">{`${userprofile?.firstName} ${userprofile?.lastName}`}</p>
        <div className="flex items-center text-xs text-muted-foreground">
          {isOnBreak ? <Pause className="mr-1 h-3 w-3" /> : <Play className="mr-1 h-3 w-3" />}
          <span>{isOnBreak ? 'On break' : 'Working'} since {formattedClockIn}</span>
        </div>
      </div>
      <div className="w-full sm:w-24 mt-2 sm:mt-0">
        <Progress value={(duration / (duration + shiftTimeleft)) * 100} className="h-2" />
      </div>
      <div className="text-xs text-muted-foreground mt-2 sm:mt-0">
        <Timer className="mr-1 h-3 w-3 inline" />
        <span>{formatDuration(shiftTimeleft)} left</span>
      </div>
    </div>
  );
};

const TodayShiftItem = ({ userprofile, scheduledStartTime, scheduledEndTime, duration, breakDuration }) => {
  const startTime = new Date(scheduledStartTime);
  const endTime = new Date(scheduledEndTime);
  const formattedStartTime = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
  const formattedEndTime = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-4 border-b last:border-b-0">
      <Avatar className="mb-2 sm:mb-0">
        <AvatarImage src={userprofile?.avatar || '/api/placeholder/32/32'} alt={`${userprofile?.firstName} ${userprofile?.lastName}`} />
        <AvatarFallback>{`${userprofile?.firstName?.[0]}${userprofile?.lastName?.[0]}`}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm font-medium">{`${userprofile?.firstName} ${userprofile?.lastName}`}</p>
        <div className="text-xs text-muted-foreground">
          <Clock className="mr-1 h-3 w-3 inline" />
          <span>{formattedStartTime} - {formattedEndTime}</span>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-2 sm:mt-0">
        <Timer className="mr-1 h-3 w-3 inline" />
        <span>{formatDuration(duration)} (inc. {formatDuration(breakDuration)} break)</span>
      </div>
    </div>
  );
};

const LiveTrackingDashboard = () => {
  const [activeShifts, setActiveShifts] = useState([]);
  const [todayShifts, setTodayShifts] = useState([]);
  const { user } = useSelector(selectAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const socket = io(`${API_BASE}`, {
      withCredentials: true,
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Dashboard connected to server');
      const userPreferences = JSON.parse(localStorage.getItem('userPreferences'));
      userPreferences.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
      socket.emit('subscribe', {userId:user.userId,userPreferences:localStorage.getItem('userPreferences')});
    }); 

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socket.on('shiftUpdate', ({activeShifts,todayShifts}) => {
      console.log('Shift update received:', activeShifts, todayShifts);
      setActiveShifts(activeShifts);
      setTodayShifts(todayShifts);
    });

    return () => {
      socket.off('shiftUpdate');
      socket.emit('unsubscribe', user.userId);
      socket.disconnect();
    };
  }, [user.userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Employee Time Tracking Dashboard</h1>
      
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="relative">
            <Briefcase className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Active Shifts</span>
            <span className="sm:hidden">Active</span>
            <span className="absolute top-0 right-0 -mt-1 -mr-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center animate-pulse">
              {activeShifts.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="today" className="relative">
            <Clock className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Today's Shifts</span>
            <span className="sm:hidden">Today</span>
            <span className="absolute top-0 right-0 -mt-1 -mr-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {todayShifts.length}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
        <Card>
            <CardContent className="p-0">
                {activeShifts.length > 0 ? (
                    activeShifts.map((shift) => (
                        <ActiveShiftItem
                            key={shift._id}
                            userprofile={shift.userprofile}
                            duration={shift.duration}
                            shiftTimeleft={shift.shiftTimeleft}
                            isOnBreak={shift.isOnBreak}
                            lastClockIn={shift.lastClockIn}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">No Active Shifts</p>
                        <p className="text-sm text-muted-foreground/70">There are currently no active shifts.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </TabsContent>
    <TabsContent value="today" className="space-y-4">
        <Card>
            <CardContent className="p-0">
                {todayShifts.length > 0 ? (
                    todayShifts.map((shift) => (
                        <TodayShiftItem
                            key={shift._id}
                            userprofile={shift.userprofile}
                            scheduledStartTime={shift.scheduledStartTime}
                            scheduledEndTime={shift.scheduledEndTime}
                            duration={shift.duration}
                            breakDuration={shift.breakDuration}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">No Scheduled Shifts Today</p>
                        <p className="text-sm text-muted-foreground/70">There are no shifts scheduled for today.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveTrackingDashboard;
