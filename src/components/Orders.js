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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

// Calculate total amount with returns
const calculateTotalAmount = (items) => {
  return items.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity; // Umumiy narx
    const returnedAmount = item.price * item.returned; // Qaytarilgan tovarlar narxi
    return sum + (itemTotal - returnedAmount);
  }, 0);
};

// Format price in UZS
const formatPrice = (price) => {
  return new Intl.NumberFormat('uz-UZ').format(price) + ' UZS';
};

// Status chip colors
const statusColors = {
  pending: '#ffa726',
  processing: '#29b6f6',
  completed: '#66bb6a',
  cancelled: '#ef5350',
};

function Orders() {
  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNumber: '001',
      customerName: 'John Doe',
      items: [
        { name: 'Product 1', quantity: 50, returned: 5, price: 25000 },
        { name: 'Product 2', quantity: 30, returned: 0, price: 15000 },
      ],
      orderDate: '2024-03-15',
      totalAmount: 1725000,
    },
    {
      id: 2,
      orderNumber: '002',
      customerName: 'Jane Smith',
      items: [
        { name: 'Product 2', quantity: 100, returned: 10, price: 15000 },
      ],
      orderDate: '2024-03-14',
      totalAmount: 1350000,
    },
  ]);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    items: [{ name: '', quantity: 0, returned: 0, price: 0 }],
    orderDate: new Date().toISOString().split('T')[0],
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditOrder(null);
    setFormData({
      customerName: '',
      items: [{ name: '', quantity: 0, returned: 0, price: 0 }],
      orderDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleEdit = (order) => {
    setEditOrder(order);
    setFormData(order);
    setOpen(true);
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (orderToDelete) {
      setOrders(orders.filter((order) => order.id !== orderToDelete.id));
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleSubmit = () => {
    if (editOrder) {
      setOrders(
        orders.map((order) =>
          order.id === editOrder.id ? {
            ...formData,
            id: order.id,
            totalAmount: calculateTotalAmount(formData.items)
          } : order
        )
      );
    } else {
      const newOrder = {
        ...formData,
        id: orders.length + 1,
        orderNumber: String(orders.length + 1).padStart(3, '0'),
        totalAmount: calculateTotalAmount(formData.items),
      };
      setOrders([...orders, newOrder]);
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
      items: [...formData.items, { name: '', quantity: 0, returned: 0, price: 0 }]
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
    
    if (['quantity', 'returned', 'price'].includes(field)) {
      // Agar value bo'sh bo'lsa yoki NaN bo'lsa, 0 ga o'rnatamiz
      if (value === '' || isNaN(value)) {
        value = '';
      } else {
        // Manfiy sonlarni oldini olish
        const numValue = parseInt(value);
        if (numValue < 0) {
          value = '0';
        } else {
          value = String(numValue);
        }
        
        // Qaytarilgan miqdor buyurtma miqdoridan oshmasligi kerak
        if (field === 'returned' && numValue > newItems[index].quantity) {
          value = String(newItems[index].quantity);
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

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedOrder(null);
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
          Orders Management
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
          New Order
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
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '15%' }}>Order #</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '20%' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '15%' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '20%' }}>Items Info</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '15%' }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#424242', width: '15%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow 
                key={order.id}
                onClick={() => handleRowClick(order)}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer'
                  }
                }}
              >
                <TableCell>
                  {order.orderNumber.replace('ORD-2024-', '')}
                </TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.orderDate}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#1976d2' }}>
                      Ketdi: {order.items.reduce((sum, item) => sum + item.quantity, 0)} ta
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#f44336' }}>
                      Qaytdi: {order.items.reduce((sum, item) => sum + item.returned, 0)} ta
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 500, fontSize: '0.95rem' }}>
                      {formatPrice(order.totalAmount)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#f44336', display: 'block' }}>
                      Qaytarildi: {formatPrice(order.items.reduce((sum, item) => sum + (item.returned * item.price), 0))}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(order);
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
                      handleDeleteClick(order);
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
          {editOrder ? 'Edit Order' : 'New Order'}
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <TextField
            margin="dense"
            name="customerName"
            label="Customer Name"
            type="text"
            fullWidth
            value={formData.customerName}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="orderDate"
            label="Order Date"
            type="date"
            fullWidth
            value={formData.orderDate}
            onChange={handleInputChange}
            sx={{ mb: 3 }}
          />
          
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>Order Items</Typography>
          
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
                  gridTemplateColumns: 'minmax(200px, 1fr) 150px 150px 200px auto',
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
                  label="Returned"
                  type="number"
                  value={item.returned}
                  onChange={(e) => handleItemChange(index, 'returned', e.target.value)}
                  size="small"
                  inputProps={{ 
                    min: 0,
                    max: item.quantity 
                  }}
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
                {formData.items.length > 1 && (
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(index);
                    }}
                    sx={{ 
                      color: '#f44336',
                      width: '40px',
                      height: '40px',
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.08)'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              {/* Item total */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                mt: 1,
                pt: 1,
                borderTop: '1px solid #f0f0f0'
              }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Item Total: {formatPrice((item.quantity - item.returned) * item.price)}
                </Typography>
              </Box>
            </Box>
          ))}
          
          <Button
            variant="outlined"
            onClick={handleAddItem}
            startIcon={<AddIcon />}
            sx={{ 
              mt: 1,
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            Add Item
          </Button>

          {/* Order Summary */}
          {formData.items.some(item => item.quantity > 0 || item.price > 0) && (
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#1976d2' }}>
                Order Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Total Items: {formData.items.reduce((sum, item) => sum + item.quantity, 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Returned Items: {formData.items.reduce((sum, item) => sum + item.returned, 0)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="subtitle2">Total Amount:</Typography>
                <Typography variant="subtitle2" sx={{ color: '#1976d2' }}>
                  {formatPrice(calculateTotalAmount(formData.items))}
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
            {editOrder ? 'Save Changes' : 'Create Order'}
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
            Are you sure you want to delete order "{orderToDelete?.orderNumber}"?
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

      {/* Order Details Dialog */}
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
        {selectedOrder && (
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
              <Box>
                Order Details - #{selectedOrder.orderNumber}
              </Box>
              <Typography variant="body2" sx={{ color: '#666' }}>
                {selectedOrder.orderDate}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ padding: '24px' }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                  Customer Information
                </Typography>
                <Typography variant="h6" sx={{ color: '#1a237e' }}>
                  {selectedOrder.customerName}
                </Typography>
              </Box>

              <Typography variant="subtitle2" sx={{ color: '#666', mb: 2 }}>
                Order Items
              </Typography>
              
              <TableContainer sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 500 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>Returned</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>Price</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <Typography sx={{ color: item.returned > 0 ? '#f44336' : '#666' }}>
                            {item.returned}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatPrice(item.price)}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography>
                              {formatPrice((item.quantity - item.returned) * item.price)}
                            </Typography>
                            {item.returned > 0 && (
                              <Typography variant="caption" sx={{ color: '#f44336', display: 'block' }}>
                                -{formatPrice(item.returned * item.price)}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ 
                backgroundColor: '#f8f9fa',
                padding: '16px',
                borderRadius: '4px',
                border: '1px solid #e0e0e0'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Total Items:
                  </Typography>
                  <Typography variant="body2">
                    {selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)} ta
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Returned Items:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#f44336' }}>
                    {selectedOrder.items.reduce((sum, item) => sum + item.returned, 0)} ta
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Total Returns Amount:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#f44336' }}>
                    {formatPrice(selectedOrder.items.reduce((sum, item) => sum + (item.returned * item.price), 0))}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  pt: 1,
                  mt: 1,
                  borderTop: '1px solid #e0e0e0'
                }}>
                  <Typography variant="subtitle2">
                    Final Amount:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#1976d2' }}>
                    {formatPrice(selectedOrder.totalAmount)}
                  </Typography>
                </Box>
              </Box>
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
              <Button 
                onClick={() => {
                  handleDetailsClose();
                  handleEdit(selectedOrder);
                }}
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
                Edit Order
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}

export default Orders; 