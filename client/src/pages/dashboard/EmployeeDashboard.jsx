import React from 'react';
import { Link } from 'react-router-dom';

export default function EmployeeDashboard() {
  const user = JSON.parse(localStorage.getItem('user')); // assuming login stores user info in localStorage

  const handleAssignPayroll = async (employeeId, payrollStructureId) => {
    if (!payrollStructureId) return; // Prevent sending empty/invalid value
    setLoading(true);
    try {
      await api.put('/payroll/assign', { employeeId, payrollStructureId });
      fetchEmployees();
    } catch (err) {
      alert('Failed to assign payroll structure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome, {user?.name || 'Employee'} 👋
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Your Info</h2>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Company:</strong> {user?.company}</p>
            <p><strong>Department:</strong> {user?.department}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>Joining Date:</strong> {new Date(user?.joiningDate).toLocaleDateString()}</p>
          </div>

          {/* Attendance Box */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Attendance</h2>
            <p><strong>Status:</strong> ✅ Clocked In</p>
            <p><strong>Today:</strong> 9:00 AM - 6:00 PM</p>
            <Link
              to="/employee/attendance"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              View Attendance
            </Link>
          </div>

          {/* Actions Box */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/employee/profile" className="text-blue-600 hover:underline">
                  View/Edit Profile
                </Link>
              </li>
              <li>
                <Link to="/employee/attendance" className="text-blue-600 hover:underline">
                  Mark Attendance
                </Link>
              </li>
              <li>
                <Link to="/dashboard/employee/payroll" className="text-blue-600 hover:underline">
                  View Payroll
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
