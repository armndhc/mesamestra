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
import { useState } from "react";
// Importamos el componente LoginModal
import SignIn from "./login"; // Ajusta la ruta según donde lo hayas creado

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

  const [openDialog, setOpenDialog] = useState(false);

  const handleLogin = ({ action }) => {
    // Update action.
    setAction(action);
  
    // Open dialog.
    setOpenDialog(true);
  
    // Select action.
    if (action === "login") {
        setMenu({
            _id: null,
            meal: "",
            description: "",
            price: 0,
            image: null
        });
    } 
    else {
        console.warn("Unknown action:", action);
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

        <Button 
          onClick={() => handleLogin({ action: "login" })} 
          variant="contained" 
          sx={{
            backgroundColor: "#5188a7",
            color: "#white",
            "&:hover": {
                backgroundColor: "#white",
                color: "#white",
                transform: "scale(1.2)",
                transition: "transform 0.3s ease-in-out",
            },
          }}
        >
          Log in
        </Button>
        
        {/* Usamos el componente LoginModal importado */}
        <SignIn 
          open={openDialog} 
          onClose={handleCloseDialog} 
        />
          
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