"use client"; // Indicates that this component is a client component (for frameworks like Next.js)
import { useState, useEffect } from "react";
import React from "react";
import {
  Container,
  Button,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from "@mui/material";
import Grid from "@mui/material/Grid2"; // Use the correct Grid import
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import {Table, TableBody, TableCell, TableContainer,TableHead, TableRow, Checkbox} from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';






import dayjs from 'dayjs';
import { LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { TextField } from '@mui/material';

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';



import OrderForm from "./OrderForm"; // Import components
import Alerts from "../components/alerts"; // Import the Alerts component
import axios from "axios";
import { ORDERS_API } from '../constants/orders/constants'; // Import the API constant




export default function App(onAddOrder, order) {
  const [orders, setOrders] = useState([]); // State to manage the list of orders
  const [openDialog, setOpenDialog] = useState(false); // State to manage the visibility of the dialog
  const [currentOrderId, setCurrentOrderId] = useState(null); // State for the ID of the current order
  const [alert, setAlert] = useState({ severity: "success", message: "" }); // State for alert messages
  const [openAlert, setOpenAlert] = useState(false); // State for alert visibility

    const [name, setName] = useState(""); // Campo combinado para First Name y Last Name
    const [table, setTable] = useState("");
    const [selectedDishes, setSelectedDishes] = useState([{ dish: "", quantity: 1 }]);
    const [loading, setLoading] = useState(false); // Estado para manejar el cargado
    const [error, setError] = useState(null); // Estado para manejar errores

  // Function to fetch orders from the API
  const fetchOrders = async () => {
    try {
      const response = await axios.get(ORDERS_API);
      setOrders(response.data);
      console.log("Orders fetched successfully:", response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setAlert({ severity: "error", message: "Failed to load orders" });
      setOpenAlert(true);
    }
  };

    // Handle changes for dish selection
    const handleDishChange = (index, value) => {
      const newSelectedDishes = [...selectedDishes];
      newSelectedDishes[index].dish = value || ""; // Asegúrate de que sea un valor no undefined
      setSelectedDishes(newSelectedDishes);
    };
  
    // Handle changes for quantity selection
    const handleQuantityChange = (index, value) => {
      const newSelectedDishes = [...selectedDishes];
      newSelectedDishes[index].quantity = parseInt(value, 10) || 1; // Asegúrate de que sea al menos 1
      setSelectedDishes(newSelectedDishes);
    };
  
    // Handle adding a new dish row
    const handleAddDish = () => {
      setSelectedDishes([...selectedDishes, { dish: "", quantity: 1 }]);
    };

  const handleSubmit = () => {
    const orderDetails = {
      name,
      table: parseInt(table, 10),
      dishes: selectedDishes
        .filter((item) => item.dish)
        .map((item) => {
          const selectedMenuItem = menuItems.find(
            (menuItem) => menuItem.meal === item.dish
          );
          return {
            name: item.dish,
            price: selectedMenuItem?.price || 0,
            quantity: item.quantity,
          };
        }),
    };

    setName("");
    setTable("");
    setSelectedDishes([{ dish: "", quantity: 1 }]);
    onAddOrder(orderDetails);
  };

   useEffect(() => {
      if (order) {
        setName(order.name || "");
        setTable(order.table ? order.table.toString() : "");
        setSelectedDishes(
          order.dishes.map((dish) => ({
            dish: dish.name,
            quantity: dish.quantity,
          }))
        );
      }
    }, [order]);



  //SIMULACION DE LA BASE DE DATOS DEL MENU
  const menuItems = [
    { id: 1, name: "Pizza", price: 120, image: "/pizza.jpg" },
    { id: 2, name: "Pasta", price: 95, image: "/pasta.jpg" },
    { id: 3, name: "Pizza", price: 120, image: "/pizza.jpg" },
    { id: 4, name: "Pasta", price: 95, image: "/pasta.jpg" },
    { id: 5, name: "Pizza", price: 120, image: "/pizza.jpg" },
    { id: 6, name: "Pasta", price: 95, image: "/pasta.jpg" },
    { id: 7, name: "Pizza", price: 120, image: "/pizza.jpg" },
    { id: 8, name: "Pasta", price: 95, image: "/pasta.jpg" },
    { id: 9, name: "Pizza", price: 120, image: "/pizza.jpg" },
    { id: 20, name: "Pasta", price: 95, image: "/pasta.jpg" },
    { id: 21, name: "Pizza", price: 120, image: "/pizza.jpg" },
    { id: 22, name: "Pasta", price: 95, image: "/pasta.jpg" },
    { id: 23, name: "Pizza", price: 120, image: "/pizza.jpg" },
    { id: 30, name: "Pasta", price: 95, image: "/pasta.jpg" },
    { id: 31, name: "Pizza", price: 120, image: "/pizza.jpg" },
    { id: 32, name: "Pasta", price: 95, image: "/pasta.jpg" },
    { id: 33, name: "Pizza", price: 120, image: "/pizza.jpg" },
   
    // ...
  ];
  const [selectedItems, setSelectedItems] = useState([]);
  const handleSelectItem = (item) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        // Si ya está seleccionado, lo quitamos
        return prev.filter((i) => i.id !== item.id);
      } else {
        // Si no está, lo agregamos con cantidad 1
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };




  //hora
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentTime, setCurrentTime] = useState(dayjs());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000); // Actualiza cada segundo
  
    return () => clearInterval(interval); // Limpia el intervalo cuando el componente se desmonta
  }, []);

