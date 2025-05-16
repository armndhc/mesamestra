import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Grid,
} from "@mui/material";
import axios from "axios";

function OrderForm({ onAddOrder, order }) {
  const [name, setName] = useState(""); // Campo combinado para First Name y Last Name
  const [table, setTable] = useState("");
  const [selectedDishes, setSelectedDishes] = useState([{ dish: "", quantity: 1 }]);
  const [menuItems, setMenuItems] = useState([]); // Menú vacío inicialmente
  const [loading, setLoading] = useState(false); // Estado para manejar el cargado
  const [error, setError] = useState(null); // Estado para manejar errores

  // Fetch menu items
  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true); // Comienza a cargar
      try {
        const response = await axios.get("http://localhost:5000/menu-api/v1/menus"); // URL actualizada
        setMenuItems(response.data); // Actualiza el estado con los datos obtenidos
      } catch (error) {
        setError("Error fetching menu: " + error.message); // Si hay un error, guarda el mensaje
        console.error("Error fetching menu:", error); // Muestra el error en la consola
      } finally {
        setLoading(false); // Termina de cargar
      }
    };

    fetchMenu();
  }, []); // Este efecto solo se ejecuta una vez cuando el componente se monta

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

  // Handle form submission
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

  return (
    <Box sx={{ padding: 2 }}>
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
      <Box sx={{ display: "flex", gap: 2, marginTop: "16px" }}>
        <Button variant="contained" color="secondary" onClick={handleAddDish}>
          Add Another Dish
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Add Order
        </Button>
      </Box>
    </Box>
  );
}

export default OrderForm;
