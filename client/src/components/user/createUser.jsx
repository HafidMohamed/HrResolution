import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/ui/select";
import { selectAuth } from '@/store/slices/authSlice';
import { selectInit } from '@/store/slices/empSlice';
import { useToast } from "@/hooks/use-toast"
import CustomDatePicker from '@/app/ui/CustomDatePicker';
import { userApi } from '@/services/api/userApi';
import { authApi } from '@/services/api/authApi';

const CreateUser = () => {
  const { toast } = useToast()

  const [error, setError] = useState('');
    const {user} = useSelector(selectAuth);
    const [companies, setCompanies] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
    user: user.userId,
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    dateOfBirth: null,
    nationalID: '',
    phone: '',
    address: {
      street: '',
      houseNumber: '',
      zipCode: '',
      city: '',
    },
    hireDate: null,
    department: '',
    company: '',
    position: '',
    IBAN: '',
    SSN: '',
    SIN: '',
    IN: '',
    familyStatus: '',
    nationality: '',
    countryOfResidence: '',
    cityOrigins: '',
    employmentStatus: '',
  });
  useEffect(() => {
    // Fetch companies data when component mounts
    const fetchCompanies = async () => {
      try {
        const response = await userApi.getSetUpData(user.userId);
        setCompanies(response.companies);
        setRoles(response.roles);
      } catch (error) {
        console.error('Error fetching companies:', error);
        setError('Failed to fetch companies data');
      }
    };

    fetchCompanies();
  }, []);


  useEffect(() => {
    if (formData.company) {
      const selectedCompany = companies.find(c => c._id === formData.company);
      setDepartments(selectedCompany ? selectedCompany.department : []);
    }
  }, [formData.company, companies]);

  useEffect(() => {
    if (formData.department) {
      const selectedDepartment = departments.find(d => d._id === formData.department);
      setPositions(selectedDepartment ? selectedDepartment.position : []);
    }
  }, [formData.department, departments]);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };
  const role = user.role._id;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
   try {
     console.log(formData);
     const response= await userApi.saveUserProfile(formData,role);
     console.log("API response:", response);
     toast({
      title: "Success",
      description: "User successfully created!",
      variant: "success",
    });

     if (response && response.status === 200) {
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        gender: '',
        dateOfBirth:null,
        nationalID: '',
        phone: '',
        address: {
          street: '',
          houseNumber: '',
          zipCode: '',
          city: '',
        },
        hireDate: null,
        department: '',
        company: '',
        position: '',
        role: '',
        IBAN: '',
        SSN: '',
        SIN: '',
        IN: '',
        familyStatus: '',
        nationality: '',
        countryOfResidence: '',
        cityOrigins: '',
      });
      toast({
        title: "Success",
        description: "User successfully created!",
        variant: "success",
      });
      
    }
   } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred during user creation';
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
        <CardTitle className="text-2xl font-bold">Create Employee</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 ">
              <Label htmlFor="firstName">First Name</Label>
              <Input  className="bg-gray-100 dark:bg-gray-800"  id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input  className="bg-gray-100 dark:bg-gray-800"   id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select  className="bg-gray-100 dark:bg-gray-800"   name="gender" value={formData.gender} onValueChange={(value) => handleInputChange({ target: { name: 'gender', value } })}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="space-y-4">
            <CustomDatePicker  className="bg-gray-100 dark:bg-gray-800"  
              label="Date of Birth"
              value={formData.dateOfBirth}
              onValueChange={(date) => handleDateChange(date, 'dateOfBirth')}
            />

      </div>
            
                 </div>

          <div className="space-y-2">
            <Label htmlFor="nationalID">National ID</Label>
            <Input  className="bg-gray-100 dark:bg-gray-800"  id="nationalID" name="nationalID" value={formData.nationalID} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
              <Label htmlFor="email">  Email Address </Label>
              <Input  className="bg-gray-100 dark:bg-gray-800"type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
            </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input  className="bg-gray-100 dark:bg-gray-800" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
          </div>
          {roles && roles.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="position">Role</Label>
              <Select className="bg-gray-100 dark:bg-gray-800" name="position" value={formData.role} onValueChange={(value) => handleInputChange({ target: { name: 'role', value } })}>
                <SelectTrigger>
                  <SelectValue  placeholder="Select His role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role._id} value={role._id}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Address</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input  className="bg-gray-100 dark:bg-gray-800"name="street" placeholder="Street" value={formData.address.street} onChange={handleAddressChange} />
              <Input  className="bg-gray-100 dark:bg-gray-800"name="houseNumber" placeholder="House Number" value={formData.address.houseNumber} onChange={handleAddressChange} />
              <Input  className="bg-gray-100 dark:bg-gray-800"name="zipCode" placeholder="ZIP Code" value={formData.address.zipCode} onChange={handleAddressChange} />
              <Input  className="bg-gray-100 dark:bg-gray-800"name="city" placeholder="City" value={formData.address.city} onChange={handleAddressChange} />
            </div>
          </div>

          <div className="space-y-2">
          <div className="space-y-4">
          <CustomDatePicker
              label="Hire Date"
              value={formData.hireDate}
              onValueChange={(date) => handleDateChange(date, 'hireDate')}
            />
      </div>
                     </div>

          {companies && companies.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
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

        {formData.department && positions.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select name="position" value={formData.position} onValueChange={(value) => handleInputChange({ target: { name: 'position', value } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position._id} value={position._id}>{position.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="IBAN">IBAN</Label>
            <Input  className="bg-gray-100 dark:bg-gray-800"id="IBAN" name="IBAN" value={formData.IBAN} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="SSN">SSN</Label>
            <Input  className="bg-gray-100 dark:bg-gray-800"id="SSN" name="SSN" value={formData.SSN} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="SIN">SIN</Label>
            <Input  className="bg-gray-100 dark:bg-gray-800"id="SIN" name="SIN" value={formData.SIN} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="IN">IN</Label>
            <Input  className="bg-gray-100 dark:bg-gray-800"id="IN" name="IN" value={formData.IN} onChange={handleInputChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="familyStatus">Family Status</Label>
            <Input  className="bg-gray-100 dark:bg-gray-800"id="familyStatus" name="familyStatus" value={formData.familyStatus} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Input  className="bg-gray-100 dark:bg-gray-800"id="nationality" name="nationality" value={formData.nationality} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="countryOfResidence">Country of Residence</Label>
            <Input  className="bg-gray-100 dark:bg-gray-800"id="countryOfResidence" name="countryOfResidence" value={formData.countryOfResidence} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cityOrigins">City of Origins</Label>
            <Input  className="bg-gray-100 dark:bg-gray-800"id="cityOrigins" name="cityOrigins" value={formData.cityOrigins} onChange={handleInputChange} required />
          </div>

          <Button type="submit" className="w-full">Create Employee</Button>
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

export default CreateUser;