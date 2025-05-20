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

import Alerts from "../components/alerts"; // Import the Alerts component
import axios from "axios";
import { ORDERS_API } from '../constants/orders/constants'; // Import the API constant

export default function App() {
  // Estados originales de App
  const [orders, setOrders] = useState([]); // State to manage the list of orders
  const [openDialog, setOpenDialog] = useState(false); // State to manage the visibility of the dialog
  const [currentOrderId, setCurrentOrderId] = useState(null); // State for the ID of the current order
  const [alert, setAlert] = useState({ severity: "success", message: "" }); // State for alert messages
  const [openAlert, setOpenAlert] = useState(false); // State for alert visibility

  // Estados migrados desde OrderForm
  const [name, setName] = useState(""); // Campo para nombre de cliente
  const [table, setTable] = useState(""); // Campo para número de mesa
  const [selectedItems, setSelectedItems] = useState([]); // Items seleccionados del menú
  const [menuItems, setMenuItems] = useState([]); // Menú vacío inicialmente
  const [loading, setLoading] = useState(false); // Estado para manejar el cargado
  const [error, setError] = useState(null); // Estado para manejar errores

  // Estados para fecha y hora
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [freezeTime, setFreezeTime] = useState(false);
  const [frozenTime, setFrozenTime] = useState(null);
  
  // Función para obtener órdenes existentes
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

  // Obtener órdenes al cargar el componente
  useEffect(() => {
    fetchOrders();
  }, []);

  // Obtener menú al cargar el componente
  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/menu-api/v1/menus");
        setMenuItems(response.data);
      } catch (err) {
        setError("Error al obtener el menú: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // Actualizar hora cada segundo cuando no está congelada
  useEffect(() => {
    if (!freezeTime) {
      const interval = setInterval(() => {
        setCurrentTime(dayjs());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [freezeTime]);

  // Manejar la selección de items del menú
  const handleSelectItem = (item) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i._id === item._id);
      if (exists) {
        return prev.filter((i) => i._id !== item._id); // lo quita si ya está
      } else {
        return [...prev, { ...item, quantity: 1 }]; // lo agrega si no está
      }
    });
  };

  // Manejar cambios de cantidad para items seleccionados
  const handleQuantityChange = (_id, quantity) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item._id === _id ? { ...item, quantity: parseInt(quantity) || 1 } : item
      )
    );
  };

  // Manejar congelamiento del reloj
  const handleFreezeToggle = () => {
    if (!freezeTime) {
      setFrozenTime(currentTime);
    }
    setFreezeTime(!freezeTime);
  };

  // Función para enviar el pedido
  const handleSubmit = async () => {
    // Validar campos obligatorios
    if (!name.trim()) {
      setAlert({ severity: "error", message: "Por favor, ingrese el nombre del cliente" });
      setOpenAlert(true);
      return;
    }
    
    if (!table || isNaN(parseInt(table))) {
      setAlert({ severity: "error", message: "Por favor, ingrese un número de mesa válido" });
      setOpenAlert(true);
      return;
    }
    
    if (selectedItems.length === 0) {
      setAlert({ severity: "error", message: "Por favor, seleccione al menos un plato" });
      setOpenAlert(true);
      return;
    }
    
    // Verificar que los datos estén correctamente formateados
    const orderDetails = {
      name,
      table: parseInt(table, 10),
      dishes: selectedItems.map(item => ({
        name: item.meal,
        price: item.price,
        quantity: item.quantity,
      })),
      // Incluimos el tiempo si queremos usar esa funcionalidad
      time: (freezeTime ? frozenTime : currentTime).format("HH:mm:ss")
    };
  
    console.log("Enviando datos:", orderDetails); // Logueamos los datos para debug
  
    try {
      // Uso de try/catch para capturar errores
      const response = await axios.post(ORDERS_API, orderDetails);
      console.log("Respuesta completa:", response);
      console.log("Orden guardada exitosamente:", response.data);
      
      // Actualizar la lista de órdenes
      setOrders(prev => [...prev, response.data]);
  
      // Limpiar campos después de guardar
      setName("");
      setTable("");
      setSelectedItems([]);
      
      // Mostrar alerta de éxito
      setAlert({ severity: "success", message: "Orden guardada correctamente." });
      setOpenAlert(true);
      
      // Si el tiempo estaba congelado, descongelarlo
      if (freezeTime) {
        setFreezeTime(false);
      }
    } catch (error) {
      console.error("Error detallado:", error);
      
      // Mostrar información más específica sobre el error
      let errorMessage = "Error al guardar la orden.";
      if (error.response) {
        // El servidor respondió con un código de error
        console.log("Respuesta de error:", error.response.data);
        errorMessage = `Error del servidor: ${error.response.status} - ${error.response.data.error || error.response.statusText}`;
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        errorMessage = "No se pudo conectar con el servidor. Verifica que esté funcionando.";
      } else {
        // Algo sucedió al preparar la petición
        errorMessage = `Error: ${error.message}`;
      }
      
      setAlert({ severity: "error", message: errorMessage });
      setOpenAlert(true);
    }
  };

  // Manejar la eliminación de una orden
  const handleDeleteOrder = async (id) => {
    try {
      await axios.delete(`${ORDERS_API}/${id}`);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== id));
      setAlert({ severity: "success", message: "Order deleted successfully!" });
      setOpenAlert(true);
    } catch (error) {
      console.error("Error deleting order:", error);
      setAlert({ severity: "error", message: "Failed to delete order" });
      setOpenAlert(true);
    }
  };

  return (
    <Box
      maxWidth="xl"
      sx={{ mx: "10%" }}
    >
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
          <TableRestaurantIcon sx={{ mr: 1, fontSize: 40 }} />
          Orders
        </Typography>
      </Container>

      <Container maxWidth="xl" sx={{ minHeight: "800px" }}>
        <Grid container justifyContent="center" spacing={4} sx={{ px: 4, mt: 4 }}>
          {/* Columna 1: Fecha y Hora */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={5}
              sx={{
                p: 3,
                height: '880px',
                width: '100%',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'start',
              }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ ml: 2, mb: 5 }}>
                Date & Time
              </Typography>

              <Grid container spacing={2} justifyContent="center">
                {/* Columna izquierda: Hora actual y calendario */}
                <Grid item xs={12}>
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
                          {(freezeTime ? frozenTime : currentTime).format("HH:mm:ss")}
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
              </Grid>
            </Paper>
          </Grid>

          {/* Columna 2: Formulario de Orden */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={5}
              sx={{
                p: 3,
                height: '880px',
                width: '100%',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ ml: 2, mb: 3 }}>
                Order Form
              </Typography>

              <Box sx={{ p: 2 }}>
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

                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 4, mb: 2 }}>
                  Date and Time Information
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1">
                    <strong>Selected Date:</strong> {selectedDate.format('DD/MM/YYYY')}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Order Time:</strong> {(freezeTime ? frozenTime : currentTime).format('HH:mm:ss')} hrs
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={handleFreezeToggle} 
                    sx={{ mt: 2, color: 'white', backgroundColor: '#5188a7' }}
                  >
                    {freezeTime ? 'Resume clock' : 'Record time'}
                  </Button>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2, mb: 2 }}>
                  Selected Dishes
                </Typography>

                {selectedItems.length === 0 ? (
                  <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    No dishes have been selected
                  </Typography>
                ) : (
                  <Box sx={{ mb: 3 }}>
                    {selectedItems.map((item) => (
                      <Box 
                        key={item._id} 
                        sx={{ 
                          p: 2, 
                          mb: 1, 
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          boxShadow: 1
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          {item.meal}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2">
                            Price: ${item.price.toFixed(2)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 2 }}>
                              Quantity:
                            </Typography>
                            <TextField
                              type="number"
                              size="small"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                              inputProps={{ min: 1, style: { width: '40px', textAlign: 'center' } }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    ))}

                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.12)' }}>
                      <Typography variant="h6" fontWeight="bold">
                        Total: ${selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={handleSubmit} 
                  sx={{ mt: 2, color: 'white', backgroundColor: '#5188a7' }}
                >
                  Confirm Order
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Columna 3: Órdenes Activas */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={5}
              sx={{
                p: 3,
                height: '880px',
                width: '100%',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ ml: 2, mb: 5 }}>
                Active Orders
              </Typography>

              {orders.length === 0 ? (
                <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
                  No active orders
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {orders.map((order) => (
                    <Grid item xs={12} key={order._id}>
                      <Paper 
                        elevation={2} 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          border: '1px solid rgba(0,0,0,0.12)'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6" fontWeight="bold">
                            Table {order.table}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {order.orderTime || "No time"}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          Customer: {order.name}
                        </Typography>
                        
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                          Dishes:
                        </Typography>
                        
                        {order.dishes.map((dish, idx) => (
                          <Box 
                            key={idx} 
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              py: 0.5
                            }}
                          >
                            <Typography variant="body2">{dish.name}</Typography>
                            <Typography variant="body2">×{dish.quantity}</Typography>
                          </Box>
                        ))}
                        
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{ mt: 2, bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                          onClick={() => handleDeleteOrder(order._id)}
                        >
                          Complete Order
                        </Button>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Sección del Menú */}
        <Paper elevation={5} sx={{ p: 2, mt: 4 }}>
          <Typography variant="h5" sx={{ ml: 2, mb: 5, fontWeight: 'bold' }}>
            Menu
          </Typography>
          
          {loading ? (
            <Typography sx={{ textAlign: 'center', p: 4 }}>Loading menu...</Typography>
          ) : error ? (
            <Typography sx={{ textAlign: 'center', p: 4, color: 'error.main' }}>{error}</Typography>
          ) : (
            <Grid container spacing={2} justifyContent="center">
              {menuItems.map((item) => {
                const selected = selectedItems.find(i => i._id === item._id);

                return (
                  <Grid item xs={12} sm={6} md={2.4} key={item._id} sx={{ display: 'flex' }}>
                    <Card 
                      onClick={() => handleSelectItem(item)} 
                      sx={{ 
                        cursor: 'pointer', 
                        height: '100%', 
                        width: '100%',
                        border: selected ? '2px solid #5188a7' : 'none'
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={item.image}
                        alt={item.meal}
                      />
                      <CardContent>
                        <Typography variant="h6" fontWeight="bold">
                          {item.meal}
                        </Typography>
                        <Typography color="text.secondary">
                          ${item.price.toFixed(2)}
                        </Typography>

                        {selected && (
                          <>
                            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                              Selected
                            </Typography>
                            <TextField
                              type="number"
                              label="Quantity"
                              size="small"
                              value={selected.quantity}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleQuantityChange(item._id, e.target.value)}
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
          )}
        </Paper>
      </Container>

      {/* Alerta para mensajes al usuario */}
      <Alerts open={openAlert} setOpen={setOpenAlert} alert={alert} setAlert={setAlert} />
    </Box>
  );
}