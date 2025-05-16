"use client"; 

import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#731225"
    },
    secondary: {
      main: "#C0A35E",
    },
    background: {
      default: "#fefdff",
      date: "#f1f1f1",
    },
    text: {
      primary: "#000000",
      secondary: "#AEAEAE",
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
    h1: {
      fontWeight: 400,
      color: "#333333",
    },
  },
});
