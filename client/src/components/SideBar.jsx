import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/app/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/app/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/ui/popover";
import { 
  ChevronDown,
  Home, 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Building2, 
  FolderTree,
  Briefcase, 
  Calendar 
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth } from '../store/slices/authSlice';
import useTranslation from '@/hooks/useTranslation';

const SideBar = ({ isExpanded, setIsExpanded }) => {
  const [openItems, setOpenItems] = useState({});
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();
  const [openItem, setOpenItem] = useState(null);
  const userPermissions = user.role.permissions;
  const [openPopover, setOpenPopover] = useState(null);
  const { t,language } = useTranslation();
  const [translations, setTranslations] = useState({});
  const hasPermission = (userPermissions, requiredPermissions) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.some(permission => userPermissions.includes(permission));
  };

  const handleCreateUserProfile = async () => {
      navigate(`/${language}/createUser`);
  };

  const handleShowSchedules = () => {
    navigate(`/${language}/ShowSchedules`);
  };

  const handleCreateSchedule = () => {
    navigate(`/${language}/CreateSchedule`);
  };
  const handleCreateCompany = () => {
    navigate(`/${language}/CreateCompany`);
  };
  const handleCreateDepartment = () => {
    navigate(`/${language}/CreateDepartment`);
  };
  const handleCreatePosition = () => {
    navigate(`/${language}/CreatePosition`);
  };
  const handlePositionList = () => {
    navigate(`/${language}/PositionList`);
  };
  const handleDepartmentList = () => {
    navigate(`/${language}/DepartmentList`);
  };
  const handleCompanyList = () => {
    navigate(`/${language}/CompanyList`);
  };
  const handleUserList = () => {
    navigate(`/${language}/UserList`);
  };
  const handleListUser = () => {
    navigate(`/${language}/ListUser`);
  };
  const handleSchedule = () => {
    navigate(`/${language}/Schedule`);
  };
  const handlePersonalSchedule = () => {
    navigate(`/${language}/PersonalSchedule`);
  };
  const handleScheduleList = () => {
    navigate(`/${language}/ScheduleList`);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsExpanded(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [setIsExpanded]);



  const toggleMenuItem = (index) => {
    setOpenItems(prev => ({ ...prev, [index]: !prev[index] }));
  };
  const handleItemClick = (index, path, onClick) => {
    if (openItem === index) {
      setOpenItem(null);
    } else {
      setOpenItem(index);
    }
  
    if (onClick) {
      onClick();
    } else if (path) {
      navigate(path);
    }
    setOpenPopover(null);

    if (window.innerWidth < 768) {
      setIsExpanded(false);
    }
  };
  const menuItems = [
    { icon: Home, label: 'Home', path: `/${language}/`, permissions: ['basic'] },
    { icon: LayoutDashboard, label: 'Dashboard', path: `/${language}/dashboard`, permissions: ['basic'] },
    { icon: MessageSquare, label: 'TimeTracker', path: `/${language}/TimeTracker`, permissions: ['basic'] },
    { icon: MessageSquare, label: 'Messages', path: `/${language}/messages`, permissions: ['basic'] },
    { icon: Users, label: 'Users', permissions: ['users'], subItems: [
      { label: 'User List', onClick: handleListUser, permissions: ['users'] },
      { label: 'my Employees', onClick: handleUserList, permissions: ['users'] },
      { label: 'Create User', onClick: handleCreateUserProfile, permissions: ['users'] },
    ]},
    { icon: Building2, label: 'Companies', permissions: ['companies', 'company'], subItems: [
      { label: 'Companies List', onClick: handleCompanyList, permissions: ['companies'] },
      { label: 'Create Company ', onClick: handleCreateCompany, permissions: ['companies'] },
      { label: 'my Company ', onClick: handleCreateCompany, permissions: [ 'company'] },

    ]},
    { icon: FolderTree, label: 'Departments', permissions: ['departments', 'department'], subItems: [
      { label: 'Departments List',  onClick: handleDepartmentList, permissions: ['departments'] },
      { label: 'Create Department', onClick: handleCreateDepartment, permissions: ['departments'] },
      { label: 'my Department ',  onClick: handleDepartmentList, permissions: [ 'department'] },

    ]},
    { icon: Briefcase, label: 'Positions', permissions: ['positions'], subItems: [
      { label: 'Position List', onClick: handlePositionList, permissions: ['positions'] },
      { label: 'Position Form', onClick: handleCreatePosition, permissions: ['positions'] },
    ]},
    { icon: Calendar, label: 'Schedules', permissions: ['schedules', 'shifts', 'basic'], subItems: [
      { label: 'My Schedules', onClick: handlePersonalSchedule, permissions: ['basic','schedules', 'shifts'] },
      { label: 'Schedules', onClick: handleSchedule, permissions: ['users','basic','schedules', 'shifts'] },
      { label: 'Schedules List', onClick: handleScheduleList, permissions: ['schedules', 'shifts'] },
      { label: 'Create Schedules', onClick: handleCreateSchedule, permissions: ['schedules', 'shifts'] },
    ]}
  ];

  const filterMenuItems = (items) => {
    return items.reduce((acc, item) => {
      if (hasPermission(userPermissions, item.permissions)) {
        if (item.subItems) {
          const filteredSubItems = item.subItems.filter(subItem => 
            hasPermission(userPermissions, subItem.permissions)
          );
          if (filteredSubItems.length > 0) {
            acc.push({ ...item, subItems: filteredSubItems });
          }
        } else {
          acc.push(item);
        }
      }
      return acc;
    }, []);
  };

  const filteredMenuItems = filterMenuItems(menuItems);

  const renderMenuItem = (item, index) => {
    if (!isExpanded && item.subItems) {
      const filteredSubItems = item.subItems.filter(subItem => 
        hasPermission(userPermissions, subItem.permissions)
      );
      if (filteredSubItems.length === 0) return null;
      return (
        <Popover key={index} 
  open={openPopover === index}
  onOpenChange={(open) => setOpenPopover(open ? index : null)}>
          <PopoverTrigger asChild>
            <div className="flex items-center justify-center p-5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer">
              <item.icon className="h-5 w-5" />
            </div>
          </PopoverTrigger>
          <PopoverContent side="right" className="p-0 ml-3">
            <div className="py-2">
              <h3 className="px-3 py-2 text-sm font-semibold">{item.label}</h3>
              {item.subItems.map((subItem, subIndex) => (
                <div 
                  key={subIndex} 
                  onClick={() => handleItemClick(null, subItem.path, subItem.onClick)}                 
                   
                  className="block px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
                >
                  {subItem.label}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      );
    }
    if (!item.subItems) {
      return (
        <div 
          key={index}
          onClick={() => handleItemClick(index, item.path, item.onClick)}          className="flex items-center p-5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer"
        >
          <item.icon className="h-5 w-5 " />
          {isExpanded && <span className="ml-3">{item.label}</span>}
        </div>
      );
    } else {
      return (
        <Collapsible
          key={index}
          open={openItem === index}
  onOpenChange={() => handleItemClick(index)}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer">
              <div className='flex items-center justify-between'>
                <item.icon className="h-5 w-5" />
                {isExpanded && <span className="ml-3 ">{item.label}</span>}
              </div>
              <div>
                <ChevronDown className={`h-5 w-5 transition-transform ${openItems[index] ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className={`ml-${isExpanded ? '6' : '0'} mt-1`}>
              {item.subItems.map((subItem, subIndex) => (
                <div 
                  key={subIndex} 
                  onClick={() => handleItemClick(null, subItem.path, subItem.onClick)}
                  className={`flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 ${!isExpanded && 'text-center'} cursor-pointer`}
                >
                  {subItem.label}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }
  };

  return (
    <div className={`bg-white shadow-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'}`}>
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <nav className="p-4 ">
          {filteredMenuItems.map((item, index) => renderMenuItem(item, index))}
        </nav>
      </ScrollArea>
    </div>
  );
};

export default SideBar;