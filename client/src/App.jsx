import React, { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import {  BrowserRouter as Router, Route, Routes, Outlet, useNavigate } from 'react-router-dom';
import { useNavigate as Navigate  } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import DashboardPage from './auth/Dashboard';
import VerifyEmailPage from './auth/VerifyEmailPage';
import TwoFactorPage from './auth/TwoFactorPage';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth, fetchUserProfile } from './store/slices/authSlice';
import './App.css'
import DebugAuthState from './components/DebugAuthState';
import ProfilePage from './components/user/ProfilePage';
import Layout from './components/Layout';
import CreateUser from './components/user/createUser';
import DepartmentSchedulePage from './components/user/DepartmentSchedulePage';
import CreateSchedule from './components/user/CreateSchedule';
import { ToastProvider } from "@/app/ui/toast"
import CreateDepartment from './components/dataCreation/CreateDepartment';
import CreateCompany from './components/dataCreation/CreateCompany';
import CreatePosition from './components/dataCreation/CreatePosition';
import PositionList from './components/listComponents/PositionList';
import i18next from 'i18next';
import { useParams } from 'react-router-dom';
import useTranslation from './hooks/useTranslation';
import DepartmentList from './components/listComponents/DepartmentList';
import CompanyList from './components/listComponents/CompanyList';
import UserList from './components/listComponents/UserList';
import ListUser from './components/listComponents/ListUser';
import Schedule from './components/listComponents/Schedule';
import PersonalSchedule from './components/PersonalSchedule';
import TimeTracker from './components/TimeTracker';
import NotificationsPage from './components/NotificationsPage';
import CookieConsent from './components/CookieConsent';
import ScheduleList from './components/listComponents/schedulesList';
import HomePage from './components/HomePage';
import NotFoundPage from './components/NotFoundPage';



 //    <DebugAuthState/>


function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading ,user,employee } = useSelector(selectAuth);

  useEffect(() => {
    console.log("112",i18next.language);
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated && !user && !employee)  {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated, user,employee]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
    <GoogleOAuthProvider clientId="403484262744-d6phpufdivrems79sg62l9nq40tui9vh.apps.googleusercontent.com">
      <Router>
      <Layout>
      <CookieConsent />

          <Routes>
        <Route path="/:lang" element={<LanguageWrapper />}>
        <Route index element={isAuthenticated ? <DashboardPage /> : <HomePage />} />
        <Route path="login" element={!isAuthenticated ?  <LoginPage /> : <DashboardPage />} />
          <Route path="dashboard" element={isAuthenticated ? <DashboardPage /> : <LoginPage /> } />
          <Route path="profile" element={isAuthenticated ? <ProfilePage /> : <LoginPage />} />
          <Route path="CreateSchedule" element={isAuthenticated ? <CreateSchedule /> : <LoginPage /> } />
          <Route path="CreateDepartment" element={isAuthenticated ? <CreateDepartment /> : <LoginPage /> } />
          <Route path="CreateCompany" element={isAuthenticated ? <CreateCompany /> : <LoginPage /> } />
          <Route path="CreatePosition" element={isAuthenticated ? <CreatePosition /> : <LoginPage /> } />
          <Route path="createUser" element={isAuthenticated ? <CreateUser /> : <LoginPage />} />
          <Route path="PositionList" element={isAuthenticated ? <PositionList /> : <LoginPage /> } />
          <Route path="DepartmentList" element={isAuthenticated ? <DepartmentList /> : <LoginPage /> } />
          <Route path="CompanyList" element={isAuthenticated ? <CompanyList /> : <LoginPage /> } />
          <Route path="UserList" element={isAuthenticated ? <UserList /> : <LoginPage /> } />
          <Route path="TimeTracker" element={isAuthenticated ? <TimeTracker /> : <LoginPage /> } />
          <Route path="notifications/:notificationId" element={isAuthenticated ? <NotificationsPage /> : <LoginPage /> } />
          <Route path="register" element={!isAuthenticated ?  <RegisterPage /> : <DashboardPage />} />
          <Route path="*" element={isAuthenticated ? <DashboardPage /> : <NotFoundPage /> } />
          <Route path="ListUser" element={isAuthenticated ?  <ListUser /> : <LoginPage />} />
          <Route path="Schedule" element={isAuthenticated ?  <Schedule /> : <LoginPage />} />
          <Route path="ScheduleList" element={isAuthenticated ?  <ScheduleList /> : <LoginPage />} />
          <Route path="PersonalSchedule" element={isAuthenticated ?  <PersonalSchedule /> : <LoginPage />} />
          <Route path="verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="two-factor" element={<TwoFactorPage />} />
          <Route path="Home" element={<HomePage />} />
          <Route path="error" element={<NotFoundPage />} />


          </Route>
          {/* Root redirect */}
          <Route path="/" element={<RedirectToHome />} />
              
              {/* Catch all redirect */}
              <Route path="*" element={<RedirectToHome />} />
          </Routes>
          </Layout>  
    </Router>

    </GoogleOAuthProvider>
    </>
  )
}
const RedirectToHome = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const lang = i18next.language || 'en';
    navigate(`/${lang}/Home`, { replace: true });
  }, [navigate]);

  return null;
};
const LanguageWrapper = () => {
  const { lang } = useParams();
  const { changeLanguage } = useTranslation();

  useEffect(() => {
    changeLanguage(lang);
  }, [lang, changeLanguage]);

  return <Outlet />;
};

export default App
