// App.jsx (Corrected)
import { Routes, Route, Navigate } from "react-router-dom";
// NOTE: Remove 'import { BrowserRouter as Router, ... }'
// NOTE: Remove 'import AuthProvider from "./context/AuthProvider";'

import useAuth from "./context/useAuth";
import Navigation from "./components/Navigation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import User from "./pages/userCrud/User";

import "./App.css";
import ProductsPage from "./pages/productsPage/ProductsPage";
import AdminMemoOrdersPage from "./pages/memo/AdminMemoOrderPage";
import UserMemo from "./pages/memo/UserMemo";

// Protected Route Component (Keep this)
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }

  // if (!user) {
  //   return <Navigate to="/login" />;
  // }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/products" />;
  }

  return children;
};

function App() {
  const { isAdmin, isAuthenticated } = useAuth();
  console.log(isAdmin());
  
  return (
    <div>
      {" "}
      <Navigation />
      <Routes>
        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsPage adminOnlyy={isAdmin()} isAuthenticated={isAuthenticated}/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute adminOnly>
              <User />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminOrders"
          element={
            <ProtectedRoute adminOnly>
              <AdminMemoOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/products" />} />
       {isAuthenticated && <Route path="/userMemo" element={<UserMemo />} />}
      </Routes>
    </div>
  );
}

export default App;
