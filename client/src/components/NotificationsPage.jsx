import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/app/ui/scroll-area";
import { notiApi } from '@/services/api/notificationsApi';
import { selectAuth } from '@/store/slices/authSlice';
import { useSelector } from 'react-redux';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector(selectAuth);

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  const fetchAllNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await notiApi.getAllNotifications(user.userId);
      if (response && response.data && Array.isArray(response.data.notifications)) {
        setNotifications(response.data.notifications);
      } else {
        console.error('Invalid response structure:', response);
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      setError('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notiApi.markNotificationRead(notificationId);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification._id === notificationId ? {...notification, isRead: true} : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (isLoading) {
    return <div>Loading notifications...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <ScrollArea className="h-[600px]">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className="p-4 border-b last:border-b-0"
            >
              <h3 className="font-semibold">{notification.type}</h3>
              <p className="text-sm text-gray-600">{notification.content}</p>
              <span className="text-xs text-gray-400">{new Date(notification.createdAt).toLocaleString()}</span>
              {!notification.isRead && (
                <button
                  className="ml-2 text-xs text-blue-500 hover:underline"
                  onClick={() => handleMarkAsRead(notification._id)}
                >
                  Mark as read
                </button>
              )}
            </div>
          ))
        ) : (
          <div>No notifications found.</div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationsPage;