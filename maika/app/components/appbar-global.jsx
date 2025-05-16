"use client";
import {AppBar, Modal, TextField, Box, Button, Toolbar, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Typography} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PaymentIcon from '@mui/icons-material/Payment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function AppbarGlobal() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { label: "Inicio", href: "/", icon: <HomeIcon /> },
    { label: "Reservations", href: "/reservations", icon: <EventIcon /> },
    { label: "Menu", href: "/menu", icon: <RestaurantMenuIcon /> },
    { label: "Payments", href: "/payments", icon: <PaymentIcon /> },
    { label: "Orders", href: "/orders", icon: <ShoppingCartIcon /> },
    { label: "Inventory", href: "/inventory", icon: <InventoryIcon /> },
    { label: "Employees", href: "/employee", icon: <PeopleIcon /> },

    { label: "Prueba", href: "/prueba", icon: <PeopleIcon /> },
  ];

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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

        <Button onClick={handleOpen} variant="contained" sx={{
          backgroundColor: "#5188a7",
          color: "#87c3df",
          "&:hover": {
              backgroundColor: "#e3f2fd",
              color: "#1DA1F2",
              transform: "scale(1.2)",
              transition: "transform 0.3s ease-in-out",
          },
          }}>Ingresar
        </Button>
        <Modal open={open} onClose={handleClose}>
          <Box sx={{ position: 'absolute', top: '200%', left: '200%', transform: 'translate(-50%, -50%)', bgcolor: 'white', p: 4, borderRadius: 2, boxShadow: 24, width: 300,}}>
            <Typography variant="h6" mb={2}>Iniciar Sesión</Typography>
              <TextField
                fullWidth
                label="Correo electrónico"
                variant="outlined"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                variant="outlined"
                margin="normal"
              />
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2, backgroundColor: "#5188a7", color: "#fff" }}
              >
                Entrar
              </Button>
          </Box>
        </Modal>
     
          
        </Toolbar>
      </AppBar>

      {/* Drawer (Menú lateral) */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", my: 2 }}>
            <Image
              src="/mesamaestralogo.png"
              alt="Logo"
              width={200}
              height={200}
              priority
            />
            <Typography variant="h6" sx={{ fontWeight: 'bold'}}>
              <Box component="span" sx={{ color: '#5188a7' }}>Mesa</Box>
              <Box component="span" sx={{ color: '#87c3df' }}>Maestra</Box>
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
