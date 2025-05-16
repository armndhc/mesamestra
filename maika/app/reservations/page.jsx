"use client";

import * as React from 'react';
import dayjs from 'dayjs';
import { IconButton, Paper, Box, Container, useTheme, Typography, Button, InputBase, TextField } from '@mui/material';

import { useState, useEffect  } from "react";

import { DataGrid } from "@mui/x-data-grid";
import Alerts from "../components/alerts";
import ReservationDialog from "../components/reservation-dialog";
import EventIcon from '@mui/icons-material/Event';
import Grid from "@mui/material/Grid2"; // Use the correct Grid import
{/*Importing Material-UI Icons*/}
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import axios from "axios";
import { RESERVATIONS_API } from "../constants/reservations/constants";


export default function Reservations() {

  const [rows, setRows] = useState();

  {/*Definition of table columns*/}
  const columns = [
    { field: "date", headerName: "Date", flex: 2 },
    { field: "people", headerName: "Number of people", flex: 1 },
    { field: "t_reservation", headerName: "Reservation", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "last_name", headerName: "Last Name", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "special", headerName: "Special Request", flex: 1 },

    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleReservation({ action: "edit", reservation: params.row })}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => deleteReservation(params.row._id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const [action, setAction] = useState("");

  {/*Status to handle reservation details*/}
  const [reservation, setReservation] = useState({
    _id: null,
    date: dayjs().format("DD MMM YYYY HH:mm"),
    people: "",
    t_reservation: "",
    name: "",
    last_name: "",
    phone: "",
    email: "",
    special: "",
  });

  const [openDialog, setOpenDialog] = useState(false);


  {/*Function to handle reservation actions*/}
  const handleReservation = ({ action, reservation }) => {
    console.log("Handle reservation action: ", action);
    setAction(action);
    setOpenDialog(true);
    if (action == "add") {
      console.log("Preparing to add a new Reservation");
      setReservation({
        _id: null,
        date: dayjs().format("DD MMM YYYY HH:mm"),
        people: "",
        t_reservation: "",
        name: "",
        last_name: "",
        phone: "",
        email: "",
        special: "",
      });
    } else if (action == "edit") {
      console.info("Reservation details:", reservation);
      console.info("Preparing to edit a new reservation");
      setReservation(reservation);
    } else {
      console.warn("Unknown action:", action);
    }
  };

  {/*Function to delete a reservation*/}
  const deleteReservation = async(id) => {

    try {
      await axios.delete(`${RESERVATIONS_API}/${id}`);
      setRows(rows.filter((row) => row._id !== id));
      setAlert({
          message: "Reservation deleted successfully!",
          severity: "success",
      });
      setOpenAlert(true);
      console.info("Reservation deleted successfully!");
    }
    catch (error) {
        console.error("Error deleting reservation:", error);
        setAlert({
          message: "Failed to delete reservation",
          severity: "error"
        });
        setOpenAlert(true);
    }
  };

  {/*Theme */}
  const theme = useTheme();

  const [value, setValue] = useState(0);

  const [selected, setSelected] = useState("DebitCredit");
  const handleSelection = (option) => {
    setSelected(option);
  };

const [openAlert, setOpenAlert] = useState(false);

const [alert, setAlert] = useState({
  message: "",
  severity: "",
});

useEffect(() => {
  fetchReservation();
}, []);
const fetchReservation = async () => {
  try {
      const response = await axios.get(RESERVATIONS_API)
      setRows(response.data)
      console.log(response.data)
  }
  catch (error){
      console.warn("Error fetching reservations:", error);
      setAlert({
          message: "Failed to load reservations",
          severity: "error"
      });
      setOpenAlert(true);
  }
};

{/*function to handle field validation*/}
const handleBlur = (e, label) => {
  if (label === 'Phone') {
    const isValid = validatePhone(e.target.value);
    if (!isValid) {
      setAlert({
        message: "Número de teléfono inválido",
        severity: "error",
      });
      setOpenAlert(true);
    }
  } else if (label === 'Email') {
    const isValid = validateEmail(e.target.value);
    if (!isValid) {
      setAlert({
        message: "Correo electrónico inválido",
        severity: "error",
      });
      setOpenAlert(true);
    }
  }
};


  return (
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
        <EventIcon sx={{ mr: 1,fontSize: 40 }} />
        Reservations
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5, mb: 5 }}>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          size="large"
          
          sx={{ borderRadius: 7, p:3, fontWeight: 'bold', fontSize: '1.2rem', color: 'white', backgroundColor: '#5188a7' }}
          onClick={() => handleReservation({ action: "add" })}
        >
          Add Reservation
        </Button>
      </Box>

      <Paper
        elevation={5}
        sx={{
          padding: 2,
          borderRadius: 5,
          maxWidth: "80%",
          margin: "0 auto",
          height: "400px",
          
        }}
      >
        <DataGrid
 
          columns={columns}
          rows={rows}
          getRowId={(row) => row._id}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          sx={{
            
            border: "1px solid #DDD",
            backgroundColor: "#F9F9F9",
            "& .MuiDataGrid-columnHeaderTitle": {
              backgroundColor: "#F9F9F9",
              color: "#2c2f48",   // Color del texto de todos los encabezados
              fontWeight: "bold",
            },
            "& .MuiDataGrid-columnHeaders": {
              borderBottom: "2px solid #DDD",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#F5F5F5",
            },
            "& .MuiDataGrid-cell": {
              borderRight: "1px solid #DDD",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "#F1F1F1",

            },
          }}
        />
      </Paper>

      <ReservationDialog
        open={openDialog}
        setOpen={setOpenDialog}
        reservation={reservation}
        setReservation={setReservation}
        action={action}
        rows={rows}
        setRows={setRows}
        setAlert={setAlert}
        setOpenAlert={setOpenAlert}
      />
      <Alerts open={openAlert} setOpen={setOpenAlert} alert={alert} />
    </Container>
  );
}
