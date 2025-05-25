"use client";

import { useEffect, useState } from "react";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import InventoryIcon from "@mui/icons-material/Inventory";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import EventIcon from "@mui/icons-material/Event";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import {
  Box,
  Container,
  Paper,
  Typography,
  Link,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Image from "next/image";
import { canAccess } from "./utils/roleAccess";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const options = [
    { icon: RestaurantMenuIcon, label: "Menu", href: "/menu" },
    { icon: EventIcon, label: "Reservations", href: "/reservations" },
    { icon: InventoryIcon, label: "Inventory", href: "/inventory" },
    { icon: TableRestaurantIcon, label: "Orders", href: "/orders" },
    { icon: PaymentIcon, label: "Payments", href: "/payments" },
    { icon: AccountCircleIcon, label: "Employees", href: "/employee" },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="center">
        <Box
          sx={{
            borderRadius: 50,
            overflow: "hidden",
            width: 300,
            height: 300,
          }}
        >
          <Image src="/logorest.png" alt="logo" width={300} height={300} />
        </Box>
      </Box>

      {!user ? (
        <Typography variant="h5" color="gray" textAlign="center" mt={4}>
          Please log in to see the available options.
        </Typography>
      ) : (
        <Grid container spacing={4} justifyContent="center" mt={2}>
          {options
            .filter((item) => canAccess(item.label, user.userType))
            .map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.label}>
                <Link href={item.href} style={{ textDecoration: "none" }}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 4,
                      textAlign: "center",
                      borderRadius: 15,
                      "&:hover": {
                        backgroundColor: "#c95475",
                        transform: "scale(1.05)",
                        transition: "transform 0.4s ease-in-out",
                        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
                      },
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "180px",
                    }}
                  >
                    {<item.icon sx={{ fontSize: 50 }} />}
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        mt: 1,
                        color: "#2c2f48",
                        fontSize: "1.3rem",
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Paper>
                </Link>
              </Grid>
            ))}
        </Grid>
      )}
    </Container>
  );
}
