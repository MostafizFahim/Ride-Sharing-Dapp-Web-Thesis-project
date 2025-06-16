import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light", // "dark" also possible
    primary: {
      main: "#000000", // Uber black
    },
    secondary: {
      main: "#F6C700", // Uber yellow accent
    },
    background: {
      default: "#f8f9fa", // Light background
      paper: "#ffffff",
    },
    text: {
      primary: "#000000",
      secondary: "#555555",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: "0.5px",
    },
    button: {
      textTransform: "none", // Uber style → no uppercase buttons
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px", // Rounded buttons
          padding: "10px 20px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: "16px",
        },
      },
    },
  },
});

export default theme;
