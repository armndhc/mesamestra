"use client";
import {AppBar, Box, Button, Toolbar, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Typography} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PaymentIcon from '@mui/icons-material/Payment';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import SignIn from './login';
import SignUp from './signup';


export default function AppbarGlobal() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  

  const navItems = [
    { label: "Home", href: "/", icon: <HomeIcon /> },
    { label: "Menu", href: "/menu", icon: <RestaurantMenuIcon /> },
    { label: "Reservations", href: "/reservations", icon: <EventIcon /> },
    { label: "Inventory", href: "/inventory", icon: <InventoryIcon /> },
    { label: "Orders", href: "/orders", icon: <TableRestaurantIcon /> },
    { label: "Payments", href: "/payments", icon: <PaymentIcon /> },
    { label: "Employees", href: "/employee", icon: <PeopleIcon /> },
    { label: "Prueba", href: "/prueba", icon: <PeopleIcon /> },
  ];

  const [action, setAction] = useState("");
  const [menu, setMenu] = useState({
    _id: null,
    meal: "",
    description: "",
    price: 0,
    image: null
  });

  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openSignUpModal, setOpenSignUpModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
 // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);
  
  const checkAuth = () => {
    // Revisar si hay un usuario en localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Independientemente de la respuesta del servidor, limpiar localStorage
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUser(null);
    }
  };
  
  
  
 

  // Función para cerrar el modal de login
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <AppBar position="static" sx={{ mb: 4, backgroundColor: '#2c2f48' }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
            <Box component="span" sx={{ color: '#5188a7' }}>Mesa</Box>
            <Box component="span" sx={{ color: '#87c3df' }}>Maestra</Box>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2 }}>
        {isLoggedIn ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              {user?.name || user?.username || 'User'}
            </Typography>
            <Button 
              variant="outlined" 
              color="#5188a7" 
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Box>
            <Button 
              variant="outlined" 
              color="primary" 
              
              sx={{ mr: 1, fontWeight: 'bold', color: 'white', backgroundColor: '#5188a7' }}
              onClick={() => setOpenLoginModal(true)}
            >
              Login
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              sx={{ mr: 1, fontWeight: 'bold', color: 'white', backgroundColor: '#2b6687' }}
              onClick={() => setOpenSignUpModal(true)}
            >
              Sign Up
            </Button>
          </Box>
        )}

         {/* Login Modal */}
      <SignIn 
        open={openLoginModal} 
        onClose={() => {
          setOpenLoginModal(false);
          checkAuth(); // Verificar autenticación después de cerrar
        }}
        onSignUpClick={() => {
          setOpenSignUpModal(true);
        }}
      />
      
      {/* SignUp Modal */}
      <SignUp 
        open={openSignUpModal} 
        onClose={() => {
          setOpenSignUpModal(false);
          setOpenLoginModal(true); // Abrir login después de registro
        }}
      />
      </Box>
        
          
        </Toolbar>
      </AppBar>

      {/* Drawer (Menú lateral) */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", my: 2 }}>
            <Image
              src="/logorest.png"
              alt="Logo"
              width={200}
              height={200}
              priority
            />
            <Typography variant="h6" sx={{ fontWeight: 'bold'}}>
              <Box component="span" sx={{ color: '#f8297a' }}>La</Box>
              <Box component="span" sx={{ color: '#a42a4c' }}>Sierra</Box> 
            </Typography>
          </Box>

          <List>{navItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton component={Link} href={item.href}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 2 }}>{item.icon}</Box>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 'bold' }}/>
              </Box>
              </ListItemButton>
            </ListItem>
          ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}