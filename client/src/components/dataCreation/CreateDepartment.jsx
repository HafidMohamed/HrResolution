import React, { useState,useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/ui/select";
import { selectAuth } from '@/store/slices/authSlice';
import { useToast } from "@/hooks/use-toast";
import { companyApi } from '@/services/api/companyApi';
import { departmentApi } from '@/services/api/departmentApi';

const CreateDepartment = () => {
  const { toast } = useToast();
  const [error, setError] = useState('');
  const { user } = useSelector(selectAuth);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    company: '',
    companyName:'',
    email: '',
    phone: '',
    address: {
      street: '',
      houseNumber: '',
      zipCode: '',
      city: '',
      
    },
    user

  });
  useEffect(() => {
    let isMounted = true;
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const result = await companyApi.getCompanies(user);
        console.log("Fetched companies:", result);
        if (isMounted) {
          // Check if result is an array
          if (Array.isArray(result)) {
            setCompanies(result);
          } else if (Array.isArray(result.companies)) {
            setCompanies(result.companies);
          }else if (user.role.name === 'Customer_Company_Owner' ) {
            if (result.companies) {
              setFormData(prev => ({
                ...prev,
                company: result.companies._id,
                companyName:result.companies.name,
              }));
            }
          }
           else {
            console.error("Unexpected API response format:", result);
            setError("Unexpected data format received from server");
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        if (isMounted) {
          setError("Failed to fetch companies");
          setIsLoading(false);
        }
      }
    };

    fetchCompanies();

    return () => {
      isMounted = false;
    };
  }, [user]);
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };
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
      const response = await departmentApi.saveDepartmentProfile(formData);
      console.log("API response:", response);
      
      if (response && (response.status === 200 || response.status === 201)) {
        setFormData({
          name: '',
          description: '',
          company: '',
          email: '',
          phone: '',
          address: {
            street: '',
            houseNumber: '',
            zipCode: '',
            city: '',
          },
        });
        toast({
          title: "Success",
          description: "Department successfully created!",
          variant: "success",
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred during department creation';
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
        <CardTitle className="text-2xl font-bold">Create Department</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
            <Input className="bg-gray-100 dark:bg-gray-800" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
              <Label htmlFor="email">  Email Address </Label>
              <Input  className="bg-gray-100 dark:bg-gray-800"type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input  className="bg-gray-100 dark:bg-gray-800" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input className="bg-gray-100 dark:bg-gray-800" id="description" name="description" value={formData.description} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input  className="bg-gray-100 dark:bg-gray-800"name="street" placeholder="Street" value={formData.address.street} onChange={handleAddressChange} />
              <Input  className="bg-gray-100 dark:bg-gray-800"name="houseNumber" placeholder="Number" value={formData.address.houseNumber} onChange={handleAddressChange} />
              <Input  className="bg-gray-100 dark:bg-gray-800"name="zipCode" placeholder="ZIP Code" value={formData.address.zipCode} onChange={handleAddressChange} />
              <Input  className="bg-gray-100 dark:bg-gray-800"name="city" placeholder="City" value={formData.address.city} onChange={handleAddressChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company :</Label>
            {isLoading ? (
              <p>Loading companies...</p>
            ) : companies.length > 0 ? (
              <Select name="company" value={formData.company} onValueChange={(value) => handleInputChange({ target: { name: 'company', value } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company._id} value={company._id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (            <Label> {formData.companyName}</Label>

            )}
          </div>

          <Button type="submit" className="w-full">Create Department</Button>
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

export default CreateDepartment;