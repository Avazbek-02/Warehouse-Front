import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

// Temporary mock data
const mockData = [
  {
    id: 1,
    name: 'Product 1',
    quantity: 100,
    price: 25000,
    category: 'Electronics',
  },
  {
    id: 2,
    name: 'Product 2',
    quantity: 50,
    price: 15000,
    category: 'Clothing',
  },
  // Add more mock data as needed
];

// Add this function to format price in UZS
const formatPrice = (price) => {
  return new Intl.NumberFormat('uz-UZ').format(price) + ' UZS';
};

function Inventory() {
  const [items, setItems] = useState(mockData);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: '',
    category: '',
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditItem(null);
    setFormData({
      name: '',
      quantity: '',
      price: '',
      category: '',
    });
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData(item);
    setOpen(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      setItems(items.filter((item) => item.id !== itemToDelete.id));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSubmit = () => {
    if (editItem) {
      setItems(
        items.map((item) =>
          item.id === editItem.id ? { ...formData, id: item.id } : item
        )
      );
    } else {
      setItems([...items, { ...formData, id: items.length + 1 }]);
    }
    handleClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '16px'
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 500,
            color: '#1a237e',
            fontSize: '1.5rem',
          }}
        >
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
          onClick={handleClickOpen}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
            textTransform: 'none',
            borderRadius: '6px',
            padding: '6px 16px',
            fontSize: '0.875rem',
            fontWeight: 500,
            boxShadow: 'none',
            height: '32px'
          }}
        >
          Add Item
        </Button>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          overflow: 'hidden',
          width: '100%'
        }}
      >
        <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '25%' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '20%' }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '20%' }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '20%' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '15%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow 
                key={item.id}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: '#f8f9fa' 
                  }
                }}
              >
                <TableCell sx={{ width: '25%' }}>{item.name}</TableCell>
                <TableCell sx={{ width: '20%' }}>{item.quantity}</TableCell>
                <TableCell sx={{ width: '20%' }}>{formatPrice(item.price)}</TableCell>
                <TableCell sx={{ width: '20%' }}>{item.category}</TableCell>
                <TableCell sx={{ width: '15%' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(item)}
                    sx={{ 
                      color: '#2196f3',
                      marginRight: '8px',
                      padding: '4px',
                      '&:hover': { 
                        backgroundColor: 'rgba(33, 150, 243, 0.08)' 
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(item)}
                    sx={{ 
                      color: '#f44336',
                      padding: '4px',
                      '&:hover': { 
                        backgroundColor: 'rgba(244, 67, 54, 0.08)' 
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={open} 
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          padding: '16px 24px',
          fontSize: '1.1rem',
          fontWeight: 500
        }}>
          {editItem ? 'Edit Item' : 'Add New Item'}
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <TextField
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="quantity"
            label="Quantity"
            type="number"
            fullWidth
            value={formData.quantity}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="price"
            label="Price (UZS)"
            type="number"
            fullWidth
            value={formData.price}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: <Typography color="textSecondary">UZS</Typography>,
            }}
          />
          <TextField
            margin="dense"
            name="category"
            label="Category"
            type="text"
            fullWidth
            value={formData.category}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions sx={{ 
          padding: '16px 24px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <Button 
            onClick={handleClose}
            sx={{ 
              color: '#666',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              },
              textTransform: 'none',
              boxShadow: 'none'
            }}
          >
            {editItem ? 'Save Changes' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            minWidth: '320px'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          padding: '16px 24px',
          fontSize: '1.1rem',
          fontWeight: 500
        }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <Typography>
            Are you sure you want to delete "{itemToDelete?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          padding: '16px 24px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <Button 
            onClick={handleDeleteCancel}
            sx={{ 
              color: '#666',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              backgroundColor: '#f44336',
              '&:hover': {
                backgroundColor: '#d32f2f'
              },
              textTransform: 'none',
              boxShadow: 'none'
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Inventory; 