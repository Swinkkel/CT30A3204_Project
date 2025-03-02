import './App.css'
import * as React from 'react'
import Header from './components/Header'
import Board from './components/Board'
import Login from './components/Login'
import Register from './components/Register'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// App component
function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [boardId, setBoardId] = React.useState<string | null>(null);

  // Function to fetch boards. End point returns boards that are available for the current user.
  const fetchBoards = async () => {
    console.log("Fetching boards")
    try {
      const res = await fetch("/api/boards", { credentials: "include" });
      const data = await res.json();
      if (data.length > 0) {
        setBoardId(data[0]._id); // Set first board ID
      }
    } catch (error) {
      console.error("Fetching boards failed", error);
    }
  };

  // Function to check if user is logged in. 
  const checkAuth = async () => {
    console.log("App checkAuth called.");
    try {
      const res = await fetch("/api/authme", {credentials: "include"});
      const data = await res.json();
      setIsAuthenticated(data.isLoggedIn);

      if (data.isLoggedIn) {
        fetchBoards();
      }
      else {
        setBoardId(null);
      }
    } catch (error) {
      console.error("Auth check failed", error);
    }
  };

  React.useEffect(() => {
    console.log("App useEffect triggered.");
    checkAuth(); // Run on app load
  }, );
 
  /*
    Always show Header component where state of authentication and callback for checkAuth function are passed as props.
    Show Board component when at the root of site.
    Show Login component when at "/login" url. checkAuth passed as props.
    Show Register component when at "/register" url.
  */
  return (
    <BrowserRouter>
      <Header isAuthenticated={isAuthenticated} checkAuth={checkAuth}/>
      <Routes>
          <Route path="/" element={<Board boardId={boardId!} />} /> 
          <Route path="/login" element={<Login checkAuth={checkAuth} />} />
          <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;