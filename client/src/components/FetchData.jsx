import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/ui/select";
import { departmentApi } from '@/services/api/departmentApi';
import { useToast } from "@/hooks/use-toast";

const FetchData = ({ 
  user, 
  isOpen, 
  onClose, 
  onSubmit, 
  translations,
  initialData = { company: '', department: '' }
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await departmentApi.getDepartments(user);
        if (isMounted) {
          if (result?.data?.companies && Array.isArray(result.data.companies)) {
            setData(result.data.companies);
            if (result.data.companies.length === 1) {
              setFormData(prev => ({
                ...prev,
                company: result.data.companies[0]._id
              }));
            }
          } else if (result?.data?.company) {
            setData([result.data.company]);
            setFormData(prev => ({
              ...prev,
              company: result.data.company._id
            }));
          }
          
          // Handle department manager and other roles
          if (['Department_Manager', 'Shift_Manager', 'Employee'].includes(user.role.name)) {
            if (result.data.department) {
              setFormData(prev => ({
                ...prev,
                department: result.data.department._id
              }));
              // Auto submit for these roles
              onSubmit({ department: result.data.department._id });
              onClose();
            }
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        if (isMounted) {
          setError(translations.errorFetchDepartment);
          setIsLoading(false);
        }
      }
    };

    if (isOpen) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [user, isOpen]);

  useEffect(() => {
    if (formData.company) {
      const selectedCompany = data.find(c => c._id === formData.company);
      setDepartments(selectedCompany ? selectedCompany.departments : []);
    }
  }, [formData.company, data]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'company' ? { department: '' } : {}) // Reset department when company changes
    }));
  };

  const handleSubmit = () => {
    const isOwnerOrAdmin = user.role.name === 'Owner' || user.role.name === 'Admin';
    
    if (isOwnerOrAdmin && !formData.company) {
      toast({
        title: "Error",
        description: translations.pleaseSelectCompany,
        variant: "destructive",
      });
      return;
    }

    if (!formData.department) {
      toast({
        title: "Error",
        description: translations.pleaseSelectDepartment,
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;
  if (isLoading) return <div>{translations.loading}</div>;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] text-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle>{translations.selectCompanyDepartment}</DialogTitle>
          <DialogDescription>
            {translations.pleaseSelectCompanyDepartmentToView}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {data.length > 0 && user.role.name !== 'Customer_Company_Owner' && (
            <div className="space-y-2">
              <Label htmlFor="company">{translations.namecompany}</Label>
              <Select
                name="company"
                value={formData.company}
                onValueChange={(value) => handleInputChange('company', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={translations.SelectCompany} />
                </SelectTrigger>
                <SelectContent>
                  {data.map((company) => (
                    <SelectItem key={company._id} value={company._id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {(formData.company || user.role.name === 'Customer_Company_Owner') && departments.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="department">{translations.namedepartment}</Label>
              <Select
                name="department"
                value={formData.department}
                onValueChange={(value) => handleInputChange('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={translations.selectDepartment} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department._id} value={department._id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>{translations.submit}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FetchData;