const [freezeTime, setFreezeTime] = useState(false);
const [frozenTime, setFrozenTime] = useState(null);

useEffect(() => {
  if (!freezeTime) {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(interval);
  }
}, [freezeTime]);

const handleFreezeToggle = () => {
  if (!freezeTime) {
    // Congelar la hora actual
    setFrozenTime(currentTime);
  }
  setFreezeTime(!freezeTime);
};


 

  // Function to handle the saving of an order (create/update)
  const handleSaveOrder = async (order) => {
    let response;
  
    if (currentOrderId) {
      // Update existing order
      try {
        response = await axios.put(`${ORDERS_API}/${currentOrderId}`, order);
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o._id === response.data._id ? response.data : o))
        );
        setAlert({ severity: "success", message: "Order updated successfully!" });
      } catch (error) {
        console.error("Error updating order:", error);
        if (error.response?.status === 400) {
          setAlert({ severity: "error", message: "Invalid information provided for update." });
        } else {
          setAlert({ severity: "error", message: "Failed to update order. Server error." });
        }
      }
    } else {
      // Create new order
      try {
        response = await axios.post(ORDERS_API, order);
        setOrders((prevOrders) => [...prevOrders, response.data]);
        setAlert({ severity: "success", message: "Order created successfully!" });
      } catch (error) {
        console.error("Error creating order:", error);
        if (error.response?.status === 400) {
          setAlert({ severity: "error", message: "Invalid information provided for creation." });
        } else {
          setAlert({ severity: "error", message: "Failed to create order. Server error." });
        }
      }
    }
  
    setOpenAlert(true);
    setOpenDialog(false); // Ensure the dialog is closed
  };
  
  // Function to handle the deletion of an order
  const handleDeleteOrder = async (id) => {
    try {
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== id));
      setAlert({ severity: "success", message: "Order deleted successfully!" });
    } catch (error) {
      console.error("Error deleting order:", error);
      setAlert({ severity: "error", message: "Failed to delete order" });
    }
    setOpenAlert(true); // Ensure alert visibility on error
  };

  // Function to handle the editing of an order
  const handleEditOrder = (id) => {
    setCurrentOrderId(id);
    setOpenDialog(true);
  };

  return (
    <Box
          maxWidth="xl"
          sx={{ mx: "10%" }}
      >
    
              {/*In this grid we use a background image with rounded borders the make a better presentation*/}
                 
                  
                <Container maxWidth="xl" disableGutters>
                <Typography
                    variant="h3"
                    align="center"
                    gutterBottom
                    sx={{
                      fontWeight: "bold",
                      borderBottom: "4px solid #2c2f48",
                      color: '#2c2f48',
                      p: 6,
                    }}
                  >
                    <TableRestaurantIcon sx={{ mr: 1,fontSize: 40 }} />
                    Orders
                  </Typography>
            </Container>
    

    <Container maxWidth="xl" sx={{ minHeight: "800px" }}>
     
    

      <Grid container justifyContent="center" spacing={4} sx={{ px: 4, mt: 4 }}>
        {/*  Tabla de Mesas + Selección */}
        <Grid item xs={12} md={4}>
                        {/* Columna derecha: Resumen que ocupa el resto */}
            <Grid item xs={12} md={8}>
        
            <Paper
            elevation={5}
            sx={{
              p: 3,
              height: '880px',
              width: '900px',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'start',
            }}
          >
            
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{  ml: 2, mb: 5 }} >
          Date & Time
            </Typography>

            <Grid container spacing={2} justifyContent="center">
              {/* Columna izquierda: Hora actual y calendario */}
              <Grid item xs={12} md={6}>
                <Grid container spacing={9} direction="column">
                  {/* Reloj */}
                  <Grid item>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Current time
                      </Typography>
                      <Typography variant="h3" color="#2c2f48">
                        {currentTime.format("HH:mm:ss")}
                      </Typography>
                    </Paper>
                  </Grid>

              {/* Calendario */}
              <Grid item>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <StaticDatePicker
                      minDate={dayjs()}
                      disableOpenPicker
                      displayStaticWrapperAs="desktop"
                      value={selectedDate}
                      onChange={(newValue) => setSelectedDate(newValue)}
                      slotProps={{
                        day: {
                          sx: {
                            '&.Mui-selected': {
                              backgroundColor: '#5188a7',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: '#70b6d8',
                              },
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Columna derecha: Resumen */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                
                height: '600px',
                width: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,          // separación vertical entre elementos
                backgroundColor: '#fff',
                boxShadow: 3,
                maxWidth: 400,    // opcional para darle tamaño tipo ticket
                margin: 'auto',   // centra el Paper horizontalmente en su Grid
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Order details    
              </Typography>
              <Button variant="contained" onClick={handleFreezeToggle} sx={{ alignSelf: 'center',color: 'white', backgroundColor: '#5188a7' }} >
                {freezeTime ? 'Resume clock' : 'Record time'}
              </Button>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Time Entered:
              </Typography>
              <Typography variant="h6">
                {selectedDate ? selectedDate.format('DD/MM/YYYY') : 'Sin fecha'} - {(freezeTime ? frozenTime : currentTime).format('HH:mm:ss')} hrs
              </Typography>
              <Box>
              <TextField
                      label="Full Name"
                      fullWidth
                      placeholder="Enter first and last name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      margin="normal"
                    />
              <TextField
                      label="Table"
                      fullWidth
                      type="number"
                      placeholder="Enter table number (1-100)"
                      value={table}
                      onChange={(e) => setTable(e.target.value)}
                      margin="normal"
                      inputProps={{ min: 1, max: 100 }}
                    />
                    {selectedDishes.map((item, index) => (
        <Grid container spacing={2} key={index} style={{ marginBottom: "16px" }}>
          <Grid item xs={8}>
            <FormControl fullWidth>
              <InputLabel id={`dish-select-label-${index}`}>Select Dish</InputLabel>
              <Select
                labelId={`dish-select-label-${index}`}
                value={item.dish || ""}
                onChange={(e) => handleDishChange(index, e.target.value)}
              >
                {menuItems.map((menuItem) => (
                  <MenuItem key={menuItem._id} value={menuItem.meal}>
                    {menuItem.meal} - ${menuItem.price.toFixed(2)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={item.quantity || 1}
              onChange={(e) => handleQuantityChange(index, e.target.value)}
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>
      ))}
      {loading && <p>Loading menu...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      
     
        <Button variant="contained" color="secondary" onClick={handleAddDish}>
          Add Another Dish
        </Button>
                    
                    
                    </Box>      
                           
              

            </Paper>
          </Grid>
        </Grid>


<Grid container justifyContent="center" spacing={2} sx={{ mt: 5 }}>


  <Grid item>
    <Button variant="contained" color="primary" sx={{color: 'white', backgroundColor: '#5188a7' }} onClick={handleSubmit}>
    Confirm order
    </Button>

  
  </Grid>

  <Grid item>
    <Button onClick={() => setOpenDialog(false)}  sx={{fontSize: '1.0rem'}} color="#8bbfda">
      Cancel
    </Button>
  </Grid>
</Grid>


      
  



</Paper>

  </Grid>

      {/* Panel de Selección */}
     
    </Grid>
          {/* Panel de Resumen */}
  
  </Grid>

  {/* Fila: Tabla de Menú */}
  <Grid item xs={12} >
    <Paper elevation={5} sx={{ p: 2, mt: 4 }}>
      <Typography variant="h5" sx={{  ml: 2, mb: 5, fontWeight: 'bold' }}>
          Menu
      </Typography>
      <Grid container spacing={2} justifyContent="center">
  {menuItems.map((item) => {
    const selected = selectedItems.find(i => i.id === item.id);

    return (
      <Grid item xs={12} sm={6} md={2.4} key={item.id}>
        <Card onClick={() => handleSelectItem(item)} sx={{ cursor: 'pointer' }}>
          <CardMedia
            component="img"
            height="140"
            image={item.image}
            alt={item.name}
          />
          <CardContent>
            <Typography variant="h6" fontWeight="bold">{item.name}</Typography>
            <Typography color="text.secondary">${item.price}</Typography>

            {selected && (
              <>
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  Seleccionado
                </Typography>
                <TextField
                  type="number"
                  label="Cantidad"
                  size="small"
                  value={selected.quantity}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  inputProps={{ min: 1 }}
                  sx={{ mt: 1 }}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  })}
</Grid>
  
    </Paper>
  </Grid>






    











      <Grid container justifyContent="center" spacing={2}>
        <Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setOpenDialog(true);
              setCurrentOrderId(null); // Ensure no ID for new order
            }}
          >
            Create New Order
          </Button>
        </Grid>
      </Grid>

      {/* Dialog for creating or editing an order */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {currentOrderId ? "Edit Order" : "New Order"}
        </DialogTitle>
        <DialogContent>
          <OrderForm
            
            onAddOrder={handleSaveOrder}
            order={currentOrderId ? orders.find((o) => o._id === currentOrderId) : null}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Display orders in a responsive grid */}
      


      <Grid container spacing={2}>
        {orders.map((order) => (
          <Grid key={order._id} xs={12} sm={6} md={4}>
            <Paper style={{ padding: "16px", margin: "8px 0" }}>
              <Typography variant="h6" style={{ fontWeight: "bold" }}>
                Order #{order._id}
              </Typography>
              <Typography>Name: {order.name}</Typography>
              <Typography>Table: {order.table}</Typography>
              <Typography style={{ fontWeight: "bold" }}>Dishes:</Typography>
              {order.dishes.map((dish, idx) => (
                <Typography key={idx}>
                  {dish.name} - Quantity: {dish.quantity}
                </Typography>
              ))}
              <Grid container spacing={1} style={{ marginTop: "8px" }}>
                <Grid>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleDeleteOrder(order._id)}
                  >
                    Done
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleEditOrder(order._id)}
                  >
                    Edit
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Alerts for actions */}
      <Alerts open={openAlert} setOpen={setOpenAlert} alert={alert} setAlert={setAlert} />
    </Container>
    </Box>
  );
}
