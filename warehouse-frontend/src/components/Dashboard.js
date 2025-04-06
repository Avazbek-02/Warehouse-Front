import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Container,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Warehouse as InventoryIcon,
  ShoppingCart as OrdersIcon,
  Money as CreditsIcon,
  AdminPanelSettings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Dashboard.css';
import Inventory from './Inventory';
import Orders from './Orders';
import Credits from './Credits';
import AdminPanel from './AdminPanel';

const drawerWidth = 240;

function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('inventory');
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      // Clear token first
      localStorage.removeItem('token');
      // Then try to call logout API
      await authAPI.logout();
      // Force navigation to login page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API call fails, still redirect to login
      window.location.href = '/';
    }
  };

  const menuItems = [
    { text: 'Ombor', icon: <InventoryIcon />, value: 'inventory' },
    { text: 'Yuklar', icon: <OrdersIcon />, value: 'orders' },
    { text: 'Nasiya', icon: <CreditsIcon />, value: 'credits' },
    { text: 'Administrator', icon: <SettingsIcon />, value: 'admin' },
  ];

  const drawer = (
    <div>
      <Box sx={{
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              color: 'white',
              fontSize: '1.5rem',
              letterSpacing: '0.5px',
              lineHeight: '1.2'
            }}
          >
            D&E
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              lineHeight: '1'
            }}
          >
            LIDER
          </Typography>
        </Box>
      </Box>
      <List sx={{
        mt: 2,
        px: 2,
        '& .MuiListItem-root': {
          borderRadius: '8px',
          mb: 1,
          '&.Mui-selected': {
            backgroundColor: '#7c3aed',
            color: 'white',
            '&:hover': {
              backgroundColor: '#6d28d9'
            },
            '& .MuiListItemIcon-root': {
              color: 'white'
            }
          },
          '&:hover': {
            backgroundColor: '#f4f3ff'
          }
        },
        '& .MuiListItemIcon-root': {
          color: '#6b7280',
          minWidth: '40px'
        }
      }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.value}
            selected={selectedMenu === item.value}
            onClick={() => setSelectedMenu(item.value)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: selectedMenu === item.value ? 600 : 500
              }}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#7c3aed',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Toolbar sx={{ minHeight: '80px !important', height: '80px' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: '1.2rem',
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}
          >
            Ombor Boshqaruv Tizimi
          </Typography>
          <Button
            color="inherit"
            size="small"
            startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
            onClick={handleLogout}
            sx={{
              minWidth: 'auto',
              padding: '2px 4px',
              fontSize: '0.75rem',
              borderRadius: '2px',
              marginLeft: 'auto',
              width: '15%',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            CHIQISH
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: '0 0 15px rgba(0,0,0,0.2)',
              '& .MuiList-root': {
                '& .MuiListItem-root': {
                  py: 1.5
                }
              }
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: '0 0 15px rgba(0,0,0,0.2)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 0.5, sm: 1, md: 2 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: '#f4f3ff',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Container 
          maxWidth="lg"
          sx={{
            px: { xs: 0.5, sm: 1 }
          }}
        >
          {selectedMenu === 'inventory' && <InventoryContent />}
          {selectedMenu === 'orders' && <OrdersContent />}
          {selectedMenu === 'credits' && <CreditsContent />}
          {selectedMenu === 'admin' && <AdminPanelContent />}
        </Container>
      </Box>
    </Box>
  );
}

// Placeholder components for different sections
const InventoryContent = () => <Inventory />;
const OrdersContent = () => <Orders />;
const CreditsContent = () => <Credits />;
const AdminPanelContent = () => <AdminPanel />;

export default Dashboard; 