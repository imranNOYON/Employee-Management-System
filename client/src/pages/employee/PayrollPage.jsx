import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function PayrollPage() {
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    setLoading(true);
    api.get('/payroll/employee')
      .then(res => {
        setPayroll(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('No payroll data found or not assigned.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">Payroll</h2>
        {loading ? (
          <p>Loading payroll details...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : payroll ? (
          <>
            <h3 className="text-lg font-semibold mb-2">Payroll Structure: {payroll.payrollStructure.name}</h3>
            <p className="mb-2">Total Attendance Records (this month): <b>{payroll.attendanceCount}</b></p>
            <p className="mb-4">Total Minutes Worked (this month): <b>{payroll.totalMinutes}</b></p>
            <table className="min-w-full text-sm mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Percentage</th>
                  <th className="p-2 text-left">Fixed Amount</th>
                </tr>
              </thead>
              <tbody>
                {payroll.payrollStructure.heads.map((head, idx) => (
                  <tr key={idx}>
                    <td className="p-2">{head.name}</td>
                    <td className="p-2 capitalize">{head.type}</td>
                    <td className="p-2">{head.percentage != null ? head.percentage + ' %' : '-'}</td>
                    <td className="p-2">{head.fixedAmount != null ? '₹ ' + head.fixedAmount : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}
      </div>
    </div>
  );
} 