import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { selectAuth } from '@/store/slices/authSlice';
import { useToast } from "@/hooks/use-toast";
import { companyApi } from '@/services/api/companyApi';

const CreateCompany = () => {
  const { toast } = useToast()
  const [error, setError] = useState('');
  const { user } = useSelector(selectAuth);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: {
      street: '',
      houseNumber: '',
      zipCode: '',
      city: '',
    },
    user,
  });

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
      const response = await companyApi.saveCompanyProfile(formData);
      console.log("API response:", response);
      toast({
        title: "Success",
        description: "User successfully created!",
        variant: "success",
      });
  
       if (response && (response.status === 200  || response.status === 201)) {
        setFormData({
          name: '',
          description: '',
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
          description: "Company successfully created!",
          variant: "success",
        });
        
      }
     } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred during Company creation';
      setError(errorMessage);
          toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive", // Shows error styled notification
      });
    
      
     }
  
    };
  

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create Company</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
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

          <Button type="submit" className="w-full">Create Company</Button>
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

export default CreateCompany;