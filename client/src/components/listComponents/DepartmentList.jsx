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
import useTranslation from '@/hooks/useTranslation';
import ErrorAlert from '@/components/ErrorAlert';
import FetchData  from '@/components/FetchData';

import { departmentApi } from '@/services/api/departmentApi';

const DepartmentList = () => {
    const { toast } = useToast();
    const { user } = useSelector(selectAuth);
    const [departments, setDepartments] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState(null);
    const [setUpData, setSetUpData] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [formData, setFormData] = useState({
        company:'',
        department:'',
      });
    const { t, language } = useTranslation();
    const [translations, setTranslations] = useState({});
    
    const handleSubmitDialog = async (formData) => {
        console.log(formData);
        setFormData(formData);
        fetchDepartments();
        setSetUpData(false);
    }
    useEffect(() => {
        const updateTranslations = async () => {
            const newTranslations = {
                loading: await t('Loading'),
                errorFetchCompanies: await t('Failed to fetch companies'),
                unavailableData: await t('Unavailable Data'),
                departmentNull: await t('This company may not have departments yet'),
                failedDepartmentFetch: await t('Failed to fetch departments'),
                pleaseSelectCompany: await t('Please select a company'),
                selectCompany: await t('Select Company'),
                failedDepartmentDelete: await t('Failed to delete department'),
                pleaseSelectCompanyToViewDepartments: await t('Please select the company to view departments.'),
                nameCompany: await t('Company'),
                viewDepartments: await t('View Departments'),
                
                browseOtherCompanyDepartments: await t('Browse other Company Departments'),
                departments: await t('Departments'),
                searchDepartments: await t('Search departments... '),
                name: await t('Name'),
                description: await t('Description'),
                phone: await t('Phone'),
                email: await t('Email'),
                createdAt: await t('Created At'),
                actions: await t('Actions'),
                delete: await t('Delete'),
                edit: await t('Edit'),
                editDepartment: await t('Edit Department'),
                update: await t('Update'),
                confirmDeletion: await t('Confirm Deletion'),
                areYouSureYouWantToDelete: await t('Are you sure you want to delete'),
                thisActionCannotBeUndone: await t('? This action cannot be undone.'),
                cancel: await t('Cancel'),
                
            };
            setTranslations(newTranslations);
        };

        updateTranslations();
    }, [language, t]);





    useEffect(() => {
        if (departments && departments.length > 0) {
            filterAndSortDepartments();
        } else {
            setFilteredDepartments([]);
        }
    }, [departments, searchTerm, sortBy, sortOrder]);

    const fetchDepartments = async () => {
        try {
            setIsLoading(true);
            const result = await departmentApi.getCompanyDepartment(formData);
            console.log(result.department);

            if (result.department.length === 0) {
                toast({
                    title: translations.unavailableData,
                    description: translations.departmentNull,
                });
                setDepartments([]);
            } else {
                setDepartments(result.department);
            }
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching departments:", error);
            setError(translations.failedDepartmentFetch);
            setDepartments([]);
            setIsLoading(false);
        }
    };

    const handleInitialDialogSubmit = () => {
        if (!selectedCompany) {
            toast({
                title: "Error",
                description: translations.pleaseSelectCompany,
                variant: "destructive",
            });
            return;
        }
        setShowInitialDialog(false);
    };

    const filterAndSortDepartments = () => {
        if (!departments || departments.length === 0) {
            setFilteredDepartments([]);
            return;
        }
    
        let filtered = departments.filter(department => {
            if (!department || typeof department.name !== 'string') {
                console.warn('Invalid department object:', department);
                return false;
            }
            return department.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    
        filtered.sort((a, b) => {
            if (!a[sortBy] || !b[sortBy]) {
                console.warn(`Invalid sort property: ${sortBy}`);
                return 0;
            }
            if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
            if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    
        setFilteredDepartments(filtered);
    };

    const handleSort = (field) => {
        if (field === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleEdit = (department) => {
        setEditingDepartment({ ...department });
    };

    const handleUpdate = async () => {
        try {
            const response = await departmentApi.saveDepartmentProfile(editingDepartment);
            setDepartments(departments.map(d => d._id === editingDepartment._id ? editingDepartment : d));
            setEditingDepartment(null);
            toast({
                title: "Success",
                description: await t(`${response.data.message}`),
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update department",
                variant: "destructive",
            });
        }
    };

    const handleBrowseOtherCompanies = () => {
        setShowInitialDialog(true);
        setSelectedCompany('');
        setError('');
    };

    const handleDelete = (department) => {
        setDepartmentToDelete(department);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await departmentApi.deleteDepartment(departmentToDelete._id);
            setDepartments(departments.filter(d => d._id !== departmentToDelete._id));
            setIsDeleteDialogOpen(false);
            toast({
                title: "Success",
                description: await t(`${response.data.message}`),
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: translations.failedDepartmentDelete,
                variant: "destructive",
            });
        }
    };

    if (isLoading) return <div>{translations.loading}</div>;
    if (error) {
        return (
            <>
                <ErrorAlert error={error} />
                <div className="p-6 w-full mx-auto overflow-x-auto">
                    <Button onClick={handleBrowseOtherCompanies}>
                        {translations.browseOtherCompanyDepartments}
                    </Button>
                </div>
            </>
        );
    }

    
    return (
        <Card className="flex flex-col w-full max-w mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">{translations.departments}</CardTitle>
            </CardHeader>
            <CardContent>
            <CompanyDepartmentSelector
        user={user}
        isOpen={setUpData}
        onClose={() => setShowDialog(false)}
        onSubmit={handleSubmitDialog}
        translations={translations}
      />
      
      {/* Rest of your ListUser component */}
      {!showDialog && (
          <Button onClick={handleBrowseOtherDepartments}>
            {translations.browseOtherDepartmentUsers}
          </Button>)}
         


                <div className="mb-4">
                    <Input
                        placeholder={translations.searchDepartments}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead onClick={() => handleSort('name')} className="cursor-pointer">{translations.name} {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}</TableHead>
                            <TableHead>{translations.description}</TableHead>
                            <TableHead>{translations.phone}</TableHead>
                            <TableHead>{translations.email}</TableHead>
                            <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer">{translations.createdAt} {sortBy === 'createdAt' && (sortOrder === 'asc' ? '▲' : '▼')}</TableHead>
                            <TableHead>{translations.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDepartments.map((department) => (
                            <TableRow key={department._id}>
                                <TableCell>{department.name}</TableCell>
                                <TableCell>{department.description}</TableCell>
                                <TableCell>{department.phone}</TableCell>
                                <TableCell>{department.email}</TableCell>
                                <TableCell>{new Date(department.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Button onClick={() => handleEdit(department)} className="mr-2">{translations.edit}</Button>
                                    <Button onClick={() => handleDelete(department)} variant="destructive">{translations.delete}</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>

            {editingDepartment && (
                <Dialog open={!!editingDepartment} onOpenChange={() => setEditingDepartment(null)}>
                    <DialogContent className="text-gray-900 dark:text-white">
                        <DialogHeader>
                            <DialogTitle>{translations.editDepartment}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">{translations.name}</Label>
                                <Input
                                    id="edit-name"
                                    value={editingDepartment.name}
                                    onChange={(e) => setEditingDepartment({ ...editingDepartment, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-description">{translations.description}</Label>
                                <Input
                                    id="edit-description"
                                    value={editingDepartment.description}
                                    onChange={(e) => setEditingDepartment({ ...editingDepartment, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-phone">{translations.phone}</Label>
                                <Input
                                    id="edit-phone"
                                    value={editingDepartment.phone}
                                    onChange={(e) => setEditingDepartment({ ...editingDepartment, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-email">{translations.email}</Label>
                                <Input
                                    id="edit-email"
                                    value={editingDepartment.email}
                                    onChange={(e) => setEditingDepartment({ ...editingDepartment, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleUpdate}>{translations.update}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="text-gray-900 dark:text-white">
                    <DialogHeader>
                        <DialogTitle>{translations.confirmDeletion}</DialogTitle>
                        <DialogDescription>
                            {translations.areYouSureYouWantToDelete} "{departmentToDelete?.name}" {translations.thisActionCannotBeUndone}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setIsDeleteDialogOpen(false)} variant="outline">{translations.cancel}</Button>
                        <Button onClick={confirmDelete} variant="destructive">{translations.delete}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default DepartmentList;