import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Progress } from "@/app/ui/progress";
import { CalendarDays, Clock, DollarSign, TrendingUp, MapPin, Briefcase, AlertCircle, Coffee } from "lucide-react";
import { userApi } from '@/services/api/userApi';
import { format } from 'date-fns';


const UserStats = ({ userId }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await userApi.getStats(userId);
        
        // Extract data from axios response
        const data = response?.data;
        
        // Validate the data
        if (!data) {
          throw new Error('No data received from the API');
        }
        
        setDashboardData(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Handle specific error cases
        if (error.response?.status === 404) {
          setError('User profile not found.');
        } else if (error.response?.status === 401) {
          setError('Session expired. Please login again.');
        } else {
          setError('Failed to load dashboard data. Please try again later.');
        }
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDashboardData();
    } else {
      setError('User ID is required.');
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (dateString) => format(new Date(dateString), 'HH:mm');


  const getPerformanceColor = (rating) => {
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
      {/* Upcoming Shift Card */}
      <Card className="hover:shadow-lg transition-shadow p-2">
    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <div>
            <CardTitle className="text-lg sm:text-xl font-bold text-primary">Be Ready! Your Upcoming Shift Is On</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Make sure to arrive on time</p>
        </div>
        <AlertCircle className="h-6 w-6 text-primary animate-pulse mt-2 sm:mt-0" />
    </CardHeader>
    <CardContent className="space-y-4">
        {dashboardData?.upcomingShift ? (
            <div className="bg-secondary/20 p-3 sm:p-4 rounded-lg">
                {/* Date and Position Section */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        <span className="text-base sm:text-lg font-semibold">
                            {format(dashboardData.upcomingShift.date, 'EEEE d, MMM')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Position:</span>
                        <span className="text-sm sm:text-base font-semibold">
                            {dashboardData.upcomingShift.position?.name || 'Not specified'}
                        </span>
                    </div>
                </div>

                {/* Time Information Grid */}
                <div className="space-y-3">
                    {/* Start and End Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between bg-primary/5 p-2 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Start Time:</span>
                            </div>
                            <span className="text-sm bg-primary/10 px-3 py-1 rounded-full">
                                {formatTime(dashboardData.upcomingShift.scheduledStartTime)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between bg-primary/5 p-2 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">End Time:</span>
                            </div>
                            <span className="text-sm bg-primary/10 px-3 py-1 rounded-full">
                                {formatTime(dashboardData.upcomingShift.scheduledEndTime)}
                            </span>
                        </div>
                    </div>

                    {/* Hours and Break */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between bg-primary/5 p-2 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Expected Hours:</span>
                            </div>
                            <span className="text-sm bg-primary/10 px-3 py-1 rounded-full">
                                {dashboardData.upcomingShift.expectedHours || 'Not specified'} hours
                            </span>
                        </div>

                        <div className="flex items-center justify-between bg-primary/5 p-2 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Coffee className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Break:</span>
                            </div>
                            <span className="text-sm bg-primary/10 px-3 py-1 rounded-full">
                                {dashboardData.upcomingShift.break || 'Not specified'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="text-center py-6">
                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No upcoming shifts scheduled</p>
            </div>
        )}
    </CardContent>
</Card>
      {/* Monthly Earnings Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Stats</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(dashboardData?.monthlyStats?.earnedAmount || 0).toFixed(2)}
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm font-medium">Hours Worked:</span>
            <span className="text-sm">{(dashboardData?.monthlyStats?.hoursWorked || 0).toFixed(1)}h</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium">Shifts Completed:</span>
            <span className="text-sm">{dashboardData?.monthlyStats?.completedShifts || 0}</span>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Performance Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Performance</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Overall Rating</span>
                <span className={`text-sm font-bold ${getPerformanceColor(dashboardData?.weeklyPerformance?.averageRating || 0)}`}>
                  {(dashboardData?.weeklyPerformance?.averageRating || 0).toFixed(1)}/5
                </span>
              </div>
              <Progress 
                value={(dashboardData?.weeklyPerformance?.averageRating || 0) * 20} 
                className="h-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Punctuality</span>
                <div className={getPerformanceColor(dashboardData?.weeklyPerformance?.punctualityScore || 0)}>
                  {(dashboardData?.weeklyPerformance?.punctualityScore || 0).toFixed(1)}/5
                </div>
              </div>
              <div>
                <span className="font-medium">Break Compliance</span>
                <div className={getPerformanceColor(dashboardData?.weeklyPerformance?.breakComplianceScore || 0)}>
                  {(dashboardData?.weeklyPerformance?.breakComplianceScore || 0).toFixed(1)}/5
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStats;