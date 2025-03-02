import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  checkAuth: () => void;
}

// Login component
export default function Login({ checkAuth }: LoginProps) {
  const [email, setEmail] = useState("");         // State to store email from form
  const [password, setPassword] = useState("");   // State to store password from the form
  const [error, setError] = useState("");         // State to store possible error from fetch
  const navigate = useNavigate();                 // Initialise navigation

  // Function called when login button clicked in form.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    setError(""); // Clear error message

    try {
      // Call backend login end point with email and password.
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Backend responded with error
        throw new Error("Login failed");
      }

      // If login successful, update auth state
      checkAuth();
      navigate("/"); // Redirect to home

    } catch (err) {
      setError("Invalid credentials");
      console.error(err);
    }
  };

  // Show login form. Email and Password fields and Login button.
  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
