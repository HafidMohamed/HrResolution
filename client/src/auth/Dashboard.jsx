import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/app/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/ui/avatar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useSelector } from 'react-redux';
import { selectAuth } from '../store/slices/authSlice';
import LiveTrackingDashboard from '@/components/LiveTrackingDashboard';
import { userApi } from '@/services/api/userApi';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import UserStats from '@/components/UserStats';



const DashboardPage = () => {
  const { user, isAuthenticated, loading } = useSelector(selectAuth);
  const [error, setError] = useState('');
  const formatTime = (dateString) => format(new Date(dateString), 'HH:mm');
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);



  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  if (!user ) {
    return <div>Unable to fetch user data. Please try logging in again.</div>;
  }
  const data = [
    { name: 'Mon', hours: 8 },
    { name: 'Tue', hours: 7 },
    { name: 'Wed', hours: 9 },
    { name: 'Thu', hours: 8 },
    { name: 'Fri', hours: 6 },
  ];

  // Mock data for working today
  const workingToday = [
    { name: 'Alice Johnson', avatar: '/avatar1.png' },
    { name: 'Bob Smith', avatar: '/avatar2.png' },
    { name: 'Charlie Brown', avatar: '/avatar3.png' },
  ];

  // Calculate total working hours
  const totalHours = data.reduce((sum, day) => sum + day.hours, 0);
  



  return (
    <>
    
        <div className="px-4 py-6 sm:px-0">
          <UserStats userId={user.userId} />

          {/* Who's Working Today */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Who's Working Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <LiveTrackingDashboard />
              </div>
            </CardContent>
          </Card>
        </div>
      </>
  );
};

export default DashboardPage;