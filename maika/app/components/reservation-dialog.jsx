import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Paper,
    Box,
    Container,
    useTheme,
    Typography,
    useMediaQuery,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    MenuItem,
    Menu,
  } from "@mui/material";
  import * as React from "react";
  import dayjs from "dayjs";
  import Grid from "@mui/material/Grid2";
  
  import { useState, useEffect } from "react";
  import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
  import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
  import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";

  {/*Importing Material-UI Icons*/}
  import AccountCircleIcon from "@mui/icons-material/AccountCircle";
  import BadgeIcon from "@mui/icons-material/Badge";
  import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
  import MailIcon from "@mui/icons-material/Mail";
  import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
  import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
  import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
  import axios from "axios";
  import { RESERVATIONS_API } from "../constants/reservations/constants";

  export default function ReservationDialog({
    open,
    setOpen,
    reservation,
    setReservation,
    action,
    rows,
    setRows,
    setAlert,
    setOpenAlert,
  }) {

    {/*Theme*/}
    const theme = useTheme();

    {/*Function to close the dialog*/}
    const handleCloseDialog = () => {
      setEmailError(false);
      setPhoneError(false);
      setPeopleError(false);
      setOpen(false);
    };
  
    {/*Function to save the reservation*/}
    const saveReservation = async () => {

      const emailNoValid = validateFields(reservation.email, 'Email');
      const phoneNoValid = validateFields(reservation.phone, 'Phone');
      const peopleNoValid = validateFields(reservation.people, 'People')
      if (emailNoValid || phoneNoValid || peopleNoValid){
        setAlert({
          message: "Please fill the data correctly",
          severity: "warning"
        });       
        setOpenAlert(true);
        return;
      }
      const combinedDateTime = dayjs(reservation.date).set('hour', time.hour()).set('minute', time.minute());
      const reservationWithDateOnly = {
         ...reservation,
         date: combinedDateTime.format("DD MMM YYYY HH:mm"),
      };
   
      if (action === "add") {
        try{
          const response = await axios.post(RESERVATIONS_API, reservationWithDateOnly)
          setRows([...rows, response.data])
          setAlert({
            message: "Reservation added successfully",
            severity: "success"
          });
        }catch(error){
          console.error("Error adding reservation:", error)
          setAlert({
            message: "Failed to add reservation",
            severity: "error"
          });
        }
        setOpenAlert(true);
      } else if (action === "edit") {
        try{
          console.log(`${RESERVATIONS_API}/${reservationWithDateOnly._id}`);

          const response = await axios.put(`${RESERVATIONS_API}/${reservationWithDateOnly._id}`, reservationWithDateOnly);
          console.log(`${RESERVATIONS_API}/${reservationWithDateOnly._id}`);
          setRows(rows.map((row) => (row._id === reservationWithDateOnly._id ? response.data : row)))
          setAlert({
            message: "Reservation updated successfully",
            severity: "success"
          });
        }catch(error){
          console.error("Error updated reservation:", error)
          setAlert({
            message: "Failed to update reservation",
            severity: "error"
          });
        }
        setOpenAlert(true);
      }
      handleCloseDialog();
   };
  
   {/*Function to handle changes in text fields*/}
    const handleChange = (event) => {
      setReservation({
        ...reservation,
        [event.target.name]: event.target.value,
      });
    };

    {/*Minimum date for date picker*/}
    const minDate = dayjs();
  
    const [phoneError, setPhoneError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [peopleError, setPeopleError] = useState(false);
  
    const validatePhone = (value) => /^\d{10}$/.test(value);
    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  
    const handleBlur = (e, label) => {
      validateFields(e.target.value, label);
    };


    {/*Function to validate fields*/}
    const validateFields = (value, label) => {
      let isValid = false;
      if (label === "Phone") {
        isValid = validatePhone(value);
        setPhoneError(!isValid);
        if (!isValid) {
          setAlert({ message: "Invalid phone number", severity: "error" });
          setOpenAlert(true);
          console.warn("Invalid phone number entered")
        }
      } else if (label === "Email") {
        isValid = validateEmail(value);
        setEmailError(!isValid);
        if (!isValid) {
          setAlert({ message: "Invalid email", severity: "error" });
          setOpenAlert(true);
          console.warn("Invalid email entered")
        }
      } else if (label === "People") {
        isValid = value && value > 0;
        setPeopleError(!isValid);
        if (!isValid) {
          setAlert({ message: "Invalid people", severity: "error" });
          setOpenAlert(true);
          console.warn("Invalid people entered")
        }
      }
      return !isValid;
    }
  
    const [time, setTime] = useState(dayjs().set("hour", 8).set("minute", 0));  

    {/*Function to be able to change the hours with a limit of 8 am to 11 pm*/}
    const changeHours = (amount) => {
      let newHour = time.hour() + amount;
    
      if (newHour < 8) {
        newHour = 23;
      } else if (newHour > 23) {
        newHour = 8;
      }
    
      setTime(time.set("hour", newHour));
    };
  
    {/*Function to change the minutes from 15 to 15*/}
    const changeMinutes = (amount) => {
      let newMinute = time.minute() + amount * 15;
    
      if (newMinute >= 60) {
        newMinute = 0;
        changeHours(1);  
      } else if (newMinute < 0) {
        newMinute = 45;
        changeHours(-1);  
      }
  
    setTime(time.set("minute", newMinute));
  };


  {/*Experience options for booking*/}
  const options = [
    'Maika',
    'Romantic',
    'Premium',
    'International menu',
    'Anniversary',
    'Special event',
  ];

  {/*State for the options menu*/}
  const [anchorEl, setAnchorEl] = React.useState(null);

  {/*Index of selected option*/}
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  {/*Boolean to handle opening the menu*/}
  const openReserv = Boolean(anchorEl);

  {/*Function to handle click on list item */}
  const handleClickListItem = (event) => {
    setAnchorEl(event.currentTarget);
  };

  {/*Function to handle click on menu item */}
  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setReservation({ ...reservation, t_reservation: options[index] });
    setAnchorEl(null);
  };
  
  {/*Function to close the menu*/}
  const handleClose = () => {
    setAnchorEl(null);
  };

  {/*Function to manage time change*/}
  const handleDateChange = (newDate) => {
    if (newDate && newDate.isValid()) {
      setReservation({ ...reservation, date: newDate });
    }
  };
  
  {/*Function to not change the reservation time */}
  useEffect(() => {
    if (open && reservation.date) {
      const dateTime = dayjs(reservation.date, "DD MMM YYYY HH:mm");
      setTime(dateTime);
    }
  }, [open, reservation.date]);
  
    

    return (
      <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{action === "add" ? "Add Reservation" : "Edit Reservation"}</DialogTitle>
        
        {/*Reservation information*/}
        <DialogContent>

          {/*Choose date and time*/}
          <Container>
            <Typography variant="h4" color={theme.palette.primary.main} gutterBottom>
              Date & Time
            </Typography>
            <Typography variant="body1" color={theme.palette.text.secondary} mb={4}>
              Select date and time
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <StaticDatePicker
                      minDate={minDate}
                      disableOpenPicker
                      displayStaticWrapperAs="desktop"
                      sx={{ width: "100%" }}
                      onChange={handleDateChange}
                    />
                  </LocalizationProvider>
                </Paper>
              </Grid>
              <Grid  xs={12} md={6}>
                <Paper
                    elevation={2}
                    sx={{
                    p: 3,
                    borderRadius: 3,
                    textAlign: "center",
                    }}
                >
                    <Grid container spacing={2} alignItems="center" justifyContent="center">

                    <Grid >
                        <IconButton onClick={() => changeHours(1)}>
                        <ArrowUpwardIcon />
                        </IconButton>
                        <Typography variant="h3">{time.format("HH")}</Typography>
                        <IconButton onClick={() => changeHours(-1)}>
                        <ArrowDownwardIcon />
                        </IconButton>
                    </Grid>

                    <Grid >
                        <Typography variant="h3">:</Typography>
                    </Grid>

                    <Grid >
                        <IconButton onClick={() => changeMinutes(1)}>
                        <ArrowUpwardIcon />
                        </IconButton>
                        <Typography variant="h3">{time.format("mm")}</Typography>
                        <IconButton onClick={() => changeMinutes(-1)}>
                        <ArrowDownwardIcon />
                        </IconButton>
                    </Grid>
                    <Grid >
                        <Typography variant="h3">hrs</Typography>
                    </Grid>
                    </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Container>
  
          {/*Personalize the experience*/}
          <Container sx={{ mt: 4 }}>
            <Typography variant="h4" color={theme.palette.primary.main} gutterBottom>
              Customize your reservation
            </Typography>
            <Typography variant="body1" color={theme.palette.text.secondary} mb={4}>
              To enjoy an unforgettable experience, personalize your experience
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid  size={{ xs:12, md:6}}>
                <List component="nav" aria-label="Device settings" sx={{ bgcolor: theme.palette.background.date }}>
                  <ListItemButton
                    id="lock-button"
                    aria-haspopup="listbox"
                    aria-controls="lock-menu"
                    aria-label="Experience"
                    aria-expanded={openReserv ? 'true' : undefined}
                    onClick={handleClickListItem}
                  >
                    <ListItemText primary="Experience" secondary={options[selectedIndex]} />
                  </ListItemButton>
                </List>
                <Menu
                  id="lock-menu"
                  anchorEl={anchorEl}
                  open={openReserv}
                  onClose={handleClose}
                  MenuListProps={{
                    'aria-labelledby': 'lock-button',
                    role: 'listbox',
                  }}
                >
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      disabled={index === 0}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Menu>
              </Grid>

              <Grid size={{ xs:12, md:6}}>
                <TextField
                  label="Number of People"
                  variant="filled"
                  fullWidth
                  name="people"
                  value={reservation.people}
                  onChange={handleChange}
                  onBlur={(e) => handleBlur(e, 'People')} 
                  error={peopleError} 
                  helperText={peopleError ? "Invalid people number" : ""}
                  color="primary"
                  sx={{
                    width: '100%',
                  }}
                />
              </Grid>
            </Grid>
          </Container>

          {/*Contact information*/}
          <Container sx= {{mt:4}}>

          <Typography variant="h4" color={theme.palette.primary.main} gutterBottom>
              Contact Information
            </Typography>
            <Typography variant="body1" color={theme.palette.text.secondary} mb={4}>
              Please let us your contact information
            </Typography>

            <Grid
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              sx={{ width: '100%'}}
            >

          
                <Grid container
                    sx={{ width: '100%', mb: 4, alignItems: "center"}}
                >
                  <Grid size={{ xs: 12, md: 1 }}>
                    <AccountCircleIcon />
                  </Grid>
                  <Grid size={{ xs: 12, md: 11 }}>
                      <TextField
                          label="First Name"
                          variant="filled"
                          color="primary"
                          fullWidth
                          name="name"
                          value={reservation.name}
                          onChange={handleChange}
                          sx={{
                          width: '100%',
                          border: "none",
                        }}
                      />
                  </Grid>
                </Grid>
                <Grid container
                    sx={{ width: '100%', mb: 4, alignItems: "center"}}
                >
                  <Grid size={{ xs: 12, md: 1 }}>
                    <BadgeIcon />
                  </Grid>
                  <Grid size={{ xs: 12, md: 11 }}>
                      <TextField
                          label="Last Name"
                          variant="filled"
                          color="primary"
                          fullWidth
                          name="last_name"
                          value={reservation.last_name}
                          onChange={handleChange}
                          sx={{
                          width: '100%',
                          border: "none",
                        }}
                      />
                  </Grid>
                </Grid>   
                <Grid container
                    sx={{ width: '100%', mb: 4, alignItems: "center"}}
                >
                  <Grid size={{ xs: 12, md: 1 }}>
                    <LocalPhoneIcon />
                  </Grid>
                  <Grid size={{ xs: 12, md: 11 }}>
                    <TextField
                      label="Phone"
                      variant="filled"
                      color="primary"
                      fullWidth
                      name="phone"
                      value={reservation.phone}
                      onChange={handleChange}
                      onBlur={(e) => handleBlur(e, 'Phone')} 
                      error={phoneError} 
                      helperText={phoneError ? "Invalid phone number" : ""} 
                      sx={{
                        width: '100%',
                        border: "none",
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid container
                    sx={{ width: '100%', mb: 4, alignItems: "center"}}
                >
                  <Grid size={{ xs: 12, md: 1 }}>
                    <MailIcon/>
                  </Grid>
                  <Grid size={{ xs: 12, md: 11 }}>
                    <TextField
                      label="Email"
                      variant="filled"
                      color="primary"
                      fullWidth
                      name="email"
                      value={reservation.email}
                      onChange={(e) => handleChange(e)}
                      onBlur={(e) => handleBlur(e, 'Email')} 
                      error={emailError} 
                      helperText={emailError ? "Invalid email" : ""} 
                      sx={{
                        width: '100%',
                        border: "none",
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid container
                    sx={{ width: '100%', mb: 4, alignItems: "center"}}
                >
                  <Grid size={{ xs: 12, md: 1 }}>
                    <DriveFileRenameOutlineIcon/>
                  </Grid>
                  <Grid size={{ xs: 12, md: 11 }}>
                      <TextField
                          label="Special Note"
                          variant="filled"
                          color="primary"
                          fullWidth
                          name="special"
                          value={reservation.special}
                          onChange={handleChange}
                          sx={{
                          width: '100%',
                          border: "none",
                        }}
                      />
                  </Grid>
                </Grid>
          </Grid>
 


          </Container>

        </DialogContent>

        {/*Exit buttons*/}
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={saveReservation} color="primary" variant="contained" >
            {action === "add" ? "Add" : "Edit"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  