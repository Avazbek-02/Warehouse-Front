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
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

// Calculate total amount for supplier credit
const calculateTotalAmount = (items) => {
  return items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
};

// Format price in UZS
const formatPrice = (price) => {
  return new Intl.NumberFormat('uz-UZ').format(price) + ' UZS';
};

function Suppliers() {
  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      supplierName: 'Acme Corp',
      creditNumber: '001',
      items: [
        { name: 'Product 1', quantity: 20, price: 20000 },
        { name: 'Product 2', quantity: 15, price: 15000 },
      ],
      creditDate: '2024-04-01',
      totalAmount: 625000,
      paidAmount: 400000,
      remainingDebt: 225000,
    },
    {
      id: 2,
      supplierName: 'XYZ Suppliers',
      creditNumber: '002',
      items: [
        { name: 'Product 3', quantity: 30, price: 10000 },
      ],
      creditDate: '2024-04-02',
      totalAmount: 300000,
      paidAmount: 200000,
      remainingDebt: 100000,
    },
  ]);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [editSupplier, setEditSupplier] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formData, setFormData] = useState({
    supplierName: '',
    items: [{ name: '', quantity: 0, price: 0 }],
    creditDate: new Date().toISOString().split('T')[0],
    paidAmount: 0,
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditSupplier(null);
    setFormData({
      supplierName: '',
      items: [{ name: '', quantity: 0, price: 0 }],
      creditDate: new Date().toISOString().split('T')[0],
      paidAmount: 0,
    });
  };

  const handleEdit = (supplier) => {
    setEditSupplier(supplier);
    setFormData(supplier);
    setOpen(true);
  };

  const handleDeleteClick = (supplier) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSupplierToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (supplierToDelete) {
      setSuppliers(suppliers.filter((supplier) => supplier.id !== supplierToDelete.id));
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };

  const handleSubmit = () => {
    const totalAmount = calculateTotalAmount(formData.items);
    const paidAmount = parseFloat(formData.paidAmount) || 0;
    const remainingDebt = totalAmount - paidAmount;
    
    if (editSupplier) {
      setSuppliers(
        suppliers.map((supplier) =>
          supplier.id === editSupplier.id ? {
            ...formData,
            id: supplier.id,
            totalAmount,
            remainingDebt,
          } : supplier
        )
      );
    } else {
      const newSupplier = {
        ...formData,
        id: suppliers.length + 1,
        creditNumber: String(suppliers.length + 1).padStart(3, '0'),
        totalAmount,
        remainingDebt,
      };
      setSuppliers([...suppliers, newSupplier]);
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

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 0, price: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    
    if (['quantity', 'price'].includes(field)) {
      if (value === '' || isNaN(value)) {
        value = '';
      } else {
        const numValue = parseInt(value);
        if (numValue < 0) {
          value = '0';
        } else {
          value = String(numValue);
        }
      }
    }
    
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const handleRowClick = (supplier) => {
    setSelectedSupplier(supplier);
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedSupplier(null);
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
          Suppliers Credit Management
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
          New Credit
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
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '15%' }}>Credit #</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '20%' }}>Supplier</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '15%' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '15%' }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '15%' }}>Paid</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '15%' }}>Debt</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '15%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow 
                key={supplier.id}
                onClick={() => handleRowClick(supplier)}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer',
                  }
                }}
              >
                <TableCell sx={{ width: '15%' }}>{supplier.creditNumber}</TableCell>
                <TableCell sx={{ width: '20%' }}>{supplier.supplierName}</TableCell>
                <TableCell sx={{ width: '15%' }}>{supplier.creditDate}</TableCell>
                <TableCell sx={{ width: '15%' }}>{formatPrice(supplier.totalAmount)}</TableCell>
                <TableCell sx={{ width: '15%' }}>{formatPrice(supplier.paidAmount)}</TableCell>
                <TableCell sx={{ width: '15%' }}>
                  <Chip 
                    label={formatPrice(supplier.remainingDebt)} 
                    sx={{ 
                      backgroundColor: supplier.remainingDebt > 0 ? '#ffebee' : '#e8f5e9',
                      color: supplier.remainingDebt > 0 ? '#d32f2f' : '#388e3c',
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ width: '15%' }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(supplier);
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(supplier);
                    }}
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

      {/* Credit Entry Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
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
          {editSupplier ? 'Edit Supplier Credit' : 'New Supplier Credit'}
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <TextField
            margin="dense"
            name="supplierName"
            label="Supplier Name"
            type="text"
            fullWidth
            value={formData.supplierName}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="creditDate"
            label="Credit Date"
            type="date"
            fullWidth
            value={formData.creditDate}
            onChange={handleInputChange}
            sx={{ mb: 3 }}
          />
          
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>Credit Items</Typography>
          
          {formData.items.map((item, index) => (
            <Box 
              key={index} 
              sx={{ 
                mb: 2, 
                p: 2, 
                border: '1px solid #e0e0e0', 
                borderRadius: '4px',
                backgroundColor: '#fff'
              }}
            >
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: 'minmax(200px, 1fr) 150px 200px auto',
                  gap: 2,
                  alignItems: 'center'
                }}
              >
                <TextField
                  label="Product Name"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  required
                  size="small"
                  sx={{ width: '100%' }}
                />
                <TextField
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  required
                  size="small"
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Price (UZS)"
                  type="number"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                  required
                  size="small"
                  inputProps={{ min: 0 }}
                />
                <IconButton 
                  onClick={() => handleRemoveItem(index)}
                  sx={{ 
                    color: '#f44336',
                    '&:hover': { 
                      backgroundColor: 'rgba(244, 67, 54, 0.08)' 
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
          
          <Button 
            variant="outlined"
            onClick={handleAddItem}
            startIcon={<AddIcon />}
            sx={{ 
              mb: 3,
              color: '#1976d2',
              borderColor: '#1976d2',
              '&:hover': { 
                backgroundColor: 'rgba(25, 118, 210, 0.04)', 
                borderColor: '#1565c0' 
              }
            }}
          >
            Add Item
          </Button>
          
          {formData.items.some(item => item.quantity > 0 || item.price > 0) && (
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#1976d2' }}>
                Credit Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Total Items: {formData.items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Total Amount: {formatPrice(calculateTotalAmount(formData.items))}
                </Typography>
              </Box>
              
              <TextField
                margin="dense"
                name="paidAmount"
                label="Paid Amount (UZS)"
                type="number"
                fullWidth
                value={formData.paidAmount}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                backgroundColor: '#e8f5e9',
                padding: '10px',
                borderRadius: '4px',
                alignItems: 'center'
              }}>
                <Typography variant="subtitle2">Remaining Debt:</Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: '#d32f2f',
                    fontWeight: 500
                  }}
                >
                  {formatPrice(Math.max(0, calculateTotalAmount(formData.items) - (parseFloat(formData.paidAmount) || 0)))}
                </Typography>
              </Box>
            </Box>
          )}
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
            {editSupplier ? 'Save Changes' : 'Create Credit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 500 }}>Delete Confirmation</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this supplier credit record? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button 
            onClick={handleDeleteCancel}
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            sx={{ boxShadow: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleDetailsClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }
        }}
      >
        {selectedSupplier && (
          <>
            <DialogTitle sx={{ 
              borderBottom: '1px solid #e0e0e0',
              padding: '16px 24px',
              fontSize: '1.1rem',
              fontWeight: 500,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Credit Details - #{selectedSupplier.creditNumber}</span>
              <Chip 
                label={formatPrice(selectedSupplier.remainingDebt)} 
                sx={{ 
                  backgroundColor: selectedSupplier.remainingDebt > 0 ? '#ffebee' : '#e8f5e9',
                  color: selectedSupplier.remainingDebt > 0 ? '#d32f2f' : '#388e3c',
                  fontWeight: 500,
                }}
              />
            </DialogTitle>
            <DialogContent sx={{ padding: '24px' }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    <strong>Supplier:</strong> {selectedSupplier.supplierName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    <strong>Date:</strong> {selectedSupplier.creditDate}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    <strong>Total Amount:</strong> {formatPrice(selectedSupplier.totalAmount)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    <strong>Paid Amount:</strong> {formatPrice(selectedSupplier.paidAmount)}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>Items</Typography>
              
              <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedSupplier.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatPrice(item.price)}</TableCell>
                        <TableCell>{formatPrice(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions sx={{ 
              padding: '16px 24px',
              borderTop: '1px solid #e0e0e0'
            }}>
              <Button 
                onClick={handleDetailsClose}
                sx={{ 
                  color: '#666',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}

export default Suppliers; 