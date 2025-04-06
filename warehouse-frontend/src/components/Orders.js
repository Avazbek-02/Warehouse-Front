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
        setError('Ma\'lumotlarni yuklashda xatolik yuz berdi');
        console.error('Ma\'lumotlarni yuklashda xatolik:', err);
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
      setSnackbarMessage('Buyurtma muvaffaqiyatli o\'chirildi');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setError('Buyurtmani o\'chirishda xatolik');
      console.error('Buyurtmani o\'chirishda xatolik:', err);
      // Show error message
      setSnackbarMessage('Buyurtmani o\'chirishda xatolik');
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
        setError('Mijoz ismi kiritilishi shart');
        return;
      }

      if (!formData.items.length || !formData.items[0].productId) {
        setError('Kamida bitta mahsulot tanlash kerak');
        return;
      }

      // Validate inventory and quantities
      for (const item of formData.items) {
        const product = products.find(p => p._id === item.productId);
        if (!product) {
          setError(`Mahsulot topilmadi`);
          return;
        }

        if (!item.quantity || item.quantity <= 0) {
          setError(`${product.name} uchun miqdor 0 dan katta bo'lishi kerak`);
          return;
        }

        if (item.returned < 0) {
          setError(`${product.name} uchun qaytarilgan miqdor manfiy bo'lishi mumkin emas`);
          return;
        }

        if (item.returned > item.quantity) {
          setError(`${product.name} uchun qaytarilgan miqdor buyurtma miqdoridan ko'p bo'lishi mumkin emas`);
          return;
        }

        // Tahrirlash uchun inventarni tekshirish
        if (editOrder) {
          const originalOrder = orders.find(o => o._id === editOrder._id);
          const originalItem = originalOrder.items.find(i => 
            products.find(p => p._id === item.productId)?.name === i.name
          );
          
          // Yangi buyurilgan miqdor eskisidan ko'p bo'lsa, qo'shimcha miqdor uchun inventarni tekshiramiz
          if (originalItem && item.quantity > originalItem.quantity) {
            const additionalQuantity = item.quantity - originalItem.quantity;
            if (additionalQuantity > product.quantity) {
              setError(`${product.name} uchun omborda yetarli mahsulot yo'q. Mavjud: ${product.quantity}`);
              return;
            }
          }
        }

        if (item.price < 0) {
          setError(`${product.name} uchun narx manfiy bo'lishi mumkin emas`);
          return;
        }
      }

      // Prepare order data
      const orderData = {
        customerName: formData.customerName.trim(),
        orderDate: formData.orderDate,
        items: formData.items
          .filter(item => item.productId) // Filter out items with no product selected
          .map(item => {
            const product = products.find(p => p._id === item.productId);
            if (!product) {
              throw new Error(`Mahsulot topilmadi. Iltimos, qaytadan tanlang.`);
            }
            return {
              name: product.name,
              quantity: parseInt(item.quantity) || 0,
              returned: parseInt(item.returned) || 0,
              price: parseFloat(item.price) || 0,
            };
          }),
        status: formData.status || 'pending',
      };

      // Calculate and add the total amount
      const totalAmount = calculateTotalAmount(orderData.items);
      orderData.totalAmount = totalAmount;

      // Ensure we have at least one item
      if (orderData.items.length === 0) {
        setError('Kamida bitta mahsulot tanlash kerak');
        return;
      }

      let response;
      if (editOrder) {
        // Update existing order
        response = await ordersAPI.update(editOrder._id, orderData);
        setOrders(orders.map((order) => (order._id === editOrder._id ? response.data : order)));
        setSnackbarMessage('Buyurtma muvaffaqiyatli yangilandi');
      } else {
        // Create new order
        response = await ordersAPI.create(orderData);
        setOrders([...orders, response.data]);
        setSnackbarMessage('Buyurtma muvaffaqiyatli yaratildi');
      }

      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setError('');
      handleClose();
    } catch (err) {
      console.error('Buyurtmani saqlashda xatolik:', err);
      // Try to display specific error message from server if available
      const errorMessage = err.response?.data?.error || err.message || 'Buyurtmani saqlashda xatolik yuz berdi';
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    
    if (field === 'productId') {
      // Mahsulot tanlaganda narxni avtomatik olish
      const product = products.find(p => p._id === value);
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productId: value,
          name: product.name,
          price: product.price,
          maxQuantity: product.quantity
        };
      }
    } else if (['quantity', 'returned'].includes(field)) {
      // Bo'sh qiymat yoki 0 ni qabul qilish
      if (value === '' || value === '0') {
        newItems[index] = {
          ...newItems[index],
          [field]: ''
        };
        setFormData({
          ...formData,
          items: newItems
        });
        return;
      }
      
      // Faqat raqamlarni qabul qilish
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0) {
        // Qaytarilgan miqdor buyurtma miqdoridan ko'p bo'lmasligi kerak
        if (field === 'returned' && numValue > newItems[index].quantity) {
          return;
        }

        // Agar edit qilish bo'lsa
        if (editOrder) {
          const originalOrder = editOrder;
          const originalItem = originalOrder.items.find(i => i.name === newItems[index].name);
          
          if (field === 'quantity') {
            const product = products.find(p => p._id === newItems[index].productId);
            if (product) {
              // Eski miqdor va yangi miqdor farqini tekshirish
              const difference = numValue - (originalItem ? originalItem.quantity : 0);
              
              // Agar farq musbat bo'lsa (ko'proq so'ralgan)
              if (difference > 0 && difference > product.quantity) {
                setSnackbarMessage(`Omborda yetarli mahsulot yo'q. Mavjud: ${product.quantity}`);
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                return;
              }
            }
          }
        } else {
          // Yangi buyurtma uchun
          if (field === 'quantity') {
            const product = products.find(p => p._id === newItems[index].productId);
            if (product && numValue > product.quantity) {
              setSnackbarMessage(`Omborda yetarli mahsulot yo'q. Mavjud: ${product.quantity}`);
              setSnackbarSeverity('error');
              setSnackbarOpen(true);
              return;
            }
          }
        }
        
        newItems[index] = {
          ...newItems[index],
          [field]: numValue
        };
      }
    }
    
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 0, returned: 0, price: 0 }],
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) {
      setError('Kamida bitta mahsulot bo\'lishi kerak');
      return;
    }
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o._id === orderId);
      if (!order) return;
      
      const updatedOrder = { ...order, status: newStatus };
      const response = await ordersAPI.update(orderId, updatedOrder);
      
      setOrders(orders.map(o => o._id === orderId ? response.data : o));
      setSnackbarMessage('Buyurtma holati yangilandi');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Buyurtma holatini yangilashda xatolik:', err);
      setSnackbarMessage('Buyurtma holatini yangilashda xatolik');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div style={{ padding: { xs: '8px', sm: '16px', md: '32px' } }}>
      <Box sx={{ 
        backgroundColor: 'white', 
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(124, 58, 237, 0.1)',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          p: { xs: 2, sm: 3 }, 
          borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 0 },
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
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Buyurtmalar Boshqaruvi
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
              padding: { xs: '8px 16px', sm: '10px 24px' },
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
              fontWeight: 600,
              letterSpacing: '0.3px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.2s ease',
              width: { xs: '100%', sm: 'auto' },
              '& .MuiButton-startIcon': {
                marginRight: '8px',
                '& svg': {
                  fontSize: '20px'
                }
              }
            }}
          >
            Yangi Buyurtma
          </Button>
        </Box>

        <TableContainer 
          sx={{ 
            p: { xs: 1, sm: 2, md: 3 },
            '& .MuiTableCell-root': {
              borderBottom: '1px solid #e9ecef',
              padding: { xs: '8px', sm: '16px' },
              whiteSpace: { xs: 'nowrap', md: 'normal' }
            },
            overflowX: 'auto'
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#4a5568',
                  backgroundColor: '#f7fafc',
                  borderBottom: '2px solid #edf2f7',
                  display: { xs: 'none', sm: 'table-cell' }
                }}>Buyurtma #</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#4a5568',
                  backgroundColor: '#f7fafc',
                  borderBottom: '2px solid #edf2f7'
                }}>Mijoz</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#4a5568',
                  backgroundColor: '#f7fafc',
                  borderBottom: '2px solid #edf2f7',
                  display: { xs: 'none', md: 'table-cell' }
                }}>Sana</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#4a5568',
                  backgroundColor: '#f7fafc',
                  borderBottom: '2px solid #edf2f7'
                }}>Mahsulotlar</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#4a5568',
                  backgroundColor: '#f7fafc',
                  borderBottom: '2px solid #edf2f7'
                }}>Jami</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#4a5568',
                  backgroundColor: '#f7fafc',
                  borderBottom: '2px solid #edf2f7',
                  width: { xs: '80px', sm: 'auto' }
                }}>Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow 
                  key={order._id}
                  onClick={() => handleViewDetails(order)}
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
                  <TableCell sx={{ 
                    py: 2.5,
                    display: { xs: 'none', sm: 'table-cell' }
                  }}>
                    {order.orderNumber.replace('ORD-2024-', '')}
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell sx={{
                    display: { xs: 'none', md: 'table-cell' }
                  }}>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#7c3aed', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        Ketdi: {order.items.reduce((sum, item) => sum + item.quantity, 0)} ta
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#ef4444', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        Qaytdi: {order.items.reduce((sum, item) => sum + (item.returned || 0), 0)} ta
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#7c3aed', fontWeight: 500, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                        {formatPrice(order.totalAmount)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Qaytarildi: {formatPrice(order.items.reduce((sum, item) => sum + ((item.returned || 0) * item.price), 0))}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'row', md: 'column' },
                      gap: 1,
                      alignItems: 'center',
                      justifyContent: { xs: 'center', md: 'flex-start' }
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
                          padding: { xs: '6px', sm: '8px' },
                          width: { xs: '30px', sm: '34px' },
                          height: { xs: '30px', sm: '34px' },
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
                          padding: { xs: '6px', sm: '8px' },
                          width: { xs: '30px', sm: '34px' },
                          height: { xs: '30px', sm: '34px' },
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
        fullScreen={window.innerWidth < 600}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: '16px' },
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100%', sm: 'calc(100% - 64px)' }
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          padding: '16px 24px',
          fontSize: '1.1rem',
          fontWeight: 500
        }}>
          {editOrder ? 'Buyurtmani Tahrirlash' : 'Yangi Buyurtma'}
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <TextField
            margin="dense"
            name="customerName"
            label="Mijoz Ismi"
            type="text"
            fullWidth
            value={formData.customerName}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="orderDate"
            label="Buyurtma Sanasi"
            type="date"
            fullWidth
            value={formData.orderDate}
            onChange={handleInputChange}
            sx={{ mb: 3 }}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              max: "2100-12-31"
            }}
          />
          
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>Buyurtma Mahsulotlari</Typography>
          
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
                  <InputLabel>Mahsulot</InputLabel>
                  <Select
                    value={item.productId || ''}
                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                  >
                    {products.map((product) => (
                      <MenuItem key={product._id} value={product._id}>
                        {product.name} - Omborda: {product.quantity}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Miqdori"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  margin="normal"
                  fullWidth
                  inputProps={{ min: 0 }}
                  error={item.quantity < 0}
                  helperText={item.quantity < 0 ? "Miqdor manfiy bo'lishi mumkin emas" : ""}
                />
                <TextField
                  label="Qaytarilgan"
                  type="number"
                  value={item.returned}
                  onChange={(e) => handleItemChange(index, 'returned', e.target.value)}
                  margin="normal"
                  fullWidth
                  inputProps={{ min: 0, max: item.quantity }}
                  error={item.returned > item.quantity}
                  helperText={item.returned > item.quantity ? "Buyurtmadan ko'p qaytarish mumkin emas" : ""}
                />
                <TextField
                  label="Narxi"
                  type="number"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                  margin="normal"
                  fullWidth
                  error={item.price < 0}
                  helperText={item.price < 0 ? "Narx manfiy bo'lishi mumkin emas" : ""}
                />
                {formData.items.length > 1 && (
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(index);
                    }}
                    sx={{ 
                      color: 'white',
                      backgroundColor: '#ef4444',
                      width: '40px',
                      height: '40px',
                      '&:hover': {
                        backgroundColor: '#dc2626'
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
                  Jami: {formatPrice((item.quantity - item.returned) * item.price)}
                </Typography>
              </Box>
            </Box>
          ))}
          
          <Button
            variant="contained"
            onClick={handleAddItem}
            startIcon={<AddIcon />}
            sx={{ 
              mt: 1,
              backgroundColor: '#1976d2',
              color: 'white',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            Mahsulot Qo'shish
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
                Buyurtma Xulasasi
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Jami Mahsulotlar: {formData.items.reduce((sum, item) => sum + item.quantity, 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Qaytarilgan Mahsulotlar: {formData.items.reduce((sum, item) => sum + item.returned, 0)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="subtitle2">Umumiy Summa:</Typography>
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
              color: 'white',
              backgroundColor: '#6b7280',
              '&:hover': {
                backgroundColor: '#4b5563'
              }
            }}
          >
            Bekor Qilish
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
            {editOrder ? 'O\'zgarishlarni Saqlash' : 'Buyurtma Yaratish'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Order Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedOrder(null);
        }}
        maxWidth="md"
        fullWidth
        fullScreen={window.innerWidth < 600}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: '16px' },
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100%', sm: 'calc(100% - 64px)' }
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
                Buyurtma Tafsilotlari - #{selectedOrder.orderNumber}
              </Box>
              <Typography variant="body2" sx={{ color: '#666' }}>
                {new Date(selectedOrder.orderDate).toLocaleDateString()}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ padding: '24px' }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                  Mijoz Ma'lumotlari
                </Typography>
                <Typography variant="h6" sx={{ color: '#1a237e' }}>
                  {selectedOrder.customerName}
                </Typography>
              </Box>

              <Typography variant="subtitle2" sx={{ color: '#666', mb: 2 }}>
                Buyurtma Mahsulotlari
              </Typography>
              
              <TableContainer sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 500 }}>Mahsulot</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>Miqdori</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>Qaytarilgan</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>Narxi</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>Jami</TableCell>
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
                    Jami Mahsulotlar:
                  </Typography>
                  <Typography variant="body2">
                    {selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)} ta
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Qaytarilgan Mahsulotlar:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#f44336' }}>
                    {selectedOrder.items.reduce((sum, item) => sum + item.returned, 0)} ta
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Qaytarilgan Summa:
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
                    Yakuniy Summa:
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
                onClick={() => {
                  setDetailsOpen(false);
                  setSelectedOrder(null);
                  handleEdit(selectedOrder);
                }}
                variant="contained"
                sx={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  },
                  textTransform: 'none',
                  boxShadow: 'none'
                }}
              >
                Buyurtmani Tahrirlash
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: '12px', sm: '16px' },
            overflow: 'hidden',
            m: { xs: 2, sm: 4 }
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
          Buyurtmani O'chirish Tasdiqlash
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 2 }}>
          <Typography>
            Haqiqatan ham bu buyurtmani o'chirishni xohlaysizmi?
            {orderToDelete && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                <Typography sx={{ fontWeight: 500, color: '#991b1b', mb: 1 }}>
                  Buyurtma Ma'lumotlari:
                </Typography>
                <Typography sx={{ color: '#7f1d1d' }}>
                  Mijoz: {orderToDelete.customerName}
                </Typography>
                <Typography sx={{ color: '#7f1d1d' }}>
                  Umumiy Summa: {formatPrice(orderToDelete.totalAmount)}
                </Typography>
              </Box>
            )}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleDeleteCancel}
            sx={{ 
              color: 'white',
              backgroundColor: '#6b7280',
              '&:hover': {
                backgroundColor: '#4b5563'
              }
            }}
          >
            Bekor Qilish
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              backgroundColor: '#ef4444',
              color: 'white',
              '&:hover': {
                backgroundColor: '#dc2626'
              }
            }}
          >
            O'chirish
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Orders; 