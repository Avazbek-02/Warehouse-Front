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
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { creditsAPI } from '../services/api';
import { productsAPI } from '../services/api';

// Format price in UZS
const formatPrice = (price) => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    maximumFractionDigits: 0,
  }).format(price);
};

// Status display component
const StatusChip = ({ status }) => {
  let color = 'default';
  
  if (status === 'Active') {
    color = 'warning';
  } else if (status === 'Paid') {
    color = 'success';
  } else if (status === 'Overdue') {
    color = 'error';
  }
  
  return <Chip size="small" label={status} color={color} />;
};

function Credits() {
  const [credits, setCredits] = useState([]);
  const [open, setOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [creditToDelete, setCreditToDelete] = useState(null);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    creditDate: new Date().toISOString().split('T')[0],
    items: [{ name: '', quantity: 0, price: 0 }],
    paidAmount: 0,
    notes: ''
  });
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Add products state
  const [products, setProducts] = useState([]);

  // Fetch products and credits on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [creditsRes, productsRes] = await Promise.all([
          creditsAPI.getAll(),
          productsAPI.getAll()
        ]);
        setCredits(creditsRes.data);
        setProducts(productsRes.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        showAlert('Failed to fetch data. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      [name]: name === 'paidAmount' ? (value === '' ? '' : parseInt(value)) : value,
    });
  };

  // Handle payment form input change
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: name === 'amount' ? (value === '' ? '' : parseInt(value)) : value,
    });
  };

  // Handle item change in form
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    
    if (field === 'name') {
      const product = products.find(p => p.name === value);
      if (product) {
        newItems[index] = {
          ...newItems[index],
          name: value,
          price: product.price,
          maxQuantity: product.quantity // Save available quantity
        };
      }
    } else if (['quantity', 'price'].includes(field)) {
      if (value === '') {
        newItems[index][field] = '';
      } else {
        const numValue = parseInt(value);
        if (field === 'quantity') {
          const product = products.find(p => p.name === newItems[index].name);
          if (product && numValue > product.quantity) {
            showAlert(`Only ${product.quantity} items available in inventory`, 'error');
            return;
          }
        }
        newItems[index][field] = numValue >= 0 ? numValue : 0;
      }
    }
    
    setFormData({
      ...formData,
      items: newItems
    });
  };

  // Add a new item to the form
  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 0, price: 0 }]
    });
  };

  // Remove an item from the form
  const handleRemoveItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({
      ...formData,
      items: newItems
    });
  };

  // Open add credit dialog
  const handleAdd = () => {
    setFormData({
      customerName: '',
      phoneNumber: '',
      creditDate: new Date().toISOString().split('T')[0],
      items: [{ name: '', quantity: 0, price: 0 }],
      paidAmount: 0,
      notes: ''
    });
    setSelectedCredit(null);
    setOpen(true);
  };

  // Open edit credit dialog
  const handleEdit = (credit) => {
    setFormData({
      customerName: credit.customerName,
      phoneNumber: credit.phoneNumber || '',
      creditDate: new Date(credit.creditDate).toISOString().split('T')[0],
      items: credit.items,
      paidAmount: credit.paidAmount,
      notes: credit.notes || ''
    });
    setSelectedCredit(credit);
    setOpen(true);
  };

  // Open payment dialog
  const handleOpenPaymentDialog = (credit) => {
    setSelectedCredit(credit);
    setPaymentData({
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setPaymentDialogOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (credit) => {
    setCreditToDelete(credit);
    setDeleteDialogOpen(true);
  };

  // Close dialog
  const handleClose = () => {
    setOpen(false);
    setSelectedCredit(null);
  };

  // Close payment dialog
  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedCredit(null);
  };

  // Cancel delete
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCreditToDelete(null);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    try {
      await creditsAPI.delete(creditToDelete._id);
      setCredits(credits.filter(c => c._id !== creditToDelete._id));
      showAlert('Credit record deleted successfully.');
    } catch (err) {
      showAlert('Failed to delete credit record. Please try again.', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setCreditToDelete(null);
    }
  };

  // Calculate total amount in the form
  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const quantity = parseInt(item.quantity) || 0;
      const price = parseInt(item.price) || 0;
      return total + (quantity * price);
    }, 0);
  };

  // Calculate remaining amount in the form
  const calculateRemaining = () => {
    const total = calculateTotal();
    const paid = parseInt(formData.paidAmount) || 0;
    return Math.max(0, total - paid);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.customerName.trim()) {
        showAlert('Customer name is required', 'error');
        return;
      }

      if (!formData.items.length || !formData.items[0].name) {
        showAlert('At least one item is required', 'error');
        return;
      }

      // Validate inventory
      for (const item of formData.items) {
        const product = products.find(p => p.name === item.name);
        if (!product) {
          showAlert(`Product ${item.name} not found`, 'error');
          return;
        }
        if (item.quantity > product.quantity) {
          showAlert(`Not enough inventory for ${item.name}. Available: ${product.quantity}`, 'error');
          return;
        }
        if (!item.quantity || item.quantity <= 0) {
          showAlert(`Quantity must be greater than 0 for ${item.name}`, 'error');
          return;
        }
      }

      if (selectedCredit) {
        const response = await creditsAPI.update(selectedCredit._id, formData);
        setCredits(credits.map(c => c._id === selectedCredit._id ? response.data : c));
        showAlert('Credit record updated successfully');
      } else {
        const response = await creditsAPI.create(formData);
        setCredits([response.data, ...credits]);
        showAlert('Credit record created successfully');
      }
      handleClose();
    } catch (err) {
      showAlert(err.response?.data?.error || 'Failed to save credit record', 'error');
    }
  };

  // Submit payment
  const handleSubmitPayment = async () => {
    try {
      const amount = parseInt(paymentData.amount) || 0;
      
      if (amount <= 0) {
        showAlert('Payment amount must be greater than zero.', 'error');
        return;
      }

      if (amount > selectedCredit.remainingAmount) {
        showAlert(`Payment amount cannot exceed the remaining amount (${formatPrice(selectedCredit.remainingAmount)}).`, 'error');
        return;
      }

      const response = await creditsAPI.addPayment(selectedCredit._id, paymentData);
      setCredits(credits.map(c => (c._id === selectedCredit._id ? response.data : c)));
      showAlert('Payment added successfully.');
      setPaymentDialogOpen(false);
    } catch (err) {
      showAlert(
        err.response?.data?.error || 'Failed to add payment. Please try again.',
        'error'
      );
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div style={{ padding: '24px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500 }}>
          Credit Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0'
            },
            textTransform: 'none',
            boxShadow: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
          }}
        >
          New Credit
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ mt: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : (
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
                <TableCell sx={{ fontWeight: 600, color: '#424242', width: '8%' }}>Credit #</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#424242', width: '32%' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#424242', width: '12%' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#424242', width: '15%' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#424242', width: '15%' }}>Remaining</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#424242', width: '8%' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#424242', width: '10%' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {credits.map((credit) => (
                <TableRow 
                  key={credit._id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: '#f8f9fa' 
                    },
                    height: '60px'
                  }}
                >
                  <TableCell sx={{ color: '#1976d2', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {credit.creditNumber}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {credit.customerName}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 0.5,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {credit.phoneNumber && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#666',
                              display: 'inline'
                            }}
                          >
                            {credit.phoneNumber}
                          </Typography>
                        )}
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#666',
                            display: 'inline',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          • {credit.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {formatDate(credit.creditDate)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatPrice(credit.totalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: credit.remainingAmount > 0 ? '#d32f2f' : '#2e7d32',
                        fontWeight: credit.remainingAmount > 0 ? 500 : 400,
                        fontSize: '0.875rem'
                      }}
                    >
                      {formatPrice(credit.remainingAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Chip 
                      size="small" 
                      label={credit.status} 
                      sx={{
                        backgroundColor: credit.status === 'Active' ? '#fff3e0' : 
                                       credit.status === 'Paid' ? '#e8f5e9' : '#ffebee',
                        color: credit.status === 'Active' ? '#e65100' : 
                               credit.status === 'Paid' ? '#1b5e20' : '#c62828',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        height: '24px'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: 0.5,
                      alignItems: 'center'
                    }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(credit)}
                        sx={{ 
                          color: '#2196f3',
                          padding: '4px',
                          '&:hover': {
                            backgroundColor: '#e3f2fd'
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenPaymentDialog(credit)}
                        sx={{ 
                          color: '#4caf50',
                          padding: '4px',
                          '&:hover': {
                            backgroundColor: '#e8f5e9'
                          }
                        }}
                        disabled={credit.status === 'Paid'}
                      >
                        <PaymentIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(credit)}
                        sx={{ 
                          color: '#f44336',
                          padding: '4px',
                          '&:hover': {
                            backgroundColor: '#ffebee'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {credits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                      No credit records found. Click "New Credit" to add your first record.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Credit Details Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCredit ? 'Edit Credit Record' : 'New Credit Record'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976d2' }}>
              Customer Information
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Customer Name"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Credit Date"
                name="creditDate"
                type="date"
                value={formData.creditDate}
                onChange={handleChange}
                required
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ mb: 2 }}
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976d2' }}>
            Credit Items
          </Typography>
          
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
                  gridTemplateColumns: 'minmax(200px, 1fr) 150px 180px auto',
                  gap: 2,
                  alignItems: 'center'
                }}
              >
                <FormControl size="small" required>
                  <InputLabel>Product Name</InputLabel>
                  <Select
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    label="Product Name"
                  >
                    {products
                      .filter(product => product.quantity > 0) // Only show products with available quantity
                      .map(product => (
                        <MenuItem 
                          key={product._id} 
                          value={product.name}
                        >
                          {product.name} ({product.quantity} available)
                        </MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
                <TextField
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  required
                  size="small"
                  inputProps={{ 
                    min: 0,
                    max: products.find(p => p.name === item.name)?.quantity || 0
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
                    onClick={() => handleRemoveItem(index)}
                    sx={{ 
                      color: '#f44336',
                      width: '40px',
                      height: '40px'
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                mt: 1,
                pt: 1,
                borderTop: '1px solid #f0f0f0'
              }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Item Total: {formatPrice(parseInt(item.quantity) * parseInt(item.price) || 0)}
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
              mb: 3,
              borderColor: '#1976d2',
              color: '#1976d2'
            }}
          >
            Add Item
          </Button>

          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976d2' }}>
              Payment Information
            </Typography>
            <TextField
              label="Initial Payment (UZS)"
              name="paidAmount"
              type="number"
              value={formData.paidAmount}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0 }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
          </Box>
          
          <Box sx={{ 
            p: 2, 
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #e0e0e0'
          }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#1976d2' }}>
              Credit Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Total Amount:
              </Typography>
              <Typography variant="body2">
                {formatPrice(calculateTotal())}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Initial Payment:
              </Typography>
              <Typography variant="body2">
                {formatPrice(parseInt(formData.paidAmount) || 0)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle2">
                Remaining Amount:
              </Typography>
              <Typography variant="subtitle2" sx={{ color: calculateRemaining() > 0 ? '#f44336' : '#4caf50' }}>
                {formatPrice(calculateRemaining())}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={handleClose} sx={{ color: '#666' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={formData.items.some(item => !item.name)}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            {selectedCredit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Payment</DialogTitle>
        <DialogContent>
          {selectedCredit && (
            <>
              <Box sx={{ mb: 3, mt: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                  Credit Information
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedCredit.customerName} - #{selectedCredit.creditNumber}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="body2">
                    Total Amount: {formatPrice(selectedCredit.totalAmount)}
                  </Typography>
                  <Typography variant="body2">
                    Remaining: {formatPrice(selectedCredit.remainingAmount)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976d2' }}>
                Payment Details
              </Typography>
              
              <TextField
                label="Payment Amount (UZS)"
                name="amount"
                type="number"
                value={paymentData.amount}
                onChange={handlePaymentChange}
                fullWidth
                required
                inputProps={{ min: 0, max: selectedCredit.remainingAmount }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Payment Date"
                name="paymentDate"
                type="date"
                value={paymentData.paymentDate}
                onChange={handlePaymentChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Notes"
                name="notes"
                value={paymentData.notes}
                onChange={handlePaymentChange}
                fullWidth
                multiline
                rows={2}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={handleClosePaymentDialog} sx={{ color: '#666' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitPayment}
            variant="contained"
            color="success"
            disabled={!paymentData.amount || paymentData.amount <= 0}
          >
            Add Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete credit record #{creditToDelete?.creditNumber}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '0 24px 20px 24px' }}>
          <Button onClick={handleDeleteCancel} sx={{ color: '#666' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            sx={{ textTransform: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Credits; 