import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/ui/table";
import { selectAuth } from '@/store/slices/authSlice';
import { useToast } from "@/hooks/use-toast";
import useTranslation from '@/hooks/useTranslation';
import ErrorAlert from '@/components/ErrorAlert';
import { companyApi } from '@/services/api/companyApi';

const CompanyList = () => {
    const { toast } = useToast();
    const { user } = useSelector(selectAuth);
    const [companies, setCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [editingCompany, setEditingCompany] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState(null);

    const { t, language,getTranslations } = useTranslation();
    const [translations, setTranslations] = useState({});
    const [translationsKeys, setTranslationsKeys] = useState({});

    useEffect(() => {
        const updateTranslations = async () => {
            const newTranslations = {
                
                editCompany: await t('editCompany','Update Compans')
                
            };
            setTranslations(newTranslations);
        };

        updateTranslations();
    }, [language, t]);
    useEffect(() => {
        const fetchTranslations = async () => {
          const keys = [
            'errorFetchCompanies',
            'loading',
            'companies',
            'searchCompanies',
            'namekey',
            'description',
            'phoneKey',
            'emailKey',
            'createdAt',
            'actions',
            'delete',
            'edit',
            'editCompany',
            'update',
            'confirmDeletion',
            'areYouSureYouWantToDelete',
            'thisActionCannotBeUndone',
            'cancel'
        ];    const newTranslations = await getTranslations(keys);
          setTranslationsKeys(prev => ({
            ...prev,
            ...newTranslations
          }));
        };     
        fetchTranslations();
      }, [language, getTranslations]);

    useEffect(() => {
        fetchCompanies();
    }, [user]);

    useEffect(() => {
        if (companies && companies.length > 0) {
            filterAndSortCompanies();
        } else {
            setFilteredCompanies([]);
        }
    }, [companies, searchTerm, sortBy, sortOrder]);

    const fetchCompanies = async () => {
        try {
            setIsLoading(true);
            const result = await companyApi.getCompanies(user);
            setCompanies(result.companies);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching companies:", error);
            setError(translationsKeys.errorFetchCompanies);
            setCompanies([]);
            setIsLoading(false);
        }
    };

    const filterAndSortCompanies = () => {
        if (!companies || companies.length === 0) {
            setFilteredCompanies([]);
            return;
        }
    
        let filtered = companies.filter(company => {
            if (!company || typeof company.name !== 'string') {
                console.warn('Invalid company object:', company);
                return false;
            }
            return company.name.toLowerCase().includes(searchTerm.toLowerCase());
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
    
        setFilteredCompanies(filtered);
    };

    const handleSort = (field) => {
        if (field === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleEdit = (company) => {
        setEditingCompany({ ...company });
    };

    const handleUpdate = async () => {
        try {
            const response = await companyApi.saveCompanyProfile(editingCompany);
            setCompanies(companies.map(c => c._id === editingCompany._id ? editingCompany : c));
            setEditingCompany(null);
            toast({
                title: "Success",
                description: await t(`${response.data.message}`),
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update company",
                variant: "destructive",
            });
        }
    };

    const handleDelete = (company) => {
        setCompanyToDelete(company);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await companyApi.deleteCompany(companyToDelete._id);
            setCompanies(companies.filter(c => c._id !== companyToDelete._id));
            setIsDeleteDialogOpen(false);
            toast({
                title: "Success",
                description: await t(`${response.data.message}`),
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete company",
                variant: "destructive",
            });
        }
    };

    if (isLoading) return <div>{translationsKeys.loading}</div>;
    if (error) return <ErrorAlert error={error} />;

    return (
        <Card className="flex flex-col w-full max-w mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">{translationsKeys.companies}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Input
                        placeholder={translationsKeys.searchCompanies}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead onClick={() => handleSort('name')} className="cursor-pointer">{translationsKeys.name} {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}</TableHead>
                            <TableHead>{translationsKeys.description}</TableHead>
                            <TableHead>{translationsKeys.phone}</TableHead>
                            <TableHead>{translationsKeys.email}</TableHead>
                            <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer">{translationsKeys.createdAt} {sortBy === 'createdAt' && (sortOrder === 'asc' ? '▲' : '▼')}</TableHead>
                            <TableHead>{translationsKeys.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCompanies.map((company) => (
                            <TableRow key={company._id}>
                                <TableCell>{company.name}</TableCell>
                                <TableCell>{company.description}</TableCell>
                                <TableCell>{company.phone}</TableCell>
                                <TableCell>{company.email}</TableCell>
                                <TableCell>{new Date(company.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Button onClick={() => handleEdit(company)} className="mr-2">{translationsKeys.edit}</Button>
                                    <Button onClick={() => handleDelete(company)} variant="destructive">{translationsKeys.delete}</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>

            {editingCompany && (
                <Dialog open={!!editingCompany} onOpenChange={() => setEditingCompany(null)}>
                    <DialogContent className="text-gray-900 dark:text-white">
                        <DialogHeader>
                            <DialogTitle>{translationsKeys.editCompany}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">{translationsKeys.namekey}</Label>
                                <Input
                                    id="edit-name"
                                    value={editingCompany.name}
                                    onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-description">{translationsKeys.description}</Label>
                                <Input
                                    id="edit-description"
                                    value={editingCompany.description}
                                    onChange={(e) => setEditingCompany({ ...editingCompany, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-phone">{translationsKeys.phoneKeyF}</Label>
                                <Input
                                    id="edit-phone"
                                    value={editingCompany.phone}
                                    onChange={(e) => setEditingCompany({ ...editingCompany, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-email">{translationsKeys.emailKey}</Label>
                                <Input
                                    id="edit-email"
                                    value={editingCompany.email}
                                    onChange={(e) => setEditingCompany({ ...editingCompany, email: e.target.value })}
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
                            {translationsKeys.areYouSureYouWantToDelete} "{companyToDelete?.name}" {translationsKeys.thisActionCannotBeUndone}
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

export default CompanyList;