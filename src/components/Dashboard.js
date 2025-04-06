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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  People as SuppliersIcon,
  Assessment as ReportsIcon,
} from '@mui/icons-material';
import './Dashboard.css';
import Inventory from './Inventory';
import Orders from './Orders';

const drawerWidth = 240;

function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('inventory');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Inventory', icon: <InventoryIcon />, value: 'inventory' },
    { text: 'Orders', icon: <OrdersIcon />, value: 'orders' },
    { text: 'Suppliers', icon: <SuppliersIcon />, value: 'suppliers' },
    { text: 'Reports', icon: <ReportsIcon />, value: 'reports' },
  ];

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.value}
            selected={selectedMenu === item.value}
            onClick={() => setSelectedMenu(item.value)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
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
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Warehouse Management System
          </Typography>
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
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          {selectedMenu === 'inventory' && <InventoryContent />}
          {selectedMenu === 'orders' && <OrdersContent />}
          {selectedMenu === 'suppliers' && <SuppliersContent />}
          {selectedMenu === 'reports' && <ReportsContent />}
        </Container>
      </Box>
    </Box>
  );
}

// Placeholder components for different sections
const InventoryContent = () => <Inventory />;

const OrdersContent = () => <Orders />;

const SuppliersContent = () => (
  <div>
    <Typography variant="h4" gutterBottom>
      Suppliers Management
    </Typography>
    {/* Add your suppliers management content here */}
  </div>
);

const ReportsContent = () => (
  <div>
    <Typography variant="h4" gutterBottom>
      Reports
    </Typography>
    {/* Add your reports content here */}
  </div>
);

export default Dashboard; 