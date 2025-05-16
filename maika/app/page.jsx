"use client";

// Imports.
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import InventoryIcon from '@mui/icons-material/Inventory';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import BookIcon from '@mui/icons-material/Book';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import {
  Box,
  Container,
  Paper,
  Typography,
  Link,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Image from "next/image";

// Home page.
export default function Home() {
  // Theme.
  const theme = useTheme();

  // Options.
  const options = [
    {
      icon: RestaurantMenuIcon,
      label: "Menu",
      href: "/menu"
    },
    {
      icon: BookIcon,
      label: "Reservations",
      href: "/reservations"
    },
    {
      icon: InventoryIcon,
      label: "Inventory",
      href: "/inventory"
    },
    {
      icon: TableRestaurantIcon,
      label: "Orders",
      href: "/orders"
    },
    {
      icon: ReceiptIcon,
      label: "Payments",
      href: "/payments"
    },
    {
      icon: AccountCircleIcon,
      label: "Employees",
      href: "/employee"
    },
  ];

  // Component.
  return (
    <Container maxWidth="lg">

      <Grid container spacing={4} display="flex" justifyContent="center" alignItems="center">
        <Grid size={{ xs: 12 }} display="flex" justifyContent="center">
          <Box
            sx={{
              borderRadius: 50,
              overflow: "hidden",
              width: 380,
              height: 380
            }}
          >
            <Image
              src="/logo.jpeg"
              alt="logo"
              width={380}
              height={380}
            />
          </Box>
        </Grid>
        {options.map((item) => (
          <Grid
            size={{ sx: 12, md: 6, lg: 3 }}
            key={item.label + "Grid"}

          >
            <Link
              href={item.href}
              key={item.label}
              width="100%"
              style={{ textDecoration: "none" }}
            >
              <Paper
                elevation={4}
                sx={{
                  mx: "auto",
                  p: 4,
                  height: "200px",
                  width: "100%",
                  textAlign: "center",
                  borderRadius: 15,
                  "&:hover": {
                    backgroundColor: theme.palette.secondary.main,
                    transform: "scale(1.05)",
                    transition: "transform 0.4s ease-in-out",
                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
                  },
                  mt: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                
              >
                {<item.icon sx={{ fontSize: 55 }} />}
                <Typography
                  sx={{
                    fontWeight: "bold",
                    textAlign: "center",
                    color: theme.palette.primary.main,
                    fontSize: "1.6rem",
                  }}
                >
                  {item.label}
                </Typography>
              </Paper>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}