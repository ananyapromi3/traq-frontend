// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Chat from "./pages/Chat";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/chat" element={<Chat />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";

// Protected route component to handle authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // console.log("isAuthenticated", isAuthenticated);

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" />;
  // }

  // const { isAuthenticated, logout } = useAuth();
  // const navigate = useNavigate();

  // React.useEffect(() => {
  //   if (!isAuthenticated) {
  //     logout(); // Log out if user is not authenticated
  //     navigate("/login");
  //   }
  // }, [isAuthenticated, logout, navigate]);

  // if (!isAuthenticated) {
  //   return null; // Avoid rendering the component while redirecting
  //   // return <Navigate to="/login" />;
  // }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* <header className="App-header">
            <h1>Cookie Authentication Example</h1>
          </header> */}
          <main>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
