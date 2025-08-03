// ************* Managing Route Organization Here *************

import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from "../src/contexts/AuthContext"
import Product from "./components/Product/main";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import { Profile } from './pages/Profile';
import { Orders } from './pages/Orders';
import { Invoices } from './pages/Invoices';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const RouterComponent = () => {
  return (
    <Routes>
     
      <Route path="/" element={<Product />} />
      
      <Route
        path="/add-product"
        element={
          <ProtectedRoute>
            <AddProduct/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-product"
        element={
          <ProtectedRoute>
            <EditProduct />
          </ProtectedRoute>
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
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />

<Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <Invoices />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default RouterComponent;