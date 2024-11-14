import React ,{ useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from "@/app/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/ui/avatar";
import { Badge } from "@/app/ui/badge";
import { useSelector } from 'react-redux';
import { Mail, Phone, Briefcase, Building, Users, Key } from "lucide-react";
import { useNavigate,useLocation } from 'react-router-dom';
import { selectAuth } from '@/store/slices/authSlice';
import useTranslation from '@/hooks/useTranslation';
import { authApi } from '@/services/api/authApi';
import { Alert } from '../ui/alert';
import ErrorAlert from '../ErrorAlert';
import { userApi } from '@/services/api/userApi';


const ProfilePage = () => {
  const {user} = useSelector(selectAuth);
  const [isLoading, setIsLoading] = useState(true);
  const { t, language } = useTranslation();
  const [translations, setTranslations] = useState({});
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
      const response = await userApi.getProfile(user.userId); // Await the response from API
        console.log(response);
      if (isMounted) {
          if (response ) {
            setProfile(response);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        if (isMounted) {
          setError("Failed to fetch departments");
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user]);


  if (isLoading) return <div>{translations.loading}</div>;
  if (error) return <ErrorAlert error={error} />;
  return (
    <div className="container mx-auto p-6">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="flex flex-col items-center space-y-4 pb-6 pt-8 px-4 sm:px-6">
          <Avatar className="w-32 h-32">
            <AvatarImage  alt={`${profile.firstName} ${profile.lastName}`} />
            <AvatarFallback>{profile.firstName[0]}{profile.lastName[0]}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h1 className="text-3xl font-bold">{profile.firstName} {profile.lastName}</h1>
            <p className="text-muted-foreground text-lg mt-1">@{user.username}</p>
            <p className="text-muted-foreground text-lg mt-1">@{profile.authID}</p>
          </div>
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            {user.role.name}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-6 px-4 sm:px-6 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem icon={<Mail className="w-5 h-5" />} label="Email" value={user.email} />
            <InfoItem icon={<Phone className="w-5 h-5" />} label="Phone" value={profile.phone} />
            <InfoItem icon={<Briefcase className="w-5 h-5" />} label="Position" value={profile.position.name} />
            <InfoItem icon={<Building className="w-5 h-5" />} label="Company" value={profile.company.name} />
            <InfoItem icon={<Users className="w-5 h-5" />} label="Department" value={profile.department.name} />
            <InfoItem icon={<Key className="w-5 h-5" />} label="Auth ID" value={profile.authID} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3">
    <div className="flex-shrink-0 text-muted-foreground">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  </div>
);

export default ProfilePage;