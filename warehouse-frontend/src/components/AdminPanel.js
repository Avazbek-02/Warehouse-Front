import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { authAPI } from '../services/api';

function AdminPanel() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    password: '',
    name: ''
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.getAdmins();
      setAdmins(response.data);
    } catch (err) {
      console.error('Admin yuklash xatosi:', err);
      setError(err.response?.data?.message || 'Adminlarni yuklashda xatolik yuz berdi');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordFormData({
      ...passwordFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleNewAdminChange = (e) => {
    setNewAdmin({
      ...newAdmin,
      [e.target.name]: e.target.value
    });
  };

  const handleAdminPasswordSubmit = async () => {
    try {
      if (!passwordFormData.currentPassword || !passwordFormData.password || !passwordFormData.confirmPassword) {
        setError('Barcha maydonlarni to\'ldiring');
        return;
      }

      if (passwordFormData.password !== passwordFormData.confirmPassword) {
        setError('Yangi parollar mos kelmadi');
        return;
      }

      await authAPI.resetPassword(selectedAdmin._id, {
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.password
      });

      setOpenPasswordDialog(false);
      setPasswordFormData({ currentPassword: '', password: '', confirmPassword: '' });
      setSelectedAdmin(null);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Parolni o\'zgartirishda xatolik yuz berdi');
    }
  };

  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setPasswordFormData({ currentPassword: '', password: '', confirmPassword: '' });
    setOpenPasswordDialog(true);
  };

  const handleAddAdmin = async () => {
    try {
      if (!newAdmin.username || !newAdmin.password || !newAdmin.name) {
        setError('Barcha maydonlarni to\'ldiring');
        return;
      }

      await authAPI.register({
        ...newAdmin,
        role: 'admin'
      });

      setOpenDialog(false);
      setNewAdmin({ username: '', password: '', name: '' });
      fetchAdmins();
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Admin qo\'shishda xatolik yuz berdi');
    }
  };

  const handleDeleteClick = (admin) => {
    setAdminToDelete(admin);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await authAPI.deleteUser(adminToDelete._id);
      setDeleteConfirmOpen(false);
      setAdminToDelete(null);
      fetchAdmins();
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Adminni o\'chirishda xatolik yuz berdi');
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <Box 
        sx={{ 
          backgroundColor: '#7c3aed',
          borderRadius: '16px',
          p: 3,
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600,
            color: 'white'
          }}
        >
          Admin Sozlamalari
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
            px: 3,
            py: 1
          }}
        >
          Admin QO'SHISH
        </Button>
      </Box>

      {/* Adminlar ro'yxati */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 0,
          borderRadius: '12px',
          backgroundColor: 'white',
          border: '1px solid rgba(124, 58, 237, 0.1)',
          overflow: 'hidden',
          minHeight: '200px'
        }}
      >
        <Box
          sx={{ 
            p: 3,
            borderBottom: '1px solid rgba(124, 58, 237, 0.1)',
            backgroundColor: 'rgba(124, 58, 237, 0.02)'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 500,
              color: '#374151',
              textAlign: 'center'
            }}
          >
            Adminlar Ro'yxati
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress sx={{ color: '#7c3aed' }} />
          </Box>
        ) : error ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            color: '#ef4444'
          }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : admins.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            color: '#6b7280'
          }}>
            <Typography>Adminlar mavjud emas</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(124, 58, 237, 0.02)' }}>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Ism</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Username</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, py: 2, pr: 4 }}>Amallar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow 
                    key={admin._id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(124, 58, 237, 0.02)' 
                      }
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>{admin.name}</TableCell>
                    <TableCell sx={{ py: 2 }}>{admin.username}</TableCell>
                    <TableCell align="right" sx={{ py: 2, pr: 3 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end',
                        gap: 1
                      }}>
                        <IconButton
                          onClick={() => handleEditClick(admin)}
                          sx={{ 
                            color: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            '&:hover': { 
                              backgroundColor: 'rgba(59, 130, 246, 0.2)'
                            },
                            width: '36px',
                            height: '36px'
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteClick(admin)}
                          sx={{ 
                            color: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            '&:hover': { 
                              backgroundColor: 'rgba(239, 68, 68, 0.2)'
                            },
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
        )}
      </Paper>

      {/* Admin qo'shish dialogi */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: { 
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#7c3aed',
          color: 'white',
          textAlign: 'center',
          py: 2
        }}>
          Yangi Admin Qo'shish
        </DialogTitle>
        <DialogContent sx={{ pt: 4, px: 3, pb: 3 }}>
          <TextField
            fullWidth
            label="Ism"
            name="name"
            value={newAdmin.name}
            onChange={handleNewAdminChange}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={newAdmin.username}
            onChange={handleNewAdminChange}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            type="password"
            label="Parol"
            name="password"
            value={newAdmin.password}
            onChange={handleNewAdminChange}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, justifyContent: 'center' }}>
          <Button 
            onClick={() => setOpenDialog(false)}
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
            onClick={handleAddAdmin}
            variant="contained"
            sx={{
              textTransform: 'uppercase',
              backgroundColor: '#7c3aed',
              '&:hover': {
                backgroundColor: '#6d28d9'
              },
              px: 4
            }}
          >
            QO'SHISH
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin parolini o'zgartirish dialogi */}
      <Dialog 
        open={openPasswordDialog} 
        onClose={() => setOpenPasswordDialog(false)}
        PaperProps={{
          sx: { 
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#3b82f6',
          color: 'white',
          textAlign: 'center',
          py: 2
        }}>
          Admin Parolini O'zgartirish
        </DialogTitle>
        <DialogContent sx={{ pt: 4, px: 3, pb: 3 }}>
          {selectedAdmin && (
            <>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Admin ma'lumotlari:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  {selectedAdmin.name} ({selectedAdmin.username})
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
            </>
          )}
          <TextField
            fullWidth
            type="password"
            label="Joriy parol"
            name="currentPassword"
            value={passwordFormData.currentPassword}
            onChange={handlePasswordChange}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            type="password"
            label="Yangi parol"
            name="password"
            value={passwordFormData.password}
            onChange={handlePasswordChange}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            type="password"
            label="Yangi parolni tasdiqlang"
            name="confirmPassword"
            value={passwordFormData.confirmPassword}
            onChange={handlePasswordChange}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, justifyContent: 'center' }}>
          <Button 
            onClick={() => setOpenPasswordDialog(false)}
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
            onClick={handleAdminPasswordSubmit}
            variant="contained"
            sx={{
              textTransform: 'uppercase',
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb'
              },
              px: 4
            }}
          >
            O'ZGARTIRISH
          </Button>
        </DialogActions>
      </Dialog>

      {/* O'chirish tasdiqlash dialogi */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
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
          Adminni O'chirish
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 3 }}>
          <Typography sx={{ fontWeight: 400, fontSize: '16px', textAlign: 'center', mb: 2 }}>
            Siz aniq bu adminni o'chirmoqchimisiz?
          </Typography>
          
          {adminToDelete && (
            <Box sx={{ 
              backgroundColor: 'rgba(254, 226, 226, 0.5)', 
              p: 2, 
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              mb: 2
            }}>
              <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#1a1a1a' }}>
                Admin ma'lumotlari:
              </Typography>
              <Typography sx={{ fontSize: '14px' }}>
                Ism: {adminToDelete.name}
              </Typography>
              <Typography sx={{ fontSize: '14px' }}>
                Username: {adminToDelete.username}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, justifyContent: 'center' }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
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
            onClick={handleDeleteConfirm}
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
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setError('')} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Amal muvaffaqiyatli bajarildi
        </Alert>
      </Snackbar>
    </div>
  );
}

export default AdminPanel; 