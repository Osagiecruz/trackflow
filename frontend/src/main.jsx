import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './styles/globals.css';

import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ShipmentsPage from './pages/ShipmentsPage';
import ShipmentDetailPage from './pages/ShipmentDetailPage';
import CreateShipmentPage from './pages/CreateShipmentPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ClientLoginPage from './pages/ClientLoginPage';
import ClientTrackingPage from './pages/ClientTrackingPage';
import AgencyRequestPage from './pages/AgencyRequestPage';
import AdminPage from './pages/AdminPage';
import { AboutPage, ContactPage, ServicesPage, ReviewsPage, FAQPage } from './pages/PublicPages';

function PrivateRoute({ children }) {
  const { agency, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return agency ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1E2022',
              color: '#F2EFE8',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              fontFamily: 'Syne, sans-serif',
            },
          }}
        />
        <Routes>
          {/* Public marketing pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/faq" element={<FAQPage />} />

          {/* Agency auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/agency/apply" element={<AgencyRequestPage />} />

          {/* Client portal */}
          <Route path="/client/login" element={<ClientLoginPage />} />
          <Route path="/client/tracking" element={<ClientTrackingPage />} />

          {/* Agency dashboard (protected) */}
          <Route path="/dashboard" element={
            <PrivateRoute><Layout /></PrivateRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="shipments" element={<ShipmentsPage />} />
            <Route path="shipments/new" element={<CreateShipmentPage />} />
            <Route path="shipments/:id" element={<ShipmentDetailPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
