import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { ordersAPI, productsAPI } from '../services/api';

// Calculate total amount with returns
const calculateTotalAmount = (items) => {
  return items.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    const returnedAmount = item.price * item.returned;
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
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    items: [{ productId: '', quantity: 0, returned: 0, price: 0 }],
    orderDate: new Date().toISOString().split('T')[0],
  });
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Fetch orders and products
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersRes, productsRes] = await Promise.all([
          ordersAPI.getAll(),
          productsAPI.getAll()
        ]);
        setOrders(ordersRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditOrder(null);
    setFormData({
      customerName: '',
      items: [{ productId: '', quantity: 0, returned: 0, price: 0 }],
      orderDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleEdit = (order) => {
    // Convert order items to form format
    const formattedItems = order.items.map(item => ({
      productId: products.find(p => p.name === item.name)?._id || '',
      name: item.name,
      quantity: item.quantity,
      returned: item.returned || 0,
      price: item.price
    }));

    setEditOrder(order);
    setFormData({
      ...order,
      items: formattedItems
    });
    setOpen(true);
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await ordersAPI.delete(orderToDelete._id);
      setOrders(orders.filter((o) => o._id !== orderToDelete._id));
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
      // Show success message
      setError('');
      setSnackbarMessage('Order deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setError('Failed to delete order');
      console.error('Error deleting order:', err);
      // Show error message
      setSnackbarMessage('Failed to delete order');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.customerName.trim()) {
        setError('Customer name is required');
        return;
      }

      if (!formData.items.length || !formData.items[0].productId) {
        setError('At least one product is required');
        return;
      }

      // Validate inventory and quantities
      for (const item of formData.items) {
        const product = products.find(p => p._id === item.productId);
        if (!product) {
          setError(`Product not found`);
          return;
        }

        if (!item.quantity || item.quantity <= 0) {
          setError(`Quantity must be greater than 0 for ${product.name}`);
          return;
        }

        if (item.returned < 0) {
          setError(`Returned amount cannot be negative for ${product.name}`);
          return;
        }

        if (item.returned > item.quantity) {
          setError(`Returned amount cannot be greater than ordered quantity for ${product.name}`);
          return;
        }

        // Yangi buyurtma uchun inventoryni tekshirish
        if (!editOrder && item.quantity > product.quantity) {
          setError(`Not enough inventory for ${product.name}. Available: ${product.quantity}`);
          return;
        }
      }

      // Prepare order data
      const orderData = {
        customerName: formData.customerName,
        orderDate: formData.orderDate,
        items: formData.items.map(item => ({
          name: products.find(p => p._id === item.productId)?.name || item.name,
          quantity: parseInt(item.quantity) || 0,
          returned: parseInt(item.returned) || 0,
          price: parseFloat(item.price) || 0
        })),
        totalAmount: calculateTotalAmount(formData.items)
      };

      if (editOrder) {
        const response = await ordersAPI.update(editOrder._id, orderData);
        setOrders(orders.map((order) =>
          order._id === editOrder._id ? response.data : order
        ));
      } else {
        const response = await ordersAPI.create(orderData);
        setOrders([...orders, response.data]);
      }
      handleClose();
    } catch (err) {
      console.error('Error saving order:', err);
      setError(err.response?.data?.error || 'Failed to save order');
    }
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
      items: [...formData.items, { productId: '', quantity: 0, returned: 0, price: 0 }]
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
    
    if (field === 'productId') {
      const product = products.find(p => p._id === value);
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productId: value,
          price: product.price,
          name: product.name,
          quantity: newItems[index].quantity || 0,
          returned: newItems[index].returned || 0
        };
      }
    } else if (['quantity', 'returned'].includes(field)) {
      const currentItem = newItems[index];
      // Agar value bo'sh bo'lsa, uni o'zgartiramiz
      if (value === '') {
        currentItem[field] = '';
      } else {
        const numValue = parseInt(value);
        if (field === 'returned') {
          // Qaytarilgan miqdor buyurtma miqdoridan oshmasligi kerak
          if (numValue > currentItem.quantity) {
            setError(`Returned amount cannot be greater than ordered quantity (${currentItem.quantity})`);
            return;
          }
          currentItem.returned = numValue;
        } else { // quantity
          // Miqdor 0 dan kam bo'lmasligi kerak
          if (numValue < 0) {
            setError('Quantity cannot be negative');
            return;
          }
          // Agar qaytarilgan miqdor buyurtma miqdoridan oshib ketsa, qaytarilgan miqdorni 0 ga tushiramiz
          if (currentItem.returned > numValue) {
            currentItem.returned = 0;
          }
          currentItem.quantity = numValue;
        }
      }
    }
    
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

  // Format numbers in input fields
  const formatNumber = (value) => {
    if (value === '' || value === null || value === undefined) return '';
    return value.toString();
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div style={{ padding: '32px', backgroundColor: '#f4f3ff', minHeight: '100vh' }}>
      <Box sx={{ 
        backgroundColor: 'white', 
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(124, 58, 237, 0.1)',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              color: 'white',
              fontSize: '1.5rem'
            }}
          >
            Orders Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleClickOpen}
            sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 15px rgba(255, 255, 255, 0.15)'
              },
              textTransform: 'none',
              boxShadow: '0 2px 10px rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '10px 24px',
              fontSize: '0.95rem',
              fontWeight: 600,
              letterSpacing: '0.3px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.2s ease',
              '& .MuiButton-startIcon': {
                marginRight: '8px',
                '& svg': {
                  fontSize: '20px'
                }
              }
            }}
          >
            New Order
          </Button>
        </Box>

        <TableContainer 
          sx={{ 
            p: 3,
            '& .MuiTableCell-root': {
              borderBottom: '1px solid #e9ecef'
            }
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#4a5568',
                  backgroundColor: '#f7fafc',
                  borderBottom: '2px solid #edf2f7'
                }}>Order #</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#4a5568',
                  backgroundColor: '#f7fafc',
                  borderBottom: '2px solid #edf2f7'
                }}>Customer</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#4a5568',
                  backgroundColor: '#f7fafc',
                  borderBottom: '2px solid #edf2f7'
                }}>Date</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#4a5568',
                  backgroundColor: '#f7fafc',
                  borderBottom: '2px solid #edf2f7'
                }}>Items Info</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#4a5568',
                  backgroundColor: '#f7fafc',
                  borderBottom: '2px solid #edf2f7'
                }}>Total</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#4a5568',
                  backgroundColor: '#f7fafc',
                  borderBottom: '2px solid #edf2f7'
                }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow 
                  key={order._id}
                  onClick={() => handleRowClick(order)}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: '#f8f7ff',
                      cursor: 'pointer'
                    },
                    transition: 'all 0.2s ease',
                    borderLeft: '4px solid transparent',
                    '&:hover': {
                      borderLeft: '4px solid #7c3aed',
                      backgroundColor: '#f8f7ff'
                    }
                  }}
                >
                  <TableCell sx={{ py: 2.5 }}>
                    {order.orderNumber.replace('ORD-2024-', '')}
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#7c3aed' }}>
                        Ketdi: {order.items.reduce((sum, item) => sum + item.quantity, 0)} ta
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#ef4444' }}>
                        Qaytdi: {order.items.reduce((sum, item) => sum + (item.returned || 0), 0)} ta
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#7c3aed', fontWeight: 500, fontSize: '0.95rem' }}>
                        {formatPrice(order.totalAmount)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#ef4444', display: 'block' }}>
                        Qaytarildi: {formatPrice(order.items.reduce((sum, item) => sum + ((item.returned || 0) * item.price), 0))}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: 1,
                      alignItems: 'center'
                    }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(order);
                        }}
                        sx={{ 
                          color: 'white',
                          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                          '&:hover': { 
                            background: 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)'
                          },
                          padding: '8px',
                          width: '34px',
                          height: '34px',
                          boxShadow: '0 2px 8px rgba(124, 58, 237, 0.2)',
                          transition: 'all 0.2s ease'
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
                          color: 'white',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          '&:hover': { 
                            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                          },
                          padding: '8px',
                          width: '34px',
                          height: '34px',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

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
                <FormControl fullWidth margin="normal">
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={item.productId || ''}
                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                  >
                    {products.map((product) => (
                      <MenuItem key={product._id} value={product._id}>
                        {product.name} - Stock: {product.quantity}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Quantity"
                  type="number"
                  value={formatNumber(item.quantity)}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  margin="normal"
                  fullWidth
                  inputProps={{ min: 0 }}
                  error={item.quantity < 0}
                  helperText={item.quantity < 0 ? "Quantity cannot be negative" : ""}
                />
                <TextField
                  label="Returned"
                  type="number"
                  value={formatNumber(item.returned)}
                  onChange={(e) => handleItemChange(index, 'returned', e.target.value)}
                  margin="normal"
                  fullWidth
                  inputProps={{ min: 0, max: item.quantity }}
                  error={item.returned > item.quantity}
                  helperText={item.returned > item.quantity ? "Cannot return more than ordered" : ""}
                />
                <TextField
                  label="Price"
                  type="number"
                  value={formatNumber(item.price)}
                  disabled
                  margin="normal"
                  fullWidth
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

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
                {new Date(selectedOrder.orderDate).toLocaleDateString()}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 3,
          backgroundColor: '#ef4444',
          color: 'white',
          fontSize: '1.1rem',
          fontWeight: 600
        }}>
          Delete Order Confirmation
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 2 }}>
          <Typography>
            Are you sure you want to delete this order?
            {orderToDelete && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                <Typography sx={{ fontWeight: 500, color: '#991b1b', mb: 1 }}>
                  Order Details:
                </Typography>
                <Typography sx={{ color: '#7f1d1d' }}>
                  Customer: {orderToDelete.customerName}
                </Typography>
                <Typography sx={{ color: '#7f1d1d' }}>
                  Total Amount: {formatPrice(orderToDelete.totalAmount)}
                </Typography>
              </Box>
            )}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleDeleteCancel}
            sx={{ 
              color: '#4b5563',
              '&:hover': {
                backgroundColor: '#f3f4f6'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            sx={{
              backgroundColor: '#ef4444',
              color: 'white',
              '&:hover': {
                backgroundColor: '#dc2626'
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Orders; 