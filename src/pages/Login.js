import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";
import slackLogo from "../assets/Slack_icon_2019.svg.png"; // Ensure you have a Slack-style logo

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted!");
    setError("");

    try {
      const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;
      console.log("Frontend URL:", FRONTEND_URL);
      console.log("Trying to log in...");
      const response = await axios.post(
        `https://traq.duckdns.org/api/v3/login?redirect=${encodeURIComponent(
          FRONTEND_URL
        )}`,
        {
          name: username,
          password: password,
        }
      );
      console.log("Response:", response);
      const token = response.data.access_token; // Extract the token
      localStorage.setItem("token", token); // Save token for later API calls
      console.log("Token:", token);

      if (response.status === 200) {
        localStorage.setItem("token", response.data.access_token);
        navigate("/dashboard"); // Redirect to chat page
        console.log("Logged in successfully");
      } else {
        console.log("Error logging in");
        console.log(response);
        setError("Invalid username or password");
      }
    } catch (err) {
      console.error("Error logging in", err);
      setError("Invalid username or password");
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-box">
        <img src={slackLogo} alt="Slack Logo" className="logo" />
        <h2>Sign in to Your Workspace</h2>
        <p className="subtext">Enter your credentials below</p>
        {error && <p className="error">{error}</p>}
        {/* <form onSubmit={handleSubmit}> */}
        <form
          onSubmit={(e) => {
            // console.log("Form submission event triggered!");
            handleSubmit(e);
          }}
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Sign In</button>
        </form>
        <p className="footer-text">
          New to Slack? <a href="/signup">Create an account</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
