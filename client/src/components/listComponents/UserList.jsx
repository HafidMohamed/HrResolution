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
import { Avatar } from '@radix-ui/react-avatar';
import { AvatarFallback, AvatarImage } from '@/app/ui/avatar';
import { Switch } from '@/app/ui/switch';
import { Badge } from '@/app/ui/badge';

const UserList = () => {
    const { toast } = useToast();
    const { user } = useSelector(selectAuth);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('lastName');
    const [sortOrder, setSortOrder] = useState('asc');
    const [editingUser, setEditingUser] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showInitialDialog, setShowInitialDialog] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [Data, setData] = useState([]);
    
    const [formData, setFormData] = useState({
        company: '',
        department: '',
        user,
    });

    const { t, language } = useTranslation();
    const [translations, setTranslations] = useState({});

    useEffect(() => {
        const updateTranslations = async () => {
            const newTranslations = {
                errorFetchDepartment: await t('Failed to fetch departments'),
                uavailableData: await t('Unavailable Data'),
                departmentUserNull: await t('This Department may not have users yet'),
                failedUserFetch: await t('Failed to fetch users'),
                pleaseSelectCompany: await t('Please select a company'),
                pleaseSelectDepartment: await t('Please select a department'),
                selectCompanyDepartment: await t('Select Company and Department'),
                failedUserDelete: await t('Failed to delete user'),
                pleaseSelectCompanyDepartmentToView: await t('Please select the company and department to view users.'),
                namecompany: await t('Company'),
                SelectCompany: await t('Select company'),
                namedepartment: await t('Department'),
                selectDepartment: await t('Select department'),
                viewUsers: await t('View Users'),
                loading: await t('Loading...'),
                browseOtherDepartmentUsers: await t('Browse other Department Users'),
                users: await t('Users'),
                searchUsers: await t('Search users...'),
                firstName: await t('First Name'),
                lastName: await t('Last Name'),
                email: await t('Email'),
                position: await t('Position'),
                isActive: await t('Is Active'),
                createdAt: await t('Created At'),
                actions: await t('Actions'),
                delete: await t('Delete'),
                edit: await t('Edit'),
                editUser: await t('Edit User'),
                update: await t('Update'),
                confirmDeletion: await t('Confirm Deletion'),
                areYouSureYouWantToDelete: await t('Are you sure you want to delete'),
                thisActionCannotBeUndone: await t('? This action cannot be undone.'),
                cancel: await t('Cancel')
            };
            setTranslations(newTranslations);
        };

        updateTranslations();
    }, [language, t]);

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
        filterAndSortUsers();
    }, [users, searchTerm, sortBy, sortOrder]);

    useEffect(() => {
        if (formData.company) {
            const selectedCompany = Data.find(c => c._id === formData.company);
            setDepartments(selectedCompany ? selectedCompany.department : []);
        }
    }, [formData.company, Data]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const result = await userApi.getUsers(formData);
            console.log(result);
            if (result.data.length === 0) {
                toast({
                    title: translations.uavailableData,
                    description: translations.departmentUserNull,
                });
            }
            setUsers(result.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);
            setError(translations.failedUserFetch);
            setIsLoading(false);
        }
    };

    const handleInitialDialogSubmit = () => {
        if ((user.role === 'Owner' || user.role === 'Admin') && !formData.company) {
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
        setShowInitialDialog(false);
    };

    const filterAndSortUsers = () => {
        let filtered = users.filter(user =>
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered.sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
            if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredUsers(filtered);
    };

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
                description: await t(`${error}`),
                variant: "destructive",
            });
        }
    };

    const handleBrowseOtherDepartments = () => {
        setShowInitialDialog(true);
        setFormData({ company: '', department: '' });
        setError('');
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
                description: translations.failedUserDelete,
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
                <CardTitle className="text-2xl font-bold">Users</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="p-6 w-full mx-auto overflow-x-auto">
                    <Button onClick={handleBrowseOtherDepartments}>{translations.browseOtherDepartmentUsers}</Button>
                </div>
                <div className="mb-4">
                    <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Table>
                <TableHeader>
                        <TableRow>
                        <TableHead className="w-[50px]"></TableHead>                            <TableHead onClick={() => handleSort('firstName')} className="cursor-pointer">
                                {translations.firstName} {sortBy === 'firstName' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </TableHead>
                            <TableHead onClick={() => handleSort('lastName')} className="cursor-pointer">
                                {translations.lastName} {sortBy === 'lastName' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </TableHead>
                            <TableHead>{translations.email}</TableHead>
                            <TableHead>{translations.position}</TableHead>
                            <TableHead>{translations.isActive}</TableHead>
                            <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer">
                                {translations.createdAt} {sortBy === 'createdAt' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </TableHead>
                            <TableHead>{translations.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell>
                                    <Avatar>
                                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`} />
                                        <AvatarFallback>{`${user.firstName[0]}${user.lastName[0]}`}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>{user.firstName}</TableCell>
                                <TableCell>{user.lastName}</TableCell>
                                <TableCell>{user.user.email}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{user.position?.name}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Switch
                                        checked={user.user.isActive}
                                        onCheckedChange={() => {
                                            // Handle status change
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button onClick={() => handleEdit(user)} variant="outline" size="sm" className="mr-2">Edit</Button>
                                    <Button onClick={() => handleDelete(user)} variant="destructive" size="sm">Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>

            {editingUser && (
                <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-username">Username</Label>
                                <Input
                                    id="edit-username"
                                    value={editingUser.username}
                                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-role">Role</Label>
                                <Select
                                    value={editingUser.role}
                                    onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="User">User</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                        <SelectItem value="Owner">Owner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleUpdate}>Update</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the user "{userToDelete?.username}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setIsDeleteDialogOpen(false)} variant="outline">Cancel</Button>
                        <Button onClick={confirmDelete} variant="destructive">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default UserList;