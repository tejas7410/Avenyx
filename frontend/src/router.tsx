// ************* Managing Route Organization Here *************

import { Route, Routes, Navigate } from "react-router-dom";
import {
  SellerRoute,
  BuyerRoute,
  ProtectedRoute,
  AdminRoute,
} from "./contexts/AuthContext";
import Product from "./components/Product/main";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import { Profile } from "./pages/Profile";
import { Orders } from "./pages/Orders";
import { Invoices } from "./pages/Invoices";
import { AdminDashboard } from "./pages/AdminDashboard";

const RouterComponent = () => {
  return (
    <Routes>
      <Route path="/" element={<Product />} />

      <Route
        path="/add-product"
        element={
          <SellerRoute>
            <AddProduct />
          </SellerRoute>
        }
      />
      <Route
        path="/edit-product"
        element={
          <SellerRoute>
            <EditProduct />
          </SellerRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <BuyerRoute>
            <Orders />
          </BuyerRoute>
        }
      />

      <Route
        path="/invoices"
        element={
          <BuyerRoute>
            <Invoices />
          </BuyerRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default RouterComponent;
