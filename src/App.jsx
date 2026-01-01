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
import ProductDetailsPage from "./pages/productsPage/ProductDetailsPage";
import AdminMemoOrdersPage from "./pages/memo/AdminMemoOrderPage";
import UserMemo from "./pages/memo/UserMemo";
import HeroSection from "./ViewComponents/HeroSection";
import ContactUs from "./ViewComponents/ContactUs";
import AboutUs from "./ViewComponents/AboutUs";

// Protected Route Component (Keep this)
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // FIXED: Add replace
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/products" replace />;
  }

  return children;
};

function App() {
  const { isAdmin, isAuthenticated } = useAuth();

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
            // <ProtectedRoute>
              <ProductsPage
                adminOnlyy={isAdmin()}
                isAuthenticated={isAuthenticated}
              />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/products/:productId"
          element={
            // <ProtectedRoute>
              <ProductDetailsPage
                isAdmin={isAdmin()}
                isAuthenticated={isAuthenticated}
              />
            // </ProtectedRoute>
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
        <Route
          path="/"
          element={
            <>
              {" "}
              <HeroSection />
              <AboutUs />
              <ContactUs />
            </>
          }
        />
        {isAuthenticated && <Route path="/userMemo" element={<UserMemo />} />}
      </Routes>
    </div>
  );
}

export default App;
