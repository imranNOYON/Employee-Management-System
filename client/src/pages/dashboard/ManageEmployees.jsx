import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [addForm, setAddForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    company: '', 
    department: '', 
    role: 'employee', 
    joiningDate: '' 
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const token = localStorage.getItem('token');

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` }
  });

  const [payrollStructures, setPayrollStructures] = useState([]);

  const fetchEmployees = () => {
    setLoading(true);
    api.get('/employee/all')
      .then(res => {
        setEmployees(res.data);
        setErrorMsg('');
      })
      .catch(error => {
        console.error('Error fetching employees:', error.response?.data?.message || error.message);
        setErrorMsg('Failed to load employees');
      })
      .finally(() => setLoading(false));
  };

  const fetchPayrollStructures = () => {
    api.get('/payroll')
      .then(res => setPayrollStructures(res.data))
      .catch(error => {
        console.error('Error fetching payroll structures:', error.response?.data?.message || error.message);
      });
  };

  useEffect(() => {
    fetchEmployees();
    fetchPayrollStructures();
  }, []);

  const handleAddChange = e => setAddForm({ ...addForm, [e.target.name]: e.target.value });

  const handleAdd = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await api.post('/employee', addForm);
      setAddForm({ 
        name: '', 
        email: '', 
        password: '', 
        company: '', 
        department: '', 
        role: 'employee', 
        joiningDate: '' 
      });
      setSuccessMsg('Employee added successfully! Please share the email and password with the new employee.');
      fetchEmployees();
    } catch (err) {
      console.error('Failed to add employee:', err.response?.data?.message || err.message);
      setErrorMsg(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await api.delete(`/employee/${id}`);
      setSuccessMsg('Employee deleted successfully!');
      fetchEmployees();
    } catch (err) {
      console.error('Failed to delete employee:', err.response?.data?.message || err.message);
      setErrorMsg('Failed to delete employee: ' + (err.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPayroll = async (employeeId, payrollStructureId) => {
    if (!payrollStructureId || payrollStructureId === '') {
      setErrorMsg('Please select a valid payroll structure.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await api.put('/payroll/assign', { employeeId, payrollStructureId });
      setSuccessMsg('Payroll structure assigned successfully!');
      fetchEmployees();
    } catch (err) {
      console.error('Failed to assign payroll structure:', err);
      let backendMsg = err?.response?.data?.message || err?.message || 'Unknown error occurred.';
      setErrorMsg('Failed to assign payroll structure: ' + backendMsg);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setSuccessMsg('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Manage Employees</h2>
        {successMsg && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMsg}
            <button onClick={clearMessages} className="float-right font-bold">&times;</button>
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMsg}
            <button onClick={clearMessages} className="float-right font-bold">&times;</button>
          </div>
        )}
        <div className="mb-6 bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Add New Employee</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input 
              name="name" 
              value={addForm.name} 
              onChange={handleAddChange} 
              placeholder="Name" 
              className="border p-2 rounded" 
              required 
            />
            <input 
              name="email" 
              value={addForm.email} 
              onChange={handleAddChange} 
              placeholder="Email" 
              className="border p-2 rounded" 
              required 
              type="email" 
            />
            <input 
              name="password" 
              value={addForm.password} 
              onChange={handleAddChange} 
              placeholder="Password" 
              className="border p-2 rounded" 
              required 
              type="password" 
            />
            <input 
              name="company" 
              value={addForm.company} 
              onChange={handleAddChange} 
              placeholder="Company" 
              className="border p-2 rounded" 
            />
            <input 
              name="department" 
              value={addForm.department} 
              onChange={handleAddChange} 
              placeholder="Department" 
              className="border p-2 rounded" 
            />
            <select 
              name="role" 
              value={addForm.role} 
              onChange={handleAddChange} 
              className="border p-2 rounded"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
            <input 
              name="joiningDate" 
              value={addForm.joiningDate} 
              onChange={handleAddChange} 
              placeholder="Joining Date" 
              className="border p-2 rounded" 
              type="date" 
            />
            <button 
              type="submit" 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50" 
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Employee'}
            </button>
          </form>
        </div>
        <div className="bg-white shadow rounded overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Employee List</h3>
          </div>
          {loading && employees.length === 0 ? (
            <div className="p-6 text-center">
              <p>Loading employees...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No employees found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payroll Structure</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map(emp => (
                    <tr key={emp._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                        {emp.company && <div className="text-xs text-gray-500">{emp.company}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 align-middle">{emp.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 align-middle">{emp.department || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          emp.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {emp.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <select
                          value={emp.payrollStructure ? emp.payrollStructure._id || emp.payrollStructure : ''}
                          onChange={e => handleAssignPayroll(emp._id, e.target.value)}
                          className="border p-2 rounded text-sm w-full focus:ring-2 focus:ring-blue-400"
                          disabled={loading}
                        >
                          <option value="">-- Select Payroll --</option>
                          {payrollStructures.map(ps => (
                            <option key={ps._id} value={ps._id}>{ps.name}</option>
                          ))}
                        </select>
                        {emp.payrollStructure && (
                          <div className="text-xs text-gray-500 mt-1">
                            Currently: {emp.payrollStructure.name || 'Assigned'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium align-middle">
                        <button 
                          onClick={() => handleDelete(emp._id)} 
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}