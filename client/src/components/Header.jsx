import React, {useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/ui/avatar";
import { Bell, MessageSquare, LogOut, User,Menu } from 'lucide-react';
import { useSelector,useDispatch } from 'react-redux';
import authSlice, { logout, selectAuth } from '../store/slices/authSlice';
import { performLogout } from '../utils/logoutUtil';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/ui/dropdown-menu";
import { authApi } from '@/services/api/authApi';
import useTranslation from '../hooks/useTranslation';
import LanguageSelector from '../components/LanguageSelector';
import { ModeToggle } from './mode-toggle';

const Header = ({ isExpanded, setIsExpanded }) => {
  const { t, getTranslations, language } = useTranslation();
const [translations, setTranslations] = useState({});

useEffect(() => {
  const updateTranslations = async () => {
    const newTranslations = {
      signIn: t('signIn', 'Sign In'),
      signUp: t('signUp', 'Sign Up'),
      profileUpdateSuccessful: t('profileUpdateSuccessful', 'Profile update successful'),
    };
    setTranslations(prev => ({
      ...prev,
      ...newTranslations
    }));
  };

  updateTranslations();
}, [language, t]);

useEffect(() => {
  const fetchTranslations = async () => {
    const keys = ['notifications', 'profile', 'logout', 'newMessage'];
    const newTranslations = await getTranslations(keys);
    setTranslations(prev => ({
      ...prev,
      ...newTranslations
    }));
  };
  fetchTranslations();
}, [language, getTranslations]);
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // This should be replaced with actual authentication logic
  const { user, isAuthenticated, loading, error } = useSelector(selectAuth);
  // This should be replaced with actual user data
  const avatarUrl = 'https://github.com/shadcn.png' ;

  const handleSignIn = () => {
    // For demonstration purposes, we're setting isAuthenticated to true here
    navigate(`/${language}/login`);
  };

  const handleSignUp = () => {
    navigate(`/${language}/register`);
  };
 

  const handleLogout = () => {
    performLogout(navigate, language);

  };
  const handleProfileClick = async () => {
    navigate(`/${language}/profile`);
  };

  
  return (
    <header className="bg-white shadow-lg p-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
      <div className="max-w-10xl mx-auto flex justify-between items-center">
      <div className="flex items-center ml-1">
        <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </Button>
          </div>
          <h1 className="text-2xl ml-5 font-bold text-gray-800 dark:text-white">HR Resolutions</h1>
        </div>
        <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <div className="flex items-center space-x-4 ">
                  <NotificationMenu />
            <DropdownMenu >
              <DropdownMenuTrigger asChild>
                <Button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer" variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel> {translations.notifications}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>{translations.newMessage}</DropdownMenuItem>
                <DropdownMenuItem>{translations.profileUpdateSuccessful}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer" variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
            <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar >
                  <AvatarImage  src={avatarUrl} alt={user.username} />
                  <AvatarFallback>{user.username}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{translations.profile}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{translations.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4 ">
            <Button variant="ghost" onClick={handleSignIn}>{translations.signIn}</Button>
            <Button variant="outline" onClick={handleSignUp}>{translations.signUp}</Button>
          </div>
        )}
        <div className="flex items-center space-x-4">
        <LanguageSelector />
        <ModeToggle />
        </div>
        </div>
      </div>
    </header>
  );
};

export default Header;