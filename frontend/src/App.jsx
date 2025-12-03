// src/App.jsx
import { useState } from "react";

import "./App.css";
/* other component CSS imports … */
import "./fullwidth.css"; // ← import LAST so overrides win

import LoginForm from "./components/LoginForm";
import InventoryForm from "./components/InventoryForm";
import AdminDashboard from "./components/AdminDashboard";
import WarehouseLogPage from "./components/admin/WarehouseLogPage";
import DryDeliveryPage from "./components/admin/DryDeliveryPage";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "user");

  // which admin screen: "dashboard" | "warehouse" | "dry"
  const [adminView, setAdminView] = useState("dashboard");

  const handleLoginSuccess = (newToken, newUsername, newRole) => {
    const finalRole =
      (newRole && newRole.toLowerCase && newRole.toLowerCase()) || "user";

    setToken(newToken);
    setUsername(newUsername);
    setRole(finalRole);
    setAdminView("dashboard");

    localStorage.setItem("token", newToken);
    localStorage.setItem("username", newUsername);
    localStorage.setItem("role", finalRole);
  };

  const handleLogout = () => {
    setToken("");
    setUsername("");
    setRole("user");
    setAdminView("dashboard");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
  };

  const isAdmin = role.toLowerCase() === "admin";

  let content;
  if (!token) {
    // Not logged in → show login page
    content = <LoginForm onLoginSuccess={handleLoginSuccess} />;
  } else if (isAdmin) {
    // ADMIN FLOW
    if (adminView === "dashboard") {
      content = (
        <AdminDashboard
          token={token}
          username={username}
          onLogout={handleLogout}
          onGoWarehouseLog={() => setAdminView("warehouse")}
          onGoDryDelivery={() => setAdminView("dry")}
        />
      );
    } else if (adminView === "warehouse") {
      content = (
        <WarehouseLogPage
          token={token}
          username={username}
          onLogout={handleLogout}
          onBack={() => setAdminView("dashboard")}
        />
      );
    } else if (adminView === "dry") {
      content = (
        <DryDeliveryPage
          token={token}
          username={username}
          onLogout={handleLogout}
          onBack={() => setAdminView("dashboard")}
        />
      );
    }
  } else {
    // NORMAL USER FLOW
    content = (
      <InventoryForm
        token={token}
        username={username}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <h1 className="app-title">TFL Warehouse Management System</h1>
      </header>
      <main className="app-main">{content}</main>
      <footer className="app-footer ">
       <center><a href="https://abedshadin.netlify.app">Developed By: Abed Hossain Shadin</a></center>
      </footer>
    </div>
  );
}

export default App;