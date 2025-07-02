import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Welcome from './pages/Welcome';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';

import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';
import ProfilePage from './pages/employee/ProfilePage';
import AttendancePage from './pages/employee/AttendancePage';

import AdminDashboard from './pages/dashboard/AdminDashboard';
import ManageEmployees from './pages/dashboard/ManageEmployees';
import AttendanceReport from './pages/dashboard/AttendanceReport';
import ManagePayrollStructures from './pages/dashboard/ManagePayrollStructures';
import PayrollPage from './pages/employee/PayrollPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



function App() {
  return (
    <>
    <ToastContainer position="bottom-right" />
      <Navbar />
     
      <Routes>
        {/* Public */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Employee Protected Routes */}
        <Route
          path="/dashboard/employee"
          element={
            <ProtectedRoute role="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/profile"
          element={
            <ProtectedRoute role="employee">
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/attendance"
          element={
            <ProtectedRoute role="employee">
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/employee/payroll"
          element={
            <ProtectedRoute role="employee">
              <PayrollPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/employees"
          element={
            <ProtectedRoute role="admin">
              <ManageEmployees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/attendance-report"
          element={
            <ProtectedRoute role="admin">
              <AttendanceReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/payroll-structures"
          element={
            <ProtectedRoute role="admin">
              <ManagePayrollStructures />
            </ProtectedRoute>
          }
        />

        
      </Routes>
    </>
  );
}

export default App;
