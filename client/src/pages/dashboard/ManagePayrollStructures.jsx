import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PayrollStructureForm from '../../components/PayrollStructureForm';

export default function ManagePayrollStructures() {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);

  const token = localStorage.getItem('token');
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchStructures = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payroll');
      setStructures(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load payroll structures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
    // eslint-disable-next-line
  }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingStructure(null);
    fetchStructures();
  };

  const handleEdit = (structure) => {
    setEditingStructure(structure);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payroll structure?')) return;
    try {
      await api.delete(`/payroll/${id}`);
      fetchStructures();
    } catch {
      alert('Failed to delete payroll structure');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Payroll Structures</h2>
          <button
            onClick={() => { setEditingStructure(null); setShowForm(!showForm); }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Create New Structure'}
          </button>
        </div>
        {showForm && (
          <div className="bg-white p-6 rounded shadow mb-6">
            <PayrollStructureForm onSuccess={handleFormSuccess} editingStructure={editingStructure} />
          </div>
        )}
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : structures.length === 0 ? (
          <p>No payroll structures found.</p>
        ) : (
          <div className="space-y-4">
            {structures.map(structure => (
              <div key={structure._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{structure.name}</h3>
                  <p className="text-gray-600 text-sm">{structure.heads.length} heads</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(structure)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Edit</button>
                  <button onClick={() => handleDelete(structure._id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 