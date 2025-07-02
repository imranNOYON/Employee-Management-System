
import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/dashboard/admin/employees"
          className="bg-white shadow rounded-lg p-6 hover:bg-blue-50"
        >
          <h2 className="text-xl font-semibold mb-2">Manage Employees</h2>
          <p className="text-gray-600">Add, edit or remove employee profiles</p>
        </Link>

        <Link
          to="/dashboard/admin/payroll-structures"
          className="bg-white shadow rounded-lg p-6 hover:bg-blue-50"
        >
          <h2 className="text-xl font-semibold mb-2">Payroll Structures</h2>
          <p className="text-gray-600">Configure payroll heads & formulas</p>
        </Link>

        <Link
          to="/dashboard/admin/attendance-report"
          className="bg-white shadow rounded-lg p-6 hover:bg-blue-50"
        >
          <h2 className="text-xl font-semibold mb-2">Attendance Reports</h2>
          <p className="text-gray-600">View clock‑in/out summaries</p>
        </Link>
      </div>
    </div>
  );
}
