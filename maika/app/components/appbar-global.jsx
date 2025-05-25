"use client";
import {
  AppBar,
  Box,
  Button,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import PaymentIcon from "@mui/icons-material/Payment";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import axios from "axios";
import SignIn from "./login";

const API_BASE_URL = "http://localhost:5000/api/v1";

export default function AppbarGlobal() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setUser(null);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setUser(null);
      window.location.href = "/"; 
    }
  };

  const allowedItems = navItems.filter((item) => {
    if (!user) return false;
    if (user.userType === 'admin') return true;
    if (user.userType === 'service') return ["Home", "Menu", "Reservations", "Orders"].includes(item.label);
    if (user.userType === 'kitchen') return ["Menu", "Inventory", "Orders"].includes(item.label);
    return false;
  });

  return (
    <>
      <AppBar position="static" sx={{ mb: 4, backgroundColor: "#2c2f48" }}>
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
            <Typography variant="h6" sx={{ ml: 2, fontWeight: "bold" }}>
              <Box component="span" sx={{ color: "#5188a7" }}>
                Mesa
              </Box>
              <Box component="span" sx={{ color: "#87c3df" }}>
                Maestra
              </Box>
            </Typography>
          </Box>

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 2 }}
          >
            {isLoggedIn ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  {user?.name || user?.username || "User"}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{ color: "white", borderColor: "#5188a7" }}
                >
                  Logout
                </Button>
              </Box>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                sx={{ mr: 1, fontWeight: "bold", color: "white", backgroundColor: "#5188a7" }}
                onClick={() => setOpenLoginModal(true)}
              >
                Login
              </Button>
            )}

            <SignIn
              open={openLoginModal}
              onClose={() => {
                setOpenLoginModal(false);
                checkAuth();
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", my: 2 }}>
            <Image src="/logorest.png" alt="Logo" width={200} height={200} priority />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              <Box component="span" sx={{ color: "#f8297a" }}>
                La
              </Box>
              <Box component="span" sx={{ color: "#a42a4c" }}>
                Sierra
              </Box>
            </Typography>
          </Box>

          <List>
            {allowedItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton component={Link} href={item.href}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box sx={{ mr: 2 }}>{item.icon}</Box>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: "bold" }} />
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
