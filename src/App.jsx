import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import CSS for the 'app' and 'card' styling
import "./App.css"; 

// Page Imports
import PublicNavbar from './components/layout/PublicNavbar';
import DashboardLayout from './components/layout/DashboardLayout';

import LandingPage from "./pages/LandingPage";
import BrowsePage from "./pages/BrowsePage";
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import UserDashboard from './pages/UserDashboard';
import SavedHomesPage from './pages/SavedHomesPage';
import AgentPayment from './pages/AgentPayment';
import AiChatPage from './pages/AiChatPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';

import ReportListing from './components/layout/ReportListing';
import AnalyticsPage from './pages/AnalyticsPage';

import RoleGate from './components/auth/RoleGate';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          
          {/* ==================== 1. PUBLIC ROUTES ==================== */}
          <Route element={<><PublicNavbar /><LandingPage /></>} path="/" />
          <Route element={<><PublicNavbar /><BrowsePage /></>} path="/browse" />
          <Route element={<><PublicNavbar /><PropertyDetailsPage /></>} path="/property/:id" />

          <Route element={<><PublicNavbar /><LoginPage /></>} path="/login" />
          <Route element={<><PublicNavbar /><RegisterPage /></>} path="/register" />

          {/* ==================== 2. PROTECTED DASHBOARDS ==================== */}
          <Route element={<DashboardLayout />}>
            
            {/* AI Chat accessible to logged-in users */}
            <Route path="/ai-chat" element={<AiChatPage />} />

            {/* ADMIN ROUTES */}
            <Route element={<RoleGate allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              {/* 2. ADD THE ANALYTICS ROUTE HERE */}
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
            </Route>

            {/* AGENT ROUTES */}
            <Route element={<RoleGate allowedRoles={['agent']} />}>
              <Route path="/agent" element={<AgentDashboard />} />
              <Route path="/agent/payment" element={<AgentPayment />} />
            </Route>

            {/* USER ROUTES */}
            <Route element={<RoleGate allowedRoles={['user']} />}>
              <Route path="/user" element={<UserDashboard />} />
              <Route path="/user/saved" element={<SavedHomesPage />} />
            </Route>

          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;