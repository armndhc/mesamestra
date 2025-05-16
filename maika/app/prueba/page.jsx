
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
} from "@mui/material";
import Grid from "@mui/material/Grid2"; // Use the correct Grid import
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import {Table, TableBody, TableCell, TableContainer,TableHead, TableRow, Checkbox} from '@mui/material';


import Alerts from "../components/alerts"; // Import the Alerts component
import axios from "axios";
import { ORDERS_API } from '../constants/orders/constants'; // Import the API constant



export default function TablaMesas() {
  const [seleccionadas, setSeleccionadas] = React.useState([]);

  const mesas = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    nombre: `Mesa ${i + 1}`,
    estado: i % 2 === 0 ? 'Disponible' : 'Ocupada', // ejemplo alternando estados
  }));

  const manejarSeleccion = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const estaSeleccionada = (id) => seleccionadas.includes(id);

  return (
    <TableContainer component={Paper} sx={{ maxWidth: 600, margin: 'auto' }}>
      <Table>
        <TableHead sx={{ backgroundColor: '#e0f7fa' }}>
          <TableRow>
            <TableCell></TableCell>
            <TableCell><strong>ID</strong></TableCell>
            <TableCell><strong>Mesa</strong></TableCell>
            <TableCell><strong>Estado</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mesas.map((mesa) => (
            <TableRow
              key={mesa.id}
              hover
              selected={estaSeleccionada(mesa.id)}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={estaSeleccionada(mesa.id)}
                  onChange={() => manejarSeleccion(mesa.id)}
                  color="primary"
                />
              </TableCell>
              <TableCell>{mesa.id}</TableCell>
              <TableCell>{mesa.nombre}</TableCell>
              <TableCell>{mesa.estado}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
