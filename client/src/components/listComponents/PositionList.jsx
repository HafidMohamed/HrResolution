import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/ui/select";
import { selectAuth } from '@/store/slices/authSlice';
import { useToast } from "@/hooks/use-toast";
import { positionApi } from '@/services/api/positionApi';
import { departmentApi } from '@/services/api/departmentApi';
import useTranslation from '@/hooks/useTranslation';
import ErrorAlert from '@/components/ErrorAlert';


const PositionList = () => {
    const { toast } = useToast();
    const { user } = useSelector(selectAuth);
    const [positions, setPositions] = useState([]);
    const [filteredPositions, setFilteredPositions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [editingPosition, setEditingPosition] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [positionToDelete, setPositionToDelete] = useState(null);
    const [showInitialDialog, setShowInitialDialog] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [Data, setData] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [formData, setFormData] = useState({
        company:'',
        department:'',
      });
      const { t, language,getTranslations } = useTranslation();
      const [translations, setTranslations] = useState({});
      const [translationsKeys, setTranslationsKeys] = useState({});

      useEffect(() => {
        const updateTranslations = async () => {
          const newTranslations = {
            
          };
          setTranslations(newTranslations);
        };
    
        updateTranslations();
      }, [language, t]); 
      useEffect(() => {
        const fetchTranslations = async () => {
          const keys = [
            'errorFetchDepartment', 'uavailableData', 'departmentPositionNull',
            'failedPositionFetch', 'pleaseSelectCompany', 'pleaseSelectDepratment',
            'selectCompanyDepartment', 'failedPositionDelete', 'pleaseSelectCompanyDepartmentToView',
            'namecompany', 'SelectCompany', 'namedepartment', 'selectDepartment',
            'viewPositions', 'loading', 'browseOtherDepartmentPositions', 'positions',
            'searchPositions', 'namekey', 'description', 'hourlyRate', 'createdAt',
            'actions', 'delete', 'edit', 'editPosition', 'update', 'confirmDeletion',
            'areYouSureYouWantToDelete', 'thisActionCannotBeUndone', 'cancel'
          ];    const newTranslations = await getTranslations(keys);
          setTranslationsKeys(prev => ({
            ...prev,
            ...newTranslations
          }));
        };     
        fetchTranslations();
      }, [language, getTranslations]);
       

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      };

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

  useEffect(() => {
    if (!showInitialDialog) {
      fetchPositions();
    }
  }, [showInitialDialog, selectedCompany, selectedDepartment]);

  useEffect(() => {
    filterAndSortPositions();
  }, [positions, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    if (formData.company) {
      const selectedCompany = Data.find(c => c._id === formData.company);
      setDepartments(selectedCompany ? selectedCompany.department : []);
    }
  }, [formData.company, Data]);

  const fetchPositions = async () => {
    try {
      setIsLoading(true);
      const result = await positionApi.getPositions(formData);
      console.log(result.data.position);
      if (result.data.position.length === 0) {
        toast({
          title: translationsKeys.uavailableData,
          description: translationsKeys.departmentPositionNull,
        });
      }
      setPositions(result.data.position);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching positions:", error);
      setError(translationsKeys.failedPositionFetch);
      setIsLoading(false);
    }
  };

  const handleInitialDialogSubmit = () => {
    if ((user.role === 'Owner' || user.role === 'Admin') && !formData.company) {
      toast({
        title: "Error",
        description: translationsKeys.pleaseSelectCompany,
        variant: "destructive",
      });
      return;
    }
    if (!formData.department) {
      toast({
        title: "Error",
        description: translationsKeys.pleaseSelectDepratment,
        variant: "destructive",
      });
      return;
    }
    setShowInitialDialog(false);
  };

  const filterAndSortPositions = () => {
    let filtered = positions.filter(position =>
      position.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredPositions(filtered);
  };

  const handleSort = (field) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleEdit = (position) => {
    setEditingPosition({ ...position });
  };

  const handleUpdate = async () => {
    try {
        const response=await positionApi.savePositionProfile(editingPosition);
      setPositions(positions.map(p => p._id === editingPosition._id ? editingPosition : p));
      setEditingPosition(null);
      toast({
        title: "Success",
        description: await t(`${response.data.message}`),
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: await t(`${error}`),
        variant: "destructive",
      });
    }
  };
  const handleBrowseOtherDepartments = () => {
    setShowInitialDialog(true);
    setFormData({ company: '', department: '' });
    setError(''); // Clear any existing errors

};

  const handleDelete = (position) => {
    setPositionToDelete(position);
    setIsDeleteDialogOpen(true);

  };

  const confirmDelete = async () => {
    try {
      const respones=await positionApi.deletePosition(positionToDelete._id);
      setPositions(positions.filter(p => p._id !== positionToDelete._id));
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description:await t(`${response.data.message}`),
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: translationsKeys.failedPositionDelete,
        variant: "destructive",
      });
    }
  };
  
  if (user.role.name === 'Owner' || user.role.name === 'Admin'){

    if (showInitialDialog) {
      return (
        <Dialog open={showInitialDialog} onOpenChange={setShowInitialDialog}>
          <DialogContent className="sm:max-w-[425px]  text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>{translationsKeys.selectCompanyDepartment}</DialogTitle>
              <DialogDescription>
                {translationsKeys.pleaseSelectCompanyDepartmentToView}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {Data && Data.length > 0  && (
                <div className="space-y-2">
                <Label htmlFor="company">{translationsKeys.namecompany} </Label>
                <Select name="company" value={formData.company} onValueChange={(value) => handleInputChange({ target: { name: 'company', value } })}>
                  <SelectTrigger>
                    <SelectValue placeholder={translationsKeys.SelectCompany} />
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
                <Label htmlFor="department">{translationsKeys.namedepartment}</Label>
                <Select name="department" value={formData.department} onValueChange={(value) => handleInputChange({ target: { name: 'department', value } })}>
                  <SelectTrigger>
                    <SelectValue placeholder={translationsKeys.selectDepartment} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department._id} value={department._id}>{department.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            </div>
            <DialogFooter>
              <Button onClick={handleInitialDialogSubmit}>{translationsKeys.viewPositions}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
      
    }
  }else if((user.role.name === 'Customer_Company_Owner')){
    if (showInitialDialog) {
      return (
        <Dialog open={showInitialDialog} onOpenChange={setShowInitialDialog}>
          <DialogContent className="sm:max-w-[425px]  text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>{translationsKeys.selectCompanyDepartment}</DialogTitle>
              <DialogDescription>
                {translationsKeys.pleaseSelectCompanyDepartmentToView}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              { departments.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="department">{translationsKeys.namedepartment}</Label>
                <Select name="department" value={formData.department} onValueChange={(value) => handleInputChange({ target: { name: 'department', value } })}>
                  <SelectTrigger>
                    <SelectValue placeholder={translationsKeys.selectDepartment} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department._id} value={department._id}>{department.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            </div>
            <DialogFooter>
              <Button onClick={handleInitialDialogSubmit}>{translationsKeys.viewPositions}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }
      
  }

  if (isLoading) return <div>{translationsKeys.loading}</div>;
  if (error) {
    return (
      <>
        <ErrorAlert error={error} />
        <div className="p-6 w-full mx-auto overflow-x-auto">
          <Button onClick={handleBrowseOtherDepartments}>
            {translationsKeys.browseOtherDepartmentPositions}
          </Button>
        </div>
      </>
    );
  }
  return (
    <Card className="flex flex-col w-full max-w mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{translationsKeys.postions}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-6 w-full mx-auto overflow-x-auto " >
        <Button onClick={handleBrowseOtherDepartments}>{translationsKeys.browseOtherDepartmentPositions}</Button>
            
        </div>

        <div className="mb-4">
          <Input
            placeholder={translationsKeys.searchPositions}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer">{translationsKeys.name} {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}</TableHead>
              <TableHead>{translationsKeys.description}</TableHead>
              <TableHead onClick={() => handleSort('hourlyRate')} className="cursor-pointer">{translationsKeys.hourlyRate}{sortBy === 'hourlyRate' && (sortOrder === 'asc' ? '▲' : '▼')}</TableHead>
              <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer">{translationsKeys.createdAt} {sortBy === 'createdAt' && (sortOrder === 'asc' ? '▲' : '▼')}</TableHead>
              <TableHead>{translationsKeys.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPositions.map((position) => (
              <TableRow key={position._id}>
                <TableCell>{position.name}</TableCell>
                <TableCell>{position.description}</TableCell>
                <TableCell>€{position.hourlyRate.toFixed(2)}</TableCell>
                <TableCell>{new Date(position.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEdit(position)} className="mr-2">{translationsKeys.edit}</Button>
                  <Button onClick={() => handleDelete(position)} variant="destructive">{translationsKeys.delete}</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {editingPosition && (
        <Dialog open={!!editingPosition} onOpenChange={() => setEditingPosition(null)}>
          <DialogContent className="text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>{translationsKeys.editPosition}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">{translationsKeys.namekey}</Label>
                <Input
                  id="edit-name"
                  value={editingPosition.name}
                  onChange={(e) => setEditingPosition({ ...editingPosition, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">{translationsKeys.description}</Label>
                <Input
                  id="edit-description"
                  value={editingPosition.description}
                  onChange={(e) => setEditingPosition({ ...editingPosition, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-hourlyRate">{translationsKeys.hourlyRate}</Label>
                <Input
                  id="edit-hourlyRate"
                  type="number"
                  value={editingPosition.hourlyRate}
                  onChange={(e) => setEditingPosition({ ...editingPosition, hourlyRate: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdate}>{translationsKeys.update}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>{translationsKeys.confirmDeletion}</DialogTitle>
            <DialogDescription>
              {translationsKeys.areYouSureYouWantToDeleteThePosition} "{positionToDelete?.name}" {translationsKeys.thisActionCannotBeUndone}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDeleteDialogOpen(false)} variant="outline">{translationsKeys.cancel}</Button>
            <Button onClick={confirmDelete} variant="destructive">{translationsKeys.delete}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PositionList;