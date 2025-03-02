import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  isAuthenticated: boolean;
  checkAuth: () => void;
}

// Header component function
export default function Header({isAuthenticated, checkAuth}: HeaderProps) {
  const navigate = useNavigate(); // Initialise navigation

  // Function called when logout is clicked from Header.
  const handleLogout = async () => {
    try {
      // Call backend logout end point to logout user.
      const response = await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        console.log("Logged out successfully");
        checkAuth();    // Call checkAuth() from App component
        navigate("/");  // Navigate to main page.
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Use AppBar component from Material UI.
  // If user is logged in then show Logout button and otherwise show Login and Register buttons.
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Task Board
        </Typography>

        {isAuthenticated ? (
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        ) : (
          <>
            <Button color="inherit" onClick={() => navigate("/register")}>Register</Button>
            <Button color="inherit" onClick={() => navigate("/login")}>Login</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}


