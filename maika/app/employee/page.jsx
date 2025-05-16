'use client';
import {
  Box,
  Container,
  IconButton,
  Paper,
  Chip,
  Avatar,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useState, useEffect } from "react";
import EmpDialog from "../components/emp-dialog";
import Alerts from "../components/alerts";
import axios from "axios";

export default function EmployeeTable() {
  const [tabIndex, setTabIndex] = useState(0);
  const [action, setAction] = useState("");
  const [employee, setEmp] = useState({
    _id: null,
    name: "",
    title: "",
    email: "",
    salary: "",
    birthday: "",
    status: true, 
    avatar: "",
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [rows, setRows] = useState([]);
  const [openAlert, setOpenAlert] = useState(false);
  const [alert, setAlert] = useState({
    message: "",
    severity: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/v1/staff");
      const mappedRows = response.data.map((row) => ({ ...row, id: row._id })); 
      setRows(mappedRows);
    } catch (error) {
      setAlert({
        message: "Failed to fetch employees",
        severity: "error",
      });
      setOpenAlert(true);
    }

  };

  const handleEmp = ({ action, employee }) => {
    try {
      setAction(action);
      setOpenDialog(true);
      setEmp(action === "add" ? { ...employee, _id: null, status: true } : employee);
    } catch (error) {
      setAlert({
        message: "Failed to open employee dialog",
        severity: "error",
      });
      setOpenAlert(true);
    }
  };

  const handleSave = async (newEmployee) => {
    try {
      if (action === "add") {
        const response = await axios.post("http://127.0.0.1:5000/api/v1/staff", newEmployee);
        setRows((prevRows) => [...prevRows, response.data]);
        setAlert({
          message: "Employee added successfully",
          severity: "success",
        });
      } else if (action === "edit") {
        const response = await axios.put(`http://127.0.0.1:5000/api/v1/staff/${newEmployee._id}`, newEmployee);
        setRows((prevRows) =>
          prevRows.map((row) =>
            row._id === newEmployee._id
              ? { ...response.data, id: response.data._id }
              : row
          )
        );
        setAlert({
          message: "Employee updated successfully",
          severity: "success",
        });
      }
    } catch (error) {
      setAlert({
        message: "Failed to save employee",
        severity: "error",
      });
    }
    setOpenDialog(false);
    setOpenAlert(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/v1/staff/${id}`);
      setRows(rows.filter((row) => row._id !== id));
      setAlert({
        message: "Employee deleted successfully",
        severity: "success",
      });
    } catch (error) {
      setAlert({
        message: "Failed to delete employee",
        severity: "error",
      });
    }
    setOpenAlert(true);
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };
  


  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const columns = [
    { field: "_id", headerName: "ID", flex: 1 },
    {
      field: "name",
      headerName: "Name",
      flex: 2,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Avatar alt={params.value} src={params.row.avatar} sx={{ width: 30, height: 30, mr: 1, mt: 0.5 }} />
          <Typography fontWeight="bold">{params.value}</Typography>
          
        </Box>
        
      ),
    },
    { field: "title", headerName: "Title", flex: 2 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "salary",
      headerName: "Salary",
      flex: 1,
      renderCell: (params) => (
        <Typography>
          {formatCurrency(params.value)}
        </Typography>
      ),
    },


    
    { field: "birthday", headerName: "Birthday", flex: 1 },
    
   

    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"} 
          color={params.value ? "success" : "error"}
          sx={{ color: "#FFF", fontWeight: "bold" }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" onClick={() => handleEmp({ action: "edit", employee: params.row })}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row._id)}>
            <DeleteIcon sx={{ color: "#F44336" }} />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" disableGutters>
      <Typography variant="h3" textAlign="center" sx={{ mt: 1, mb: 3 }}>
        Employee Management
      </Typography>

      <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="Table View" />
        <Tab label="Card View" />
      </Tabs>

      {tabIndex === 0 && (
        <Paper sx={{ padding: 2, borderRadius: 2, mt: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => handleEmp({ action: "add" })}
            >
              Add Employee
            </Button>
          </Box>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row._id} 
            pageSizeOptions={[5, 10]}
            disableColumnMenu
            autoHeight
            sx={{
              "& .MuiDataGrid-cell": {
                display: "flex",
                alignItems: "center",
              },
              "& .MuiDataGrid-columnHeaders": { backgroundColor: "#333", color: "#000", fontWeight: "bold" },
              "& .MuiDataGrid-row:hover": { backgroundColor: "#f5f5f5" },
            }}
          />
        </Paper>
      )}

      {tabIndex === 1 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 3 }}>
          {rows.map((emp) => (
            <Card key={emp._id} sx={{ width: 250, padding: 2 }}>
              <CardContent>
                <Avatar src={emp.avatar} sx={{ width: 50, height: 50, mb: 2 }} />
                <Typography variant="h6">{emp.name}</Typography>
                <Typography variant="body2" color="textSecondary">Title: {emp.title}</Typography>
                <Typography variant="body2" color="textSecondary">Email: {emp.email}</Typography>
                <Typography variant="body2" color="textSecondary">
                              Salary: {formatCurrency(emp.salary)}
                </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{mb:2}}>Birthday: {emp.birthday}</Typography>
                <Chip
                  label={emp.status ? "Active" : "Inactive"}
                  color={emp.status ? "success" : "error"}
                />
              </CardContent>
              <CardActions>
                <IconButton color="primary" onClick={() => handleEmp({ action: "edit", employee: emp })}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(emp._id)}>
                  <DeleteIcon sx={{ color: "#F44336" }} />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      <EmpDialog
        open={openDialog}
        setOpen={setOpenDialog}
        emp={employee}
        setemp={setEmp}
        action={action}
        rows={rows}
        setRows={setRows}
        handleSave={handleSave}
        setAlert={setAlert}
        setOpenAlert={setOpenAlert}
      />
      <Alerts open={openAlert} setOpen={setOpenAlert} alert={alert} setAlert={setAlert} />
    </Container>
  );
}
