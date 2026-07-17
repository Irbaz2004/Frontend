// app/admin/ShopCategory.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    CircularProgress,
    Alert,
    Snackbar,
    InputAdornment,
    Tooltip,
    Tabs,
    Tab,
    Stack,
    Checkbox,
    DialogContentText
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Category as CategoryIcon,
    Inventory as InventoryIcon,
    Upload as UploadIcon,
    Close as CloseIcon,
    LocalPharmacy as PharmacyIcon,
    DeleteSweep as DeleteSweepIcon
} from '@mui/icons-material';
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    bulkDeleteCategories,
    bulkImportCategories,
    getKeyItemsByCategory,
    createKeyItem,
    updateKeyItem,
    deleteKeyItem,
    bulkImportKeyItems
} from '../../services/shopCategory';

export default function ShopCategory() {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [keyItems, setKeyItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    // Category Dialog
    const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        title: '',
        description: '',
        display_order: 0,
        is_active: true
    });
    
    // Key Item Dialog
    const [openItemDialog, setOpenItemDialog] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemForm, setItemForm] = useState({
        item_name: '',
        display_order: 0,
        is_active: true
    });
    
    // Bulk Import Category Dialog
    const [openBulkCategoryDialog, setOpenBulkCategoryDialog] = useState(false);
    const [bulkCategoryText, setBulkCategoryText] = useState('');
    
    // Bulk Import Key Item Dialog
    const [openBulkItemDialog, setOpenBulkItemDialog] = useState(false);
    const [bulkItemText, setBulkItemText] = useState('');
    
    // Delete Confirmation Dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteType, setDeleteType] = useState(''); // 'category' or 'item'
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadCategories();
    }, [page, rowsPerPage, search]);

    useEffect(() => {
        if (selectedCategory) {
            loadKeyItems(selectedCategory.id);
        }
    }, [selectedCategory]);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const result = await getCategories({
                page: page + 1,
                limit: rowsPerPage,
                search
            });
            setCategories(result.categories || []);
            setTotal(result.total || 0);
            setSelectedCategories([]);
            
            if (result.categories && result.categories.length > 0 && !selectedCategory) {
                setSelectedCategory(result.categories[0]);
            } else if (result.categories && result.categories.length === 0) {
                setSelectedCategory(null);
            }
        } catch (error) {
            showSnackbar('Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadKeyItems = async (categoryId) => {
        try {
            const result = await getKeyItemsByCategory(categoryId);
            setKeyItems(result.key_items || []);
        } catch (error) {
            showSnackbar('Failed to load key items', 'error');
        }
    };

    const handleSaveCategory = async () => {
        if (!categoryForm.name.trim()) {
            showSnackbar('Category name is required', 'error');
            return;
        }
        if (!categoryForm.title.trim()) {
            showSnackbar('Category title is required', 'error');
            return;
        }

        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, categoryForm);
                showSnackbar('Category updated successfully');
            } else {
                await createCategory(categoryForm);
                showSnackbar('Category created successfully');
            }
            handleCloseCategoryDialog();
            loadCategories();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleDeleteCategory = (category) => {
        setDeleteTarget(category);
        setDeleteType('category');
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            if (deleteType === 'category') {
                await deleteCategory(deleteTarget.id);
                showSnackbar(`Category "${deleteTarget.name}" deleted successfully`);
                if (selectedCategory?.id === deleteTarget.id) {
                    setSelectedCategory(null);
                }
                loadCategories();
            } else if (deleteType === 'item') {
                await deleteKeyItem(deleteTarget.id);
                showSnackbar(`Item "${deleteTarget.item_name}" deleted successfully`);
                loadKeyItems(selectedCategory.id);
            }
            setOpenDeleteDialog(false);
        } catch (error) {
            showSnackbar(error.message, 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkDeleteCategories = async () => {
        if (selectedCategories.length === 0) {
            showSnackbar('Please select categories to delete', 'error');
            return;
        }

        if (window.confirm(`Are you sure you want to delete ${selectedCategories.length} categories and all their key items?`)) {
            try {
                await bulkDeleteCategories(selectedCategories);
                showSnackbar(`${selectedCategories.length} categories deleted successfully`);
                setSelectedCategories([]);
                if (selectedCategory && selectedCategories.includes(selectedCategory.id)) {
                    setSelectedCategory(null);
                }
                loadCategories();
            } catch (error) {
                showSnackbar(error.message, 'error');
            }
        }
    };

    const handleBulkImportCategories = async () => {
        const lines = bulkCategoryText.split('\n')
            .map(line => line.trim())
            .filter(line => line);
        
        if (lines.length === 0) {
            showSnackbar('Please enter at least one category', 'error');
            return;
        }

        const categories = lines.map(line => {
            const parts = line.split('|').map(s => s.trim());
            return {
                name: parts[0] || '',
                title: parts[1] || parts[0] || '',
                description: parts[2] || '',
                display_order: 0,
                is_active: true
            };
        }).filter(cat => cat.name && cat.title);

        if (categories.length === 0) {
            showSnackbar('Invalid format. Use: Category Name | Category Title | Description (optional)', 'error');
            return;
        }

        try {
            await bulkImportCategories(categories);
            showSnackbar(`${categories.length} categories imported successfully`);
            setOpenBulkCategoryDialog(false);
            setBulkCategoryText('');
            loadCategories();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleSaveItem = async () => {
        if (!itemForm.item_name.trim()) {
            showSnackbar('Item name is required', 'error');
            return;
        }

        try {
            if (editingItem) {
                await updateKeyItem(editingItem.id, itemForm);
                showSnackbar('Item updated successfully');
            } else {
                await createKeyItem(selectedCategory.id, itemForm);
                showSnackbar('Item created successfully');
            }
            handleCloseItemDialog();
            loadKeyItems(selectedCategory.id);
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleDeleteItem = (item) => {
        setDeleteTarget(item);
        setDeleteType('item');
        setOpenDeleteDialog(true);
    };

    const handleBulkImportItems = async () => {
        const items = bulkItemText.split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .map(line => ({ item_name: line, display_order: 0 }));
        
        if (items.length === 0) {
            showSnackbar('Please enter at least one item', 'error');
            return;
        }

        try {
            await bulkImportKeyItems(selectedCategory.id, items);
            showSnackbar(`${items.length} items imported successfully`);
            setOpenBulkItemDialog(false);
            setBulkItemText('');
            loadKeyItems(selectedCategory.id);
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleOpenCategoryDialog = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setCategoryForm({
                name: category.name,
                title: category.title || '',
                description: category.description || '',
                display_order: category.display_order || 0,
                is_active: category.is_active
            });
        } else {
            setEditingCategory(null);
            setCategoryForm({
                name: '',
                title: '',
                description: '',
                display_order: 0,
                is_active: true
            });
        }
        setOpenCategoryDialog(true);
    };

    const handleCloseCategoryDialog = () => {
        setOpenCategoryDialog(false);
        setEditingCategory(null);
    };

    const handleOpenItemDialog = (item = null) => {
        if (item) {
            setEditingItem(item);
            setItemForm({
                item_name: item.item_name,
                display_order: item.display_order || 0,
                is_active: item.is_active
            });
        } else {
            setEditingItem(null);
            setItemForm({
                item_name: '',
                display_order: 0,
                is_active: true
            });
        }
        setOpenItemDialog(true);
    };

    const handleCloseItemDialog = () => {
        setOpenItemDialog(false);
        setEditingItem(null);
    };

    const handleSelectCategory = (id) => {
        setSelectedCategories(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSelectAllCategories = () => {
        if (selectedCategories.length === categories.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(categories.map(cat => cat.id));
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const getCategoryIcon = (name) => {
        if (name.toLowerCase().includes('pharmacy')) return <PharmacyIcon />;
        return <CategoryIcon />;
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Header */}
            <Typography variant="h4" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600, mb: 3 }}>
                Shop Categories Management
            </Typography>

            {/* Search and Add */}
            <Paper sx={{ p: 2, mb: 3, border: '1px solid #e8ecef', boxShadow: 'none', borderRadius: 2 }}>
                <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                        placeholder="Search categories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="small"
                        sx={{ flex: 1, minWidth: 200 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#9ca3af' }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={loadCategories}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<UploadIcon />}
                        onClick={() => setOpenBulkCategoryDialog(true)}
                        sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#7c3aed' }}
                    >
                        Bulk Import Categories
                    </Button>
                    {selectedCategories.length > 0 && (
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteSweepIcon />}
                            onClick={handleBulkDeleteCategories}
                            sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                            Delete Selected ({selectedCategories.length})
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenCategoryDialog()}
                        sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#325fec' }}
                    >
                        Add Category
                    </Button>
                </Box>
            </Paper>

            {/* Main Content */}
            <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }}>
                {/* Categories List */}
                <Paper sx={{ 
                    flex: 1, 
                    border: '1px solid #e8ecef', 
                    boxShadow: 'none', 
                    borderRadius: 2,
                    overflow: 'hidden'
                }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #e8ecef', bgcolor: '#f8f9fa' }}>
                        <Typography variant="h6" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>
                            Categories ({total})
                        </Typography>
                    </Box>
                    
                    <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedCategories.length === categories.length && categories.length > 0}
                                            indeterminate={selectedCategories.length > 0 && selectedCategories.length < categories.length}
                                            onChange={handleSelectAllCategories}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Order</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <CircularProgress sx={{ color: '#325fec' }} />
                                        </TableCell>
                                    </TableRow>
                                ) : categories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography color="#6b7280">No categories found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories.map((category) => (
                                        <TableRow 
                                            key={category.id} 
                                            hover 
                                            selected={selectedCategory?.id === category.id}
                                            sx={{ 
                                                cursor: 'pointer',
                                                bgcolor: selectedCategory?.id === category.id ? '#e8f0fe' : 'transparent'
                                            }}
                                            onClick={() => setSelectedCategory(category)}
                                        >
                                            <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedCategories.includes(category.id)}
                                                    onChange={() => handleSelectCategory(category.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {getCategoryIcon(category.name)}
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {category.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="#6b7280">
                                                    {category.title}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={category.is_active ? 'Active' : 'Inactive'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: category.is_active ? '#dcfce7' : '#fee2e2',
                                                        color: category.is_active ? '#16a34a' : '#dc2626',
                                                        borderRadius: 1
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{category.display_order}</TableCell>
                                            <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                                <IconButton size="small" onClick={() => handleOpenCategoryDialog(category)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteCategory(category)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={total}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </Paper>

                {/* Key Items Panel */}
                <Paper sx={{ 
                    flex: 1.5, 
                    border: '1px solid #e8ecef', 
                    boxShadow: 'none', 
                    borderRadius: 2,
                    overflow: 'hidden'
                }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #e8ecef', bgcolor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>
                                Key Items
                            </Typography>
                            {selectedCategory && (
                                <Typography variant="caption" color="#6b7280">
                                    for {selectedCategory.name} ({selectedCategory.title})
                                </Typography>
                            )}
                        </Box>
                        {selectedCategory && (
                            <Box display="flex" gap={1}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<UploadIcon />}
                                    onClick={() => setOpenBulkItemDialog(true)}
                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                >
                                    Bulk Import
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenItemDialog()}
                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                >
                                    Add Item
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {!selectedCategory ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <InventoryIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                            <Typography color="#6b7280">Select a category to view its key items</Typography>
                        </Box>
                    ) : (
                        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Item Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Order</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {keyItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                                <Typography color="#6b7280">No key items found</Typography>
                                                <Button
                                                    size="small"
                                                    startIcon={<AddIcon />}
                                                    onClick={() => handleOpenItemDialog()}
                                                    sx={{ mt: 1, textTransform: 'none' }}
                                                >
                                                    Add first item
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        keyItems.map((item) => (
                                            <TableRow key={item.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2">{item.item_name}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={item.is_active ? 'Active' : 'Inactive'}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: item.is_active ? '#dcfce7' : '#fee2e2',
                                                            color: item.is_active ? '#16a34a' : '#dc2626',
                                                            borderRadius: 1
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>{item.display_order}</TableCell>
                                                <TableCell align="center">
                                                    <IconButton size="small" onClick={() => handleOpenItemDialog(item)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleDeleteItem(item)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Box>

            {/* Category Dialog */}
            <Dialog open={openCategoryDialog} onClose={handleCloseCategoryDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Category Name (Unique Identifier)"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        margin="normal"
                        size="small"
                        required
                        helperText="e.g., Grocery Store (used as unique identifier)"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField
                        fullWidth
                        label="Category Title (Display Name)"
                        value={categoryForm.title}
                        onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                        margin="normal"
                        size="small"
                        required
                        helperText="e.g., Food & Beverages (displayed to users)"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        margin="normal"
                        size="small"
                        multiline
                        rows={3}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField
                        fullWidth
                        label="Display Order"
                        type="number"
                        value={categoryForm.display_order}
                        onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) || 0 })}
                        margin="normal"
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={categoryForm.is_active}
                                onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                            />
                        }
                        label="Active"
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCategoryDialog}>Cancel</Button>
                    <Button onClick={handleSaveCategory} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Key Item Dialog */}
            <Dialog open={openItemDialog} onClose={handleCloseItemDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>
                    {editingItem ? 'Edit Key Item' : 'Add Key Item'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Item Name"
                        value={itemForm.item_name}
                        onChange={(e) => setItemForm({ ...itemForm, item_name: e.target.value })}
                        margin="normal"
                        size="small"
                        required
                        placeholder="e.g., Medicines, Tablets, Syrups"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField
                        fullWidth
                        label="Display Order"
                        type="number"
                        value={itemForm.display_order}
                        onChange={(e) => setItemForm({ ...itemForm, display_order: parseInt(e.target.value) || 0 })}
                        margin="normal"
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={itemForm.is_active}
                                onChange={(e) => setItemForm({ ...itemForm, is_active: e.target.checked })}
                            />
                        }
                        label="Active"
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseItemDialog}>Cancel</Button>
                    <Button onClick={handleSaveItem} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {deleteType === 'category' 
                            ? `Are you sure you want to delete the category "${deleteTarget?.name}" and all its key items? This action cannot be undone.`
                            : `Are you sure you want to delete the key item "${deleteTarget?.item_name}"? This action cannot be undone.`
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" disabled={isDeleting}>
                        {isDeleting ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Import Categories Dialog */}
            <Dialog open={openBulkCategoryDialog} onClose={() => setOpenBulkCategoryDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Bulk Import Categories
                    <IconButton onClick={() => setOpenBulkCategoryDialog(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="#6b7280" sx={{ mb: 2 }}>
                        Enter one category per line with format: <strong>Name | Title | Description (optional)</strong>
                    </Typography>
                    <Paper sx={{ p: 1, mb: 2, bgcolor: '#f8f9fa', border: '1px solid #e8ecef' }}>
                        <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            Grocery Store | Food & Beverages | Fresh groceries and daily essentials{'\n'}
                            Pharmacy | Health & Wellness | Medicines and health products{'\n'}
                            Electronics Store | Electronics | Gadgets and electronic devices
                        </Typography>
                    </Paper>
                    <TextField
                        fullWidth
                        multiline
                        rows={10}
                        placeholder="Enter categories here (one per line)..."
                        value={bulkCategoryText}
                        onChange={(e) => setBulkCategoryText(e.target.value)}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBulkCategoryDialog(false)}>Cancel</Button>
                    <Button onClick={handleBulkImportCategories} variant="contained" sx={{ bgcolor: '#7c3aed' }}>
                        Import Categories
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Import Key Items Dialog */}
            <Dialog open={openBulkItemDialog} onClose={() => setOpenBulkItemDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Bulk Import Key Items
                    <IconButton onClick={() => setOpenBulkItemDialog(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="#6b7280" sx={{ mb: 2 }}>
                        Enter one item per line. Example:
                    </Typography>
                    <Paper sx={{ p: 1, mb: 2, bgcolor: '#f8f9fa', border: '1px solid #e8ecef' }}>
                        <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            Medicines{'\n'}
                            Tablets & Capsules{'\n'}
                            Syrups & Liquids{'\n'}
                            Injections{'\n'}
                            Creams & Ointments
                        </Typography>
                    </Paper>
                    <TextField
                        fullWidth
                        multiline
                        rows={10}
                        placeholder="Enter items here (one per line)..."
                        value={bulkItemText}
                        onChange={(e) => setBulkItemText(e.target.value)}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBulkItemDialog(false)}>Cancel</Button>
                    <Button onClick={handleBulkImportItems} variant="contained">Import Items</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}