// Imports.
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    Box,
    Typography,
    Container,
    InputAdornment,
  } from "@mui/material";
  import { 
    Badge, 
    Category, 
    Inventory, 
    Image as ImageIcon 
  } from '@mui/icons-material';
  import Image from "next/image";
  import { useState, useEffect } from "react";
  import { MENU_API } from "../constants/menu/constants";
  import axios from "axios";
  import RestaurantIcon from '@mui/icons-material/Restaurant';
  import DescriptionIcon from '@mui/icons-material/Description';
  import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

  // Menu dialog.
  export default function MenuDialog({
    open,
    setOpen,
    menu,
    setMenu,
    action,
    rows,
    setRows,
    setAlert,
    setOpenAlert,
  }) {
    // States.
    const [selectedImage, setSelectedImage] = useState(null);
    const [errors, setErrors] = useState({});
  
  
    //Close dialog.
    const handleCloseDialog = () => {
      setSelectedImage(null);
      setErrors({});
      setOpen(false);
    };
  
    // Validate fields.
    const validateFields = () => {
      // Build error object.
      const newErrors = {};
      if (!menu.meal) newErrors.name = "Name is required.";
      if (!menu.description) newErrors.unit = "Description is required.";
      if (!menu.price || menu.price < 0) newErrors.existence = "Price must be a non-negative number.";
      if (!menu.image && !selectedImage) newErrors.image = "Image is required.";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    // Save inventory.
    const saveMenu = async () => {
      // Validate fields.
      if (!validateFields()) {
        setAlert({
          message: "Please fill all required fields correctly.",
          severity: "error",
        });
        setOpenAlert(true);
        console.warn("Please fill all required fields correctly.");
        return;
      }
  
      // Build the new object for menu.
      const updatedMenu = {
        ...menu,
        price: +menu.price,
        image: selectedImage ? selectedImage : menu.image,
      };
  
      // Select if add or edit the menu.
      if (action === "add") {
        // API request
        try {
          const response = await axios.post(MENU_API, updatedMenu)
          setRows([...rows, response.data]);
          setAlert({
            message: "Meal added successfully!",
            severity: "success",
          });
          console.info("Meal added successfully!");
        }
        catch {
          setAlert({
            message: "Failed to add Meal.",
            severity: "error",
          });
        }
        setOpenAlert(true);
      }
  
      handleCloseDialog();
    };
  
    // Handle text inputs change.
    const handleChange = (event) => {
      setMenu({
        ...menu,
        [event.target.name]: event.target.value,
      });
    };
  
  // Handle image change.
  const handleImageChange = (event) => {
    // If a image was selected.
    const file = event.target.files[0];
    if (file) {
      // Validate file type.
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64Image = reader.result;
          setSelectedImage(base64Image);
        };

        // Read the file as a data URL (Base64 string)
        reader.readAsDataURL(file);
      } else {
        setAlert({
          message: "Please upload a valid image file.",
          severity: "error",
        });
        setOpenAlert(true);
        console.warn("Please upload a valid image file.");
      }
    }
  };
  
  
    // Component.
    return (
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Add Dish</DialogTitle>
        <DialogContent>
          <Container>
            <Typography variant="h4" color="#5188a7" gutterBottom sx={{fontWeight: 'bold'}} >
              Dish details
            </Typography> 
          </Container>
          {/* Meal field. */}
          <TextField
            margin="dense"
            name="meal"
            label="Dish"
            fullWidth
            value={menu.meal}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <RestaurantIcon/>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          {/* Unit field. */}
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            value={menu.description}
            onChange={handleChange}
            error={!!errors.unit}
            helperText={errors.unit}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DescriptionIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          {/* Price field. */}
          <TextField
            margin="dense"
            name="price"
            label="Price"
            type="number"
            fullWidth
            value={menu.price}
            onChange={handleChange}
            error={!!errors.existence}
            helperText={errors.existence}
            inputProps={{ min: 0 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
            
          />
          {/* Image field. */}
          <TextField
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            error={!!errors.image}
            helperText={errors.image}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ImageIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        {/* Image preview. */}
        {selectedImage && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">Image Preview:</Typography>
            <Image
              src={selectedImage}
              alt="Selected Image"
              width={200}
              height={200}
              style={{ objectFit: "cover" }}
            />
          </Box>
        )}
      </DialogContent>
      {/* Action buttons. */}

      <DialogActions>
        <Button  onClick={handleCloseDialog} sx={{fontSize: '1.0rem'}} color="#8bbfda">
          Cancel
        </Button>
        <Button  
          variant="contained"
          size="large"             
          sx={{ borderRadius: 7, p:1, fontWeight: 'bold', fontSize: '1.2rem', color: 'white', backgroundColor: '#5188a7' }} onClick={saveMenu}  >
            {action === "add" ? "Add" : "Save"}
        </Button>
      </DialogActions>  
    </Dialog>
  );
}