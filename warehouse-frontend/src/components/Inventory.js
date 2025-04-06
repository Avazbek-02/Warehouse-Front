import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { productsAPI } from '../services/api';

// Format price in UZS
const formatPrice = (price) => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    maximumFractionDigits: 0,
  }).format(price);
};

function Inventory() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    price: 0,
    category: ''
  });
  const [editProductId, setEditProductId] = useState(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Function to fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Mahsulotlarni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
      showAlert('Mahsulotlarni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show alert message
  const showAlert = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value,
    });
  };

  // Open add product dialog
  const handleAdd = () => {
    setFormData({
      name: '',
      description: '',
      quantity: 0,
      price: 0,
      category: ''
    });
    setEditProductId(null);
    setOpen(true);
  };

  // Open edit product dialog
  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      quantity: product.quantity,
      price: product.price,
      category: product.category || ''
    });
    setEditProductId(product._id);
    setOpen(true);
  };

  // Handle quantity add dialog
  const handleAddQuantity = (product) => {
    setFormData({
      ...product,
      addQuantity: 0
    });
    setEditProductId(product._id);
    setOpen(true);
  };

  // Close dialog
  const handleClose = () => {
    setOpen(false);
    setEditProductId(null);
    setFormData({
      name: '',
      description: '',
      quantity: 0,
      price: 0,
      category: ''
    });
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      if (editProductId) {
        if (formData.addQuantity) {
          // Add quantity to existing product
          const updatedProduct = {
            ...formData,
            quantity: Number(formData.quantity) + Number(formData.addQuantity)
          };
          delete updatedProduct.addQuantity;
          
          const response = await productsAPI.update(editProductId, updatedProduct);
          setProducts(products.map(p => (p._id === editProductId ? response.data : p)));
          showAlert('Mahsulot miqdori muvaffaqiyatli yangilandi.');
        } else {
          // Update product
          const response = await productsAPI.update(editProductId, formData);
          setProducts(products.map(p => (p._id === editProductId ? response.data : p)));
          showAlert('Mahsulot muvaffaqiyatli yangilandi.');
        }
      } else {
        // Create product
        const response = await productsAPI.create(formData);
        setProducts([response.data, ...products]);
        showAlert('Mahsulot muvaffaqiyatli qo\'shildi.');
      }
      handleClose();
    } catch (err) {
      showAlert(
        err.response?.data?.error || 'Mahsulotni saqlashda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.',
        'error'
      );
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setEditProductId(product._id);
    setDeleteDialogOpen(true);
  };

  // Close delete dialog
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
    setEditProductId(null);
  };

  // Delete product
  const handleDelete = async () => {
    try {
      if (!editProductId) return;
      
      await productsAPI.delete(editProductId);
      setProducts(products.filter(p => p._id !== editProductId));
      showAlert('Mahsulot muvaffaqiyatli o\'chirildi.');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      setEditProductId(null);
    } catch (err) {
      showAlert('Mahsulotni o\'chirishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.', 'error');
    }
  };

  return (
    <div style={{ padding: { xs: '16px', sm: '24px', md: '32px' } }}>
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
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 2, sm: 0 },
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
            Ombor Boshqaruvi
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
              },
              textTransform: 'none',
              boxShadow: '0 2px 10px rgba(124, 58, 237, 0.2)',
              borderRadius: '12px',
              padding: '10px 24px',
              fontSize: '0.95rem',
              fontWeight: 600,
              letterSpacing: '0.3px',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              transition: 'all 0.2s ease',
              '& .MuiButton-startIcon': {
                marginRight: '8px',
                '& svg': {
                  fontSize: '20px'
                }
              }
            }}
          >
            Mahsulot Qo'shish
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress size={40} sx={{ color: '#7c3aed' }} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert 
              severity="error" 
              sx={{ 
                borderRadius: '8px',
                '& .MuiAlert-icon': {
                  color: '#e53e3e'
                }
              }}
            >
              {error}
            </Alert>
          </Box>
        ) : (
          <Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      fontWeight: 600, 
                      color: '#4a5568',
                      backgroundColor: '#f7fafc',
                      borderBottom: '2px solid #edf2f7'
                    }}>
                      Nomi
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600, 
                      color: '#4a5568',
                      backgroundColor: '#f7fafc',
                      borderBottom: '2px solid #edf2f7'
                    }}>
                      Tavsif
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600, 
                      color: '#4a5568',
                      backgroundColor: '#f7fafc',
                      borderBottom: '2px solid #edf2f7'
                    }}>
                      Kategoriya
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600, 
                      color: '#4a5568',
                      backgroundColor: '#f7fafc',
                      borderBottom: '2px solid #edf2f7'
                    }}>
                      Miqdori
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600, 
                      color: '#4a5568',
                      backgroundColor: '#f7fafc',
                      borderBottom: '2px solid #edf2f7'
                    }}>
                      Narxi
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600, 
                      color: '#4a5568',
                      backgroundColor: '#f7fafc',
                      borderBottom: '2px solid #edf2f7',
                      width: '100px'
                    }}>
                      Amallar
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow 
                      key={product._id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: '#f8f7ff'
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
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        <Typography sx={{ fontWeight: 500, color: '#2d3748' }}>
                          {product.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ 
                        color: '#4a5568',
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        {product.description || '-'}
                      </TableCell>
                      <TableCell sx={{ 
                        color: '#4a5568',
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        {product.category || '-'}
                      </TableCell>
                      <TableCell sx={{ 
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        <Typography sx={{ 
                          fontWeight: 500,
                          color: product.quantity > 0 ? '#2d3748' : '#e53e3e'
                        }}>
                          {product.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ 
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        <Typography sx={{ 
                          fontWeight: 500,
                          color: '#2d3748'
                        }}>
                          {formatPrice(product.price)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ 
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            onClick={() => handleEdit(product)}
                            size="small"
                            sx={{ 
                              color: '#3b82f6',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
                              width: '36px',
                              height: '36px'
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteClick(product)}
                            size="small"
                            sx={{ 
                              color: '#ef4444',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
                              width: '36px',
                              height: '36px'
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
        )}
      </Box>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #edf2f7',
          p: 3,
          backgroundColor: '#7c3aed',
          color: 'white'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editProductId ? (formData.addQuantity !== undefined ? 'Miqdor Qo\'shish' : 'Mahsulotni Tahrirlash') : 'Yangi Mahsulot Qo\'shish'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Nomi"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              disabled={formData.addQuantity !== undefined}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
            <TextField
              label="Tavsif"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              disabled={formData.addQuantity !== undefined}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
            <TextField
              label="Kategoriya"
              name="category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              disabled={formData.addQuantity !== undefined}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
            {formData.addQuantity !== undefined ? (
              <TextField
                label="Miqdor Qo'shish"
                name="addQuantity"
                type="number"
                value={formData.addQuantity}
                onChange={handleChange}
                fullWidth
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            ) : (
              <TextField
                label="Miqdori"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                fullWidth
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            )}
            <TextField
              label="Narxi (UZS)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              fullWidth
              required
              disabled={formData.addQuantity !== undefined}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          gap: 1,
          borderTop: '1px solid #edf2f7'
        }}>
          <Button 
            onClick={handleClose} 
            sx={{ 
              color: 'white',
              backgroundColor: '#7c3aed',
              '&:hover': {
                backgroundColor: '#6d28d9'
              }
            }}
          >
            BEKOR QILISH
          </Button>
          {editProductId && formData.addQuantity === undefined && (
            <Button 
              onClick={() => {
                handleDeleteClick(formData);
                handleClose();
              }}
              sx={{ 
                backgroundColor: '#fed7d7',
                color: '#e53e3e',
                '&:hover': {
                  backgroundColor: '#fecaca'
                }
              }}
            >
              O'CHIRISH
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: '#7c3aed',
              '&:hover': {
                backgroundColor: '#6d28d9'
              },
              boxShadow: 'none'
            }}
          >
            {editProductId ? (formData.addQuantity !== undefined ? 'QO\'SHISH' : 'YANGILASH') : 'SAQLASH'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: { 
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#ef4444',
          color: 'white',
          textAlign: 'center',
          py: 2
        }}>
          Mahsulotni O'chirish
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 3 }}>
          <Typography sx={{ fontWeight: 400, fontSize: '16px', textAlign: 'center', mb: 2 }}>
            Siz aniq bu mahsulotni o'chirmoqchimisiz?
          </Typography>
          
          {productToDelete && (
            <Box sx={{ 
              backgroundColor: 'rgba(254, 226, 226, 0.5)', 
              p: 2, 
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              mb: 2
            }}>
              <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#1a1a1a' }}>
                Mahsulot ma'lumotlari:
              </Typography>
              <Typography sx={{ fontSize: '14px' }}>
                Nomi: {productToDelete.name}
              </Typography>
              <Typography sx={{ fontSize: '14px' }}>
                Miqdori: {productToDelete.quantity}
              </Typography>
              <Typography sx={{ fontSize: '14px' }}>
                Narxi: {formatPrice(productToDelete.price)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, justifyContent: 'center' }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="contained"
            sx={{ 
              textTransform: 'uppercase',
              color: 'white', 
              backgroundColor: '#7c3aed', 
              '&:hover': { backgroundColor: '#6d28d9' },
              px: 4
            }}
          >
            BEKOR QILISH
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              textTransform: 'uppercase',
              backgroundColor: '#ef4444',
              color: 'white',
              '&:hover': {
                backgroundColor: '#dc2626'
              },
              px: 4
            }}
          >
            O'CHIRISH
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setAlertOpen(false)} 
          severity={alertSeverity}
          sx={{ 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            width: '100%'
          }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Inventory; 