
// Imports.
import { Snackbar, Alert } from "@mui/material";

// Alert component.
export default function Alerts({ open, setOpen, alert }) {

  // Close dialog.
  const handleClose = () => {
    setOpen(false);
  };

  // Component.
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}

      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={handleClose} severity={alert.severity} variant="filled">
        {alert.message}
      </Alert>
    </Snackbar>
  );

}
