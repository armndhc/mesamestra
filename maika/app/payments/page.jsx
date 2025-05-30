"use client";

import React, { useState, useEffect } from 'react';
import {
  Container,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box
} from '@mui/material';
import Grid from "@mui/material/Grid2";
import Alerts from '../components/alerts'; // Import the Alerts component
import PaymentIcon from '@mui/icons-material/Payment';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { PAYMENTS_API } from '../constants/payments/constants';
import axios from 'axios';

export default function TicketPage() {
  const [openDialog, setOpenDialog] = useState(false); // State to manage dialog visibility
  const [selectedOrder, setSelectedOrder] = useState(null); // State to hold the selected order
  const [paymentMethod, setPaymentMethod] = useState(''); // State for payment method
  const [fiscalData, setFiscalData] = useState({ rfc: '' }); // State for fiscal data fields
  const [alert, setAlert] = useState({ severity: "success", message: "" }); // State for alert messages
  const [openAlert, setOpenAlert] = useState(false); // State for alert visibility
  const [orders, setOrders] = useState([]); // Initialize orders state with constants
  const [payments, setPayments] = useState([]); // Initialize orders state with constants

  useEffect(() => {
    fetchOrders();
    fetchPayments();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${PAYMENTS_API}/pending`);
      setOrders(response.data)
      console.log(response.data)
    }
    catch (error){
      console.error("Error fetching books:", error);
      setAlert({
        message: "Failed to load books",
        severity: "error"
      });
      setOpenAlert(true);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axios.get(PAYMENTS_API);
      setPayments(response.data)
      console.log(response.data)
    }
    catch (error){
      console.error("Error fetching books:", error);
      setAlert({
        message: "Failed to load books",
        severity: "error"
      });
      setOpenAlert(true);
    }
  };

  const handleGenerateTicket = (order) => {
    setSelectedOrder(order); // Set the selected order
    console.log("Generating ticket for order:", order); // Log the selected order for ticket generation
    setOpenDialog(true); // Open the dialog
  };

  const handlePayment = async () => {
    // Logic for payment confirmation
    console.log("Processing payment for:", selectedOrder); // Log the selected order details
    console.log("Payment details:", paymentMethod, fiscalData); // Log payment method and fiscal data
    try {
      const response = await axios.post(PAYMENTS_API, {...selectedOrder, "_id": 0, "order_id": selectedOrder._id, "rfc": fiscalData.rfc, "payment_type": paymentMethod})
      setPayments([...payments, response.data]);
      setOrders(orders.filter((order) => order._id !== selectedOrder._id));
      setAlert({
        message: "Payment added successfully!",
        severity: "success",
      });
      console.info("Payment added successfully!");
      setOpenDialog(false); // Close the dialog
    }
    catch {
      setAlert({
        message: "Failed to add inventory.",
        severity: "error",
      });
    }
    setOpenAlert(true);
  };


  const handleDeletePayment = async (paymentId) => {
    try {
      const response = await axios.delete(`${PAYMENTS_API}/${paymentId}`);
      setPayments(payments.filter((payment) => payment._id !== paymentId));
      setAlert({
        message: `Payment #${paymentId} deleted successfully!`,
        severity: "success",
      });
      console.info(`Payment #${paymentId} deleted successfully!`);
    } catch (error) {
      console.error(`Error deleting payment #${paymentId}:`, error);
  
      setAlert({
        message: `Failed to delete payment #${paymentId}.`,
        severity: "error",
      });
    }
    setOpenAlert(true); 
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
          <PaymentIcon sx={{ mr: 1, fontSize: 40 }} />
          Payments 
        </Typography>
      </Container>

      <Paper       
        elevation={5}
        sx={{
          mt:6,
          p: 3,
          height: '880px',
          width: '100%',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ ml: 2, mb: 5 }}>
        Select an Order to Generate a Ticket
      </Typography>

      <Grid container justifyContent="center" spacing={2}>
        {orders.map((order) => (
          <Grid key={order._id} xs={12} sm={6} md={4}>
            <Paper elevation={3} style={{ padding: '16px', margin: '8px 0' }}>
              <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                <Box component="span" sx={{ color: '#2c2f48' }}>Order #{order._id}</Box>
              </Typography>

              <Typography variant="subtitle1"> <strong>Name:</strong> {order.name}</Typography>
              <Typography variant="subtitle1"> <strong>Table:</strong> {order.table}</Typography>
              <Typography variant="subtitle1"> <strong>Dishes:</strong> </Typography>
              {order.dishes.map((dish, idx) => (
                <Typography key={idx}>
                  <RestaurantIcon sx={{ ml: 2, mr: 1, fontSize: 20, color: "#2c2f48" }}/> <strong>{dish.name}</strong> ${dish.price} 
                  <Typography sx={{ ml: 6, borderBottom: "1px solid #2c2f48",}}> Quantity: {dish.quantity}</Typography>
                </Typography>
              ))}
              <Button
                variant="contained"
                fullWidth
                sx={{mt: 2, bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                onClick={() => handleGenerateTicket(order)} // Generate ticket for this order
              >
                Generate Ticket
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
      </Paper>

      <Paper       
        elevation={5}
        sx={{
          mt:6,
          p: 3,
          height: '880px',
          width: '100%',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ ml: 2, mb: 5 }}>
          Payments
        </Typography>
        <Grid container spacing={2}>
          {payments.map((payment) => (
            <Grid key={payment._id} xs={12} sm={6} md={4}>
              <Paper elevation={3} style={{ padding: '16px', margin: '8px 0' }}>
                <Typography variant="h6">Payment #{payment._id}</Typography>
                <Typography variant="h6">Order #{payment.order_id}</Typography>
                <Typography>Name: {payment.name}</Typography>
                <Typography>Table: {payment.table}</Typography>
                <Typography>Dishes:</Typography>
                {payment.dishes.map((dish, idx) => (
                  <Typography key={idx}>
                    {">"} {dish.name} ({dish.price}) - Quantity: {dish.quantity}
                  </Typography>
                ))}
                <Typography>Total: {payment.total}</Typography>
                <Typography>RFC: {payment.rfc}</Typography>
                <Typography>Payment method: {payment.payment_type}</Typography>

                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2, color: 'white', backgroundColor: '#5188a7' }}
                  onClick={() =>  handleDeletePayment(payment._id)} // Generate ticket for this order
                >
                  HIDE TICKET
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Payment Dialog */}
      <Dialog open={openDialog} onClose={() => {
        console.log("Closing payment dialog"); // Log when the dialog is closed
        setOpenDialog(false);
      }}>
        <DialogTitle>Payment for Order</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Total Price: ${selectedOrder ? selectedOrder.total.toFixed(2) : 0}</Typography>
          <Typography variant="subtitle1">Customer Name: {selectedOrder ? selectedOrder.name : ''}</Typography> {/* Display name from selected order */}
          <TextField
            select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              console.log("Selected payment method:", e.target.value); // Log the selected payment method
            }}
            fullWidth
            margin="normal"
          >
            <MenuItem value="Credit Card">Credit Card</MenuItem>
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="PayPal">PayPal</MenuItem>
          </TextField>
          <TextField
            label="RFC"
            value={fiscalData.rfc}
            onChange={(e) => {
              setFiscalData({ ...fiscalData, rfc: e.target.value });
              console.log("RFC updated:", e.target.value); // Log the updated RFC
            }}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button sx={{fontSize: '1.0rem'}}  onClick={() => {
            console.log("Payment dialog canceled"); // Log when cancel button is clicked
            setOpenDialog(false);
          }} color="#8bbfda">
            Cancel
          </Button>
          <Button sx={{ color: 'white', backgroundColor: '#5188a7' }} onClick={handlePayment} >
            Pay
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alerts for payment actions */}
      <Alerts open={openAlert} setOpen={setOpenAlert} alert={alert} setAlert={setAlert} />
    
    </Box>
  );
}