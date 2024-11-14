// components/Layout.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/ui/avatar";
import { Bell, MessageSquare, LogOut, User, Menu } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth } from '../store/slices/authSlice';
import { performLogout } from '../utils/logoutUtil';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/ui/dropdown-menu";
import useTranslation from '../hooks/useTranslation';
import LanguageSelector from '../components/LanguageSelector';
import { ModeToggle } from './mode-toggle';
import Footer from './Footer';
import { Toaster } from '@/app/ui/toaster';
import NotificationMenu from './NotificationMenu';
import SideBar from './SideBar';




const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(selectAuth);
  const avatarUrl = 'https://github.com/shadcn.png';
  const [isExpanded, setIsExpanded] = useState(true);
  const { t, getTranslations, language } = useTranslation();
  const [translations, setTranslations] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const toggleSideBar = () => {
    setIsExpanded(!isExpanded);
  };

  

  const handleSignIn = () => {
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

  const renderAuthButtons = () => (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" onClick={handleSignIn}>{translations.signIn}</Button>
      <Button variant="outline" onClick={handleSignUp}>{translations.signUp}</Button>
    </div>
  );

  const renderUserMenu = () => (
    <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer">

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={avatarUrl} alt={user.username} />
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
  );


  return (
    
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
<div className="bg-white shadow-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
      <header className="shadow-lg p-4">
        <div className="max-w-10xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
          {isAuthenticated && <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer"
              onClick={toggleSideBar}
            >
              <Menu className="h-6 w-6" />
            </Button>
            </div>}
            <h1 className="text-2xl ml-5 font-bold text-gray-800 dark:text-white">HR Resolutions</h1>
          </div>
          {!isMobile && (
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <NotificationMenu />

                  <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer">

                  <Button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer" variant="ghost" size="icon">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                  </div>
                  {renderUserMenu()}
                </>
              ) : renderAuthButtons()}
                            <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer">

              <LanguageSelector />
              </div>
              <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer">

              <ModeToggle />
              </div>
            </div>
          )}
         {isMobile && isAuthenticated && (
  <DropdownMenu>
    <NotificationMenu />
  </DropdownMenu>
)}
        </div>
      </header>
        <div className="flex flex-1 overflow-hidden">
        {isAuthenticated ? <SideBar isExpanded={isExpanded} setIsExpanded={setIsExpanded}  /> : null}
        <main className="flex-1 overflow-x-auto overflow-y-auto p-4 md:p-6">
          {children}
          <Toaster />
        </main>
      </div>
      {isMobile && (
        <footer className="sticky bottom-0 left-0 right-0 p-2 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
          <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer">

 {isAuthenticated && <Button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer" variant="ghost" size="icon">
  <MessageSquare className="h-5 w-5" />
</Button>}
</div>
          {isAuthenticated ? renderUserMenu() : renderAuthButtons()}
          <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer">

              <LanguageSelector />
              </div>
              <div className="p-2 rounded-lg hover:bg-gray-100 hover:bg-gray-950 cursor-pointer">

              <ModeToggle />
              </div>
        </footer>
      )}
      </div>
    </div>
  );
};

export default Layout;
