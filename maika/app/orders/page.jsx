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
  Box
} from "@mui/material";
import Grid from "@mui/material/Grid2"; // Use the correct Grid import
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
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




export default function App() {
  const [orders, setOrders] = useState([]); // State to manage the list of orders
  const [openDialog, setOpenDialog] = useState(false); // State to manage the visibility of the dialog
  const [currentOrderId, setCurrentOrderId] = useState(null); // State for the ID of the current order
  const [alert, setAlert] = useState({ severity: "success", message: "" }); // State for alert messages
  const [openAlert, setOpenAlert] = useState(false); // State for alert visibility

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

  
//SIMULACION DE LA BASE DE DATOS de las mesas
  const mesasIniciales = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    nombre: `Mesa ${i + 1}`,
    estado: "Disponible", // o "Ocupada"
  }));
  const [mesas, setMesas] = useState(mesasIniciales);
  // Cambiar estado al seleccionar mesa
  const handleSeleccionarMesa = (mesaId) => {
    const mesa = mesas.find((m) => m.id === mesaId);
    setMesaSeleccionada(mesa);
  };
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);

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
  const handleQuantityChange = (id, quantity) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: parseInt(quantity) } : item
      )
    );
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
    <Container maxWidth="xl" sx={{ minHeight: "800px" }}>
      <Grid item xs={12}>
        <Typography variant="h4" sx={{ ml: 6, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
          <ShoppingCartIcon sx={{ mr: 1 }} />
            Órdenes
        </Typography>
      </Grid>
    

      <Grid container spacing={4} sx={{ px: 4, mt: 4 }}>
        {/*  Tabla de Mesas + Selección */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={9}>
            {/* Tabla de Mesas */}
            <Grid item xs={12} md={8}>
              <TableContainer component={Paper} sx={{ width: '100%' }}>
                <Typography variant="h4" sx={{ m: 2 }}>
                  Estado de las Mesas
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Seleccionar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mesas.map((mesa) => (
                      <TableRow key={mesa.id}>
                        <TableCell>{mesa.id}</TableCell>
                        <TableCell>{mesa.nombre}</TableCell>
                        <TableCell
                          sx={{
                            color: mesa.estado === "Ocupada" ? "red" : "green",
                            fontWeight: "bold",
                          }}
                        >
                          {mesa.estado}
                        </TableCell>
                        <TableCell>
                        <Checkbox
                          checked={mesaSeleccionada?.id === mesa.id}
                          onChange={() => handleSeleccionarMesa(mesa.id)}
                          color="primary"
                        />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

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
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{  ml: 2, mb: 5 }} >
            Fecha y hora
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
                        Hora actual
                      </Typography>
                      <Typography variant="h3" color="primary">
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
                height: '100%',
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
                Detalles de la orden
              </Typography>
              <Button variant="contained" onClick={handleFreezeToggle} sx={{ alignSelf: 'center' }}>
                {freezeTime ? 'Reanudar reloj' : 'Registrar hora'}
              </Button>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Hora Ingresada:
              </Typography>
              <Typography variant="body2">
                {selectedDate ? selectedDate.format('DD/MM/YYYY') : 'Sin fecha'} - {(freezeTime ? frozenTime : currentTime).format('HH:mm:ss')} hrs
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
                Mesa seleccionada:
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                {mesaSeleccionada ? mesaSeleccionada.nombre : 'Ninguna'}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
                Platillos seleccionados:
              </Typography>
                {selectedItems.length === 0 ? (
              <Typography variant="body2">No se han seleccionado platillos.</Typography>
              ) : (selectedItems.map((item) => (
              <Typography key={item.id} variant="body2">
                Platillo: {item.name} — Cantidad: {item.quantity}
              </Typography>
            ))
          )}


            </Paper>
          </Grid>
        </Grid>


<Grid container justifyContent="center" spacing={2} sx={{ mt: 5 }}>
  <Grid item>
    <Button
      variant="contained"
      color="primary"
      onClick={() => {
        setOpenDialog(true);
        setCurrentOrderId(null); // Nueva orden
      }}
    >
      Confirmar orden
    </Button>
  </Grid>

  <Grid item>
    <Button onClick={() => setOpenDialog(false)} color="secondary">
      Cancelar
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
      <Typography variant="h4" sx={{  ml: 2, mb: 5 }}>
        Menú
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
  );
}
