import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Market from "../pages/Market";
import StockDetails from "../pages/StockDetails";
import Portfolio from "../pages/Portfolio";
import Settings from "../pages/Settings";
import ExpensePage from "../pages/ExpensePage";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/market" element={
          <ProtectedRoute><Market /></ProtectedRoute>
        } />

        <Route path="/stock/:symbol" element={
          <ProtectedRoute><StockDetails /></ProtectedRoute>
        } />

        <Route path="/portfolio" element={
          <ProtectedRoute><Portfolio /></ProtectedRoute>
        } />

        {/* Expenses */}
        <Route path="/expenses" element={
          <ProtectedRoute><ExpensePage /></ProtectedRoute>
        } />

        {/* Settings — now a real page instead of a placeholder */}
        <Route path="/settings" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}