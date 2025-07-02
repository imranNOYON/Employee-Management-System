import React, { useState } from 'react';
import axios from 'axios';

export default function ProfilePage() {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const [user, setUser] = useState(storedUser);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    company: user?.company || '',
    department: user?.department || '',
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm({
      name: user?.name || '',
      company: user?.company || '',
      department: user?.department || '',
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/employee/profile`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setEditMode(false);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-6">My Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700">Full Name:</label>
            {editMode ? (
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="bg-gray-50 p-2 rounded w-full border"
              />
            ) : (
              <p className="bg-gray-50 p-2 rounded">{user?.name}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Email:</label>
            <p className="bg-gray-50 p-2 rounded">{user?.email}</p>
          </div>
          <div>
            <label className="block text-gray-700">Company:</label>
            {editMode ? (
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                className="bg-gray-50 p-2 rounded w-full border"
              />
            ) : (
              <p className="bg-gray-50 p-2 rounded">{user?.company}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Department:</label>
            {editMode ? (
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                className="bg-gray-50 p-2 rounded w-full border"
              />
            ) : (
              <p className="bg-gray-50 p-2 rounded">{user?.department}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Role:</label>
            <p className="bg-gray-50 p-2 rounded">{user?.role}</p>
          </div>
          <div>
            <label className="block text-gray-700">Joining Date:</label>
            <p className="bg-gray-50 p-2 rounded">
              {user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : ''}
            </p>
          </div>
        </div>
        <div className="mt-6 flex space-x-4">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                disabled={loading}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
