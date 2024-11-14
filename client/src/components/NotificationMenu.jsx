import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/ui/popover";
import { ScrollArea } from "@/app/ui/scroll-area";
import { useNavigate } from 'react-router-dom';
import useTranslation from '@/hooks/useTranslation';
import { notiApi } from '@/services/api/notificationsApi';
import { selectAuth } from '@/store/slices/authSlice';
import { useSelector } from 'react-redux';

const NotificationMenu = () => {
  const { t, getTranslations, language } = useTranslation();
  const { user } = useSelector(selectAuth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notiApi.getAllNotifications();
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.notifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await notiApi.markNotificationRead(notification._id);
      setUnreadCount(prevCount => prevCount - (notification.isRead ? 0 : 1));
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n._id === notification._id ? { ...n, isRead: true } : n
        )
      );
      navigate(`/${language}/notifications/${notification._id}`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleShowMore = () => {
    navigate(`/${language}/notifications`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 sm:w-72 p-0" align="end">
        <ScrollArea className="h-[280px] sm:h-[320px]">
          {notifications.slice(0, 10).map((notification) => (
            <div
              key={notification._id}
              className="p-2.5 border-b cursor-pointer hover:bg-gray-100 relative"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex justify-between items-start mb-0.5 gap-1.5">
                <h3 className="font-semibold text-xs">{notification.type}</h3>
                <span className="text-[10px] text-gray-400 shrink-0">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{notification.content}</p>
              {!notification.isRead && (
                <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
              )}
            </div>
          ))}
          {notifications.length > 10 && (
            <Button 
              variant="ghost" 
              className="w-full h-7 text-xs text-blue-500 hover:text-blue-700"
              onClick={handleShowMore}
            >
              Show more
            </Button>
          )}
          {notifications.length === 0 && (
            <p className="p-2.5 text-center text-xs text-gray-500">No new notifications</p>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationMenu;