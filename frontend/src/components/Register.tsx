
import { useState } from "react";
import { Container, TextField, Button, Typography, Box, Switch, FormControlLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Register component
export default function Register() {
  const [username, setUsername] = useState(""); // State to store username from form
  const [email, setEmail] = useState("");       // State to store email from form
  const [password, setPassword] = useState(""); // State to store password from form
  const [isAdmin, setIsAdmin] = useState(false);// State to store is administrator toggle status from form
  const [error, setError] = useState("");       // State to store error of fetch
  const navigate = useNavigate();               // Initialize navigation

  // Called when toggle is clicked in the form. Will set the isAdmin state.
  const handleAdminChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsAdmin(event.target.checked);
  };

  // Called when register button is clicked in the form.
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form sending.
    
    // Clear error state
    setError("");

    // Form data
    const formData = {
      username: username,
      email: email,
      password: password,
      isAdmin: isAdmin
    }

    try {
       // Call backend register endpoint with form data.
      const response = await fetch("/api/users/register",  {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        // Backend responded with error. Maybe email was already reserved.
        setError("Error when trying to register. Please try again.");
      } 
      else {
        // User was successfully registered as user so redirect to "/login" page, so user can login with credentials.
        navigate("/login");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error while trying to login: ${error.message}`);
      }
      else {
        console.log("An unknown error occurred.");
      }
    }
  };

  // Register form for the new user. Base of the code copied from the Material UI page.
  // Contains Username, Email and Password text boxes and all of them are required and values are stored into states.
  // Contains also Is Admin toggle and Register buttons.
  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h5">Register</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleRegister}>
        <TextField
            fullWidth
            margin="normal"
            label="Username"
            type="username"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />
          <FormControlLabel control={<Switch checked={isAdmin} onChange={handleAdminChange} />} label="Is admin" />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Register
          </Button>
        </form>
      </Box>
    </Container>
  );
}
