"use client";

// Imports.
import { Typography, Box, Paper, IconButton, Button, useTheme, Container } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import Image from "next/image";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryDialog from "../components/inventory-dialog";
import Alerts from "../components/alerts";
import axios from "axios";
import InventoryIcon from '@mui/icons-material/Inventory';
import Grid from "@mui/material/Grid2"; // Use the correct Grid import
import { INVENTORIES_API } from "../constants/inventory/constants";

// Inventory page.
export default function Inventory() {
    // Theme.
    const theme = useTheme();
    // DataGrid columns.
    const columns = [
        // Image.
        {
            field: "image",
            headerName: "Image",
            width: 300,
            renderCell: (params) => {
                // Inventory element image render.
                return (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        <Box
                            sx={{
                                width: 250,
                                height: 150,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                borderRadius: 2,
                            }}
                        >
                            <Image
                                src={params.row.image}
                                alt={params.row.name}
                                layout="responsive"
                                width={100}
                                height={100}
                                style={{ objectFit: "fill" }}
                            />
                        </Box>
                    </Box>
                )
            },
        },
        // Name.
        { field: "name", headerName: "Name", flex: 1 },
        // Unit.
        { field: "unit", headerName: "Unit", flex: 1 },
        // Existence.
        {
            field: "existence",
            headerName: "Existence",
            flex: 1,
            renderCell: (params) => {
                // Existence inventory element render.
                return (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                            height: "100%",
                        }}
                    >
                        {/* Decrease existence. */}
                        <IconButton
                            disabled={disableIncreaseDecreaseExistence}
                            onClick={() => decreaseInventory(params.row._id, params.row.existence)}
                            color="primary"
                        >
                            <RemoveIcon />
                        </IconButton>
                        {/* Current existence. */}
                        <Typography>
                            {params.row.existence}
                        </Typography>
                        {/* Increase existence. */}
                        <IconButton
                            disabled={disableIncreaseDecreaseExistence}
                            onClick={() => increaseInventory(params.row._id, params.row.existence)}
                            color="primary"
                        >
                            <AddIcon />
                        </IconButton>
                    </Box>
                )
            },
        },
        // Actions
        {
            field: "actions",
            headerName: "Actions",
            width: 110,
            renderCell: (params) => (
                <Box>
                    {/* Edit. */}
                    <IconButton
                        onClick={() => handleInventory({ action: "edit", inventory: params.row })}
                        color="primary"
                    >
                        <EditIcon />
                    </IconButton>
                    {/* Delete. */}
                    <IconButton
                        onClick={() => deleteInventory(params.row._id)}
                        color="secondary"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ),
        },
    ];

    // States.
    const [action, setAction] = useState("");
    const [inventory, setInventory] = useState({
        _id: null,
        name: "",
        unit: "",
        existence: "",
        image: null
    });
    const [disableIncreaseDecreaseExistence, setDisableIncreaseDecreaseExistence] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [rows, setRows] = useState();
    const [openAlert, setOpenAlert] = useState(false);
    const [alert, setAlert] = useState({
        message: "",
        severity: "",
    });

    // When loading the page
    useEffect(() => {
        fetchInventories();
    }, []);

    // Fetching all the inventories
    const fetchInventories = async () => {
        // API request
        try {
            const response = await axios.get(INVENTORIES_API)
            setRows(response.data)
            console.log(response.data)
        }
        catch (error){
            console.warn("Error fetching inventories:", error);
            setAlert({
                message: "Failed to load inventories",
                severity: "error"
            });
            setOpenAlert(true);
        }
    };

    // Handle functions.

    // Decrease existence where id matches.
    const decreaseInventory = async (id, existence) => {
        if (existence == 0) {
            console.warn("Inventory existence cannot be less than zero.");
            setAlert(
            {
              message: "Inventory existence cannot be less than zero.",
              severity: "warning"
            });
            setOpenAlert(true);
            return;
        }
        setDisableIncreaseDecreaseExistence(true);
        // API request
        try {
            const response = await axios.put(`${INVENTORIES_API}/existence/${id}`, {'existence': existence - 1} );
            setRows(rows.map((e) => (e._id === id ? response.data : e)));
            setAlert({
                message: "Inventory decreased successfully!",
                severity: "success",
            });
            console.info("Inventory decreased successfully!");
        }
        catch (error) {
            console.warn("Error decreasing inventory existence:", error);
            setAlert({
              message: "Failed to decrease inventory existence",
              severity: "error"
            });
        } 
        setDisableIncreaseDecreaseExistence(false);
        setOpenAlert(true);
    };

    // Increase existence where id matches.
    const increaseInventory = async (id, existence) => {
        // Increase existence.
        setDisableIncreaseDecreaseExistence(true);
        // API request
        try {
            const response = await axios.put(`${INVENTORIES_API}/existence/${id}`, {'existence': existence + 1} );
            setRows(rows.map((e) => (e._id === id ? response.data : e))); 
            setAlert({
                message: "Inventory increased successfully!",
                severity: "success",
            });
            console.info("Inventory increased successfully!");
        }
        catch (error) {
            console.error("Error increasing inventory existence:", error);
            setAlert({
              message: "Failed to increase inventory existence",
              severity: "error"
            });
        }  
        setDisableIncreaseDecreaseExistence(false);
        setOpenAlert(true);
    };

    // Edit or add inventory.
    const handleInventory = ({ action, inventory }) => {
        // Update action.
        setAction(action);

        // Open dialog.
        setOpenDialog(true);

        // Select action.
        if (action == "add") {
            setInventory({
                _id: null,
                name: "",
                unit: "",
                existence: 0,
                image: null
            });
        } else if (action == "edit") {
            setInventory(inventory);
        } else {
            console.warn("Unknown action:", action);
        }
    };

    // Delete inventory where id matches.
    const deleteInventory = async (id) => {
        // Delete inventory.
        // API request
        try {
            await axios.delete(`${INVENTORIES_API}/${id}`);
            setRows(rows.filter((row) => row._id !== id));
            setAlert({
                message: "Inventory deleted successfully!",
                severity: "success",
            });
            setOpenAlert(true);
            console.info("Inventory deleted successfully!");
        }
        catch (error) {
            console.error("Error deleting inventory:", error);
            setAlert({
              message: "Failed to delete inventory",
              severity: "error"
            });
            setOpenAlert(true);
        }
    };

    // Component.
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
          p: 4,
        }}
      >
        <InventoryIcon sx={{ mr: 1,fontSize: 40 }} />
        Inventario
      </Typography>
            {/* Add inventory button. */}
            
          

           
            <Box sx={{ display: "flex", justifyContent: "center",   mt: 5, mb: 5 }}>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    size="large"
                    sx={{ borderRadius: 7, p:3, fontWeight: 'bold', fontSize: '1.2rem', color: 'white', backgroundColor: '#5188a7' }}
                    onClick={() => handleInventory({ action: "add" })}
                >
                    Add Item
                </Button>
            </Box>
            <Paper
                sx={{
                    padding: 2,
                    borderRadius: 2,
                    maxWidth: "80%",
                    margin: "0 auto",
                    height: "600px",
                }}
            >
                {/* Inventory table. */}
                <DataGrid
                    columns={columns}
                    rows={rows}
                    getRowId={(row) => row._id}
                    rowHeight={180}
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
            {/* Inventory for creation/edition dialog. */}
            <InventoryDialog
                open={openDialog}
                setOpen={setOpenDialog}
                inventory={inventory}
                setInventory={setInventory}
                action={action}
                rows={rows}
                setRows={setRows}
                setAlert={setAlert}
                setOpenAlert={setOpenAlert}
            />
            {/* Alert. */}
            <Alerts open={openAlert} setOpen={setOpenAlert} alert={alert} />
    </Container>
    );
}