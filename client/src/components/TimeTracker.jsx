import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/app/ui/dialog";
import { Toaster } from "@/app/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Clock, LogIn, LogOut, Coffee, StopCircle, DollarSign, Delete, ArrowRight } from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';
import axiosInstance from '@/services/http/userAxios';
import { API_BASE_URL,API_BASE } from '@/config/apiConstant';

const TimeTrackerCard = ({ title, icon, color, onClick, disabled }) => (
  <Card 
    className={`w-full cursor-pointer hover:shadow-lg transition-all duration-300 ${color} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
    onClick={disabled ? undefined : onClick}
  >
    <CardHeader>
      <CardTitle className="flex items-center justify-center">
        {React.cloneElement(icon, { className: "w-8 h-8 mr-2" })}
        {title}
      </CardTitle>
    </CardHeader>
  </Card>
);

const NumberPad = ({ onEnter, onBackspace, onNumberClick }) => {
    const numbers = [7, 8, 9, 4, 5, 6, 1, 2, 3, 'backspace', 0, 'enter'];
    return (
      <div className="grid grid-cols-3 gap-1 mt-4">
        {numbers.map((num) => (
          <Button 
            key={num} 
            onClick={() => {
              if (num === 'backspace') onBackspace();
              else if (num === 'enter') onEnter();
              else onNumberClick(num);
            }} 
            variant={num === 'enter' ? 'default' : 'secondary'}
            className={`aspect-square text-3xl font-bold p-0 h-16 rounded-sm ${
              num === 'enter' ? 'bg-green-500 hover:bg-green-600 text-white' :
              num === 'backspace' ? 'bg-red-500 hover:bg-red-600 text-white' :
              'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            {num === 'backspace' ? <Delete className="w-8 h-8" /> : 
             num === 'enter' ? <ArrowRight className="w-8 h-8" /> : 
             num}
          </Button>
        ))}
      </div>
    );
  };

const TimeTracker = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [authID, setAuthID] = useState('');
  const [action, setAction] = useState('');
  const [shiftStatus, setShiftStatus] = useState({ isActive: false, isOnBreak: false });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pay, setPay] = useState(0);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const socket = io(`${API_BASE}`, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => console.log('Connected to server'));
    socket.on('connect_error', (error) => console.error('Connection error:', error));
    socket.on('shiftUpdate', handleShiftUpdate);

    return () => {
      socket.off('shiftUpdate');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  const handleShiftUpdate = (data) => {
    setElapsedTime(Math.floor(data.duration * 3600));
    setPay(data.pay);
    setShiftStatus({
      isActive: data.isActive,
      isOnBreak: data.breaks.some(breakItem => !breakItem.endTime)
    });
  };

  const handleCardClick = (actionType) => {
    setAction(actionType);
    setIsDialogOpen(true);
  };

  const handleNumberClick = (num) => setAuthID(prev => prev + num);
  const handleBackspace = () => setAuthID(prev => prev.slice(0, -1));

  const handleEnter = async () => {
    setIsDialogOpen(false);
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}time-tracking/${action}`, { authID });
      const data  = response.data;
      console.log(data);
      if (action === 'clock-in' &&  response.status === 200 ) {

        setEmployeeInfo({
          name: `${data.userProfile.firstName} ${data.userProfile.lastName}`,
          shiftStart: new Date(data.shift.scheduledStartTime),
          shiftEnd: new Date(data.shift.scheduledEndTime),
        });
        
        const shiftStart = new Date(data.shift.scheduledStartTime);
        const shiftEnd = new Date(data.shift.scheduledEndTime);
        console.log(data);
        toast({
          title: data.message,
          description: (
            <div>
              <p>Welcome, {data.userProfile.firstName} {data.userProfile.lastName}!</p>
              <p>Your shift starts at {shiftStart.toLocaleTimeString()} and ends at {shiftEnd.toLocaleTimeString()}.</p>
              <p>Have a great day at work!</p>
            </div>
          ),
          duration: 5000,
        });
      }
    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action}. Please try again.`,
        variant: "destructive",
      });
    }
    setAuthID('');
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const actions = [
    { title: "Clock In", icon: <LogIn />, color: "bg-green-100", action: 'clock-in' },
    { title: "Clock Out", icon: <LogOut />, color: "bg-red-100", action: 'clock-out' },
    { title: "Start Break", icon: <Coffee />, color: "bg-blue-100", action: 'start-break' },
    { title: "End Break", icon: <StopCircle />, color: "bg-purple-100", action: 'end-break' },
  ];

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-center">Employee Time Tracker</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <TimeTrackerCard
            key={index}
            title={action.title}
            icon={action.icon}
            color={action.color}
            onClick={() => handleCardClick(action.action)}
            disabled={action.disabled}
          />
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Shift</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Clock className="mr-2" />
              <span className="text-2xl font-bold">{formatTime(elapsedTime)}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="mr-2" />
              <span className="text-2xl font-bold">${pay.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {employeeInfo && (
        <Card>
          <CardHeader>
            <CardTitle>{employeeInfo.name}'s Shift</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Start: {employeeInfo.shiftStart.toLocaleTimeString()}</p>
            <p>End: {employeeInfo.shiftEnd.toLocaleTimeString()}</p>
          </CardContent>
        </Card>
      )}

<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{action.replace('-', ' ').toUpperCase()}</DialogTitle>
            <DialogDescription>Enter your Employee ID to {action.replace('-', ' ')}</DialogDescription>
          </DialogHeader>
          <Input
            id="authID"
            value={authID}
            onChange={(e) => setAuthID(e.target.value)}
            placeholder="Enter your Employee ID"
            className="text-center text-4xl h-16 mb-4"
          />
          <NumberPad
            onEnter={handleEnter}
            onBackspace={handleBackspace}
            onNumberClick={handleNumberClick}
          />
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </div>
  );
};

export default TimeTracker;
