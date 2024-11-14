import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/ui/select";
import { Label } from "@/components/ui/label";
import { selectAuth } from '@/store/slices/authSlice';
import { useToast } from "@/hooks/use-toast";
import { userApi } from '@/services/api/userApi';
import { departmentApi } from '@/services/api/departmentApi'; // Assuming you have this API
import useTranslation from '@/hooks/useTranslation';
import ErrorAlert from '@/components/ErrorAlert';

const ListUser = () => {
    const { toast } = useToast();
    const { user } = useSelector(selectAuth);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('username');
    const [sortOrder, setSortOrder] = useState('asc');
    const [editingUser, setEditingUser] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showInitialDialog, setShowInitialDialog] = useState(true);
    const [formData, setFormData] = useState({
        company: '',
        department: '',
    });
    const [Data, setData] = useState([]);
    const [departments, setDepartments] = useState([]);

    const { t, language } = useTranslation();
    const [translations, setTranslations] = useState({});

    useEffect(() => {
        const updateTranslations = async () => {
            const newTranslations = {
                failedUserFetch: await t('Failed to fetch users'),
                loading: await t('Loading...'),
                users: await t('Users'),
                searchUsers: await t('Search users...'),
                username: await t('Username'),
                email: await t('Email'),
                position: await t('Position'),
                isActive: await t('Is Active'),
                isEmailVerified: await t('Is Email Verified'),
                actions: await t('Actions'),
                edit: await t('Edit'),
                delete: await t('Delete'),
                editUser: await t('Edit User'),
                update: await t('Update'),
                confirmDeletion: await t('Confirm Deletion'),
                areYouSureYouWantToDelete: await t('Are you sure you want to delete'),
                thisActionCannotBeUndone: await t('? This action cannot be undone.'),
                cancel: await t('Cancel'),
                yes: await t('Yes'),
                no: await t('No'),
                selectCompanyDepartment: await t('Select Company and Department'),
                pleaseSelectCompanyDepartmentToView: await t('Please select a company and department to view users'),
                namecompany: await t('Company'),
                SelectCompany: await t('Select Company'),
                namedepartment: await t('Department'),
                selectDepartment: await t('Select Department'),
                viewUsers: await t('View Users'),
                browseOtherDepartmentUsers: await t('Browse Other Department Users'),
                errorFetchDepartment: await t('Error fetching departments'),
            };
            setTranslations(newTranslations);
        };

        updateTranslations();
    }, [language, t]);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
          try {
            setIsLoading(true);
            const result = await departmentApi.getDepartments(user);
            if (isMounted) {
              if (result && result.companies && Array.isArray(result.companies)) {
                setData(result.companies);
                if (result.companies.length === 1) {
                  setFormData(prev => ({
                    ...prev,
                    company: result.companies[0]._id
                  }));
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
    
        fetchData();
    
        return () => {
          isMounted = false;
        };
    }, [user]);

    useEffect(() => {
        if (!showInitialDialog) {
            fetchUsers();
        }
    }, [showInitialDialog, formData.company, formData.department]);
    useEffect(() => {
        if (formData.company) {
          const selectedCompany = Data.find(c => c._id === formData.company);
          setDepartments(selectedCompany ? selectedCompany.department : []);
        }
      }, [formData.company, Data]);

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      };

    const handleInitialDialogSubmit = () => {
        if (formData.company && formData.department) {
            setShowInitialDialog(false);
        } else {
            toast({
                title: "Error",
                description: "Please select both company and department",
                variant: "destructive",
            });
        }
    };

    const handleBrowseOtherDepartments = () => {
        setShowInitialDialog(true);
        setFormData({ company: '', department: '' });
        setError('');
    };

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const result = await userApi.getUsers(user, formData.company, formData.department);
            setUsers(result.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);
            setError(translations.failedUserFetch);
            setIsLoading(false);
        }
    };

    const filterAndSortUsers = () => {
        let filtered = users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered.sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
            if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredUsers(filtered);
    };

    useEffect(() => {
        filterAndSortUsers();
    }, [users, searchTerm, sortBy, sortOrder]);

    const handleSort = (field) => {
        if (field === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleEdit = (user) => {
        setEditingUser({ ...user });
    };

    const handleUpdate = async () => {
        try {
            const response = await userApi.updateUser(editingUser);
            setUsers(users.map(u => u._id === editingUser._id ? editingUser : u));
            setEditingUser(null);
            toast({
                title: "Success",
                description: await t(`${response.data.message}`),
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update user",
                variant: "destructive",
            });
        }
    };

    const handleDelete = (user) => {
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await userApi.deleteUser(userToDelete._id);
            setUsers(users.filter(u => u._id !== userToDelete._id));
            setIsDeleteDialogOpen(false);
            toast({
                title: "Success",
                description: await t(`${response.data.message}`),
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete user",
                variant: "destructive",
            });
        }
    };

    if (showInitialDialog) {
        return (
            <Dialog open={showInitialDialog} onOpenChange={setShowInitialDialog}>
                <DialogContent className="sm:max-w-[425px] text-gray-900 dark:text-white">
                    <DialogHeader>
                        <DialogTitle>{translations.selectCompanyDepartment}</DialogTitle>
                        <DialogDescription>
                            {translations.pleaseSelectCompanyDepartmentToView}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {Data && Data.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="company">{translations.namecompany} </Label>
                                <Select name="company" value={formData.company} onValueChange={(value) => handleInputChange({ target: { name: 'company', value } })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={translations.SelectCompany} />
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
                                <Label htmlFor="department">{translations.namedepartment}</Label>
                                <Select name="department" value={formData.department} onValueChange={(value) => handleInputChange({ target: { name: 'department', value } })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={translations.selectDepartment} />
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
                        <Button onClick={handleInitialDialogSubmit}>{translations.viewUsers}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    if (isLoading) return <div>{translations.loading}</div>;
    if (error) {
        return (
            <>
                <ErrorAlert error={error} />
                <div className="p-6 w-full mx-auto overflow-x-auto">
                    <Button onClick={handleBrowseOtherDepartments}>
                        {translations.browseOtherDepartmentUsers}
                    </Button>
                </div>
            </>
        );
    }

    return (
        <Card className="flex flex-col w-full max-w mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">{translations.users}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="p-6 w-full mx-auto overflow-x-auto">
                    <Button onClick={handleBrowseOtherDepartments}>{translations.browseOtherDepartmentUsers}</Button>
                </div>
                <div className="mb-4">
                    <Input
                        placeholder={translations.searchUsers}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead onClick={() => handleSort('username')} className="cursor-pointer">
                                {translations.username} {sortBy === 'username' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </TableHead>
                            <TableHead onClick={() => handleSort('email')} className="cursor-pointer">
                                {translations.email} {sortBy === 'email' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </TableHead>
                            <TableHead>{translations.position}</TableHead>
                            <TableHead>{translations.isActive}</TableHead>
                            <TableHead>{translations.isEmailVerified}</TableHead>
                            <TableHead>{translations.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.position?.name || 'N/A'}</TableCell>
                                <TableCell>{user.isActive ? translations.yes : translations.no}</TableCell>
                                <TableCell>{user.isEmailVerified ? translations.yes : translations.no}</TableCell>
                                <TableCell>
                                    <Button onClick={() => handleEdit(user)} className="mr-2">{translations.edit}</Button>
                                    <Button onClick={() => handleDelete(user)} variant="destructive">{translations.delete}</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>

            {editingUser && (
                <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
                    <DialogContent className="text-gray-900 dark:text-white">
                        <DialogHeader>
                            <DialogTitle>{translations.editUser}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="edit-username">{translations.username}</label>
                                <Input
                                    id="edit-username"
                                    value={editingUser.username}
                                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-email">{translations.email}</label>
                                <Input
                                    id="edit-email"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
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
                            {translations.areYouSureYouWantToDelete} "{userToDelete?.username}" {translations.thisActionCannotBeUndone}
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

export default ListUser;