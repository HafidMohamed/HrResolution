import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/ui/select";
import { selectAuth } from '@/store/slices/authSlice';
import { useToast } from "@/hooks/use-toast";
import { departmentApi } from '@/services/api/departmentApi';
import { positionApi } from '@/services/api/positionApi';

const CreatePosition = () => {
  const { toast } = useToast();
  const [error, setError] = useState('');
  const { user } = useSelector(selectAuth);
  const [Data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    hourlyRate: '',
    user,
  });
  const [departments, setDepartments] = useState([]);
  useEffect(() => {
    if (formData.company) {
      const selectedCompany = Data.find(c => c._id === formData.company);
      setDepartments(selectedCompany ? selectedCompany.department : []);
    }
  }, [formData.company, Data]);


  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await departmentApi.getDepartments(user);
        if (isMounted) {
          if (result && result.data.companies && Array.isArray(result.data.companies)) {
            setData(result.data.companies);
            if (result.data.companies.length === 1) {
              setFormData(prev => ({
                ...prev,
                company: result.companies[0]._id
              }));
            }
          }if (result && result.data.company){
            setDepartments(result.data.company.department);
            setFormData(prev => ({
              ...prev,
              company: result.data.company._id
            }));
          } else if (user.role.name === 'Department_Manager' || user.role.name === 'Shift_Manager' || user.role.name === 'Employee') {
            if (result.data.department) {
              console.log(result.data.department);
              setFormData(prev => ({
                ...prev,
                department: result.data.department._id
              }));
              setShowInitialDialog(false);
              fetchSchedules();
            }
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        if (isMounted) {
          setError(translationsKeys.errorFetchDepartment);
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log(formData);
      const response = await positionApi.savePositionProfile(formData);
      console.log("API response:", response);
      
      if (response && (response.status === 200 || response.status === 201)) {
        setFormData({
          name: '',
          description: '',
          department: '',
          hourlyRate: '',
          company:''
        });
        toast({
          title: "Success",
          description: "Position successfully created!",
          variant: "success",
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred during position creation';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create Position</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Position Name</Label>
            <Input className="bg-gray-100 dark:bg-gray-800" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input className="bg-gray-100 dark:bg-gray-800" id="description" name="description" value={formData.description} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate (€)</Label>
            <div className="relative">
              <Input
                className="bg-gray-100 dark:bg-gray-800 pl-7"
                type="number"
                id="hourlyRate"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
              />
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
            </div>
          </div>
          {Data && Data.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Select name="company" value={formData.company} onValueChange={(value) => handleInputChange({ target: { name: 'company', value } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {Data.map((company) => (
                    <SelectItem key={company._id} value={company._id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.company && departments.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select name="department" value={formData.department} onValueChange={(value) => handleInputChange({ target: { name: 'department', value } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department._id} value={department._id}>{department.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          

          <Button type="submit" className="w-full">Create Position</Button>
        </form>
        <div className="space-y-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePosition;