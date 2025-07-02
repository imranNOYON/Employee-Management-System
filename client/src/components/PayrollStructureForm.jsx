import React, { useState } from 'react';
import axios from 'axios';

export default function PayrollStructureForm({ onSuccess, editingStructure = null }) {
  const [formData, setFormData] = useState({
    name: editingStructure?.name || '',
    heads: editingStructure?.heads || [{ name: '', type: 'allowance', percentage: '', fixedAmount: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem('token');
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` }
  });

  const addHead = () => {
    setFormData(prev => ({
      ...prev,
      heads: [...prev.heads, { name: '', type: 'allowance', percentage: '', fixedAmount: '' }]
    }));
  };

  const removeHead = (index) => {
    setFormData(prev => ({
      ...prev,
      heads: prev.heads.filter((_, i) => i !== index)
    }));
  };

  const updateHead = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      heads: prev.heads.map((head, i) => 
        i === index 
          ? { 
              ...head, 
              [field]: value,
              ...(field === 'percentage' && value ? { fixedAmount: '' } : {}),
              ...(field === 'fixedAmount' && value ? { percentage: '' } : {})
            }
          : head
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Structure name is required';
    if (formData.heads.length === 0) newErrors.heads = 'At least one payroll head is required';
    formData.heads.forEach((head, index) => {
      if (!head.name.trim()) newErrors[`head_${index}_name`] = 'Head name is required';
      if (!head.type) newErrors[`head_${index}_type`] = 'Head type is required';
      if (!head.percentage && !head.fixedAmount) newErrors[`head_${index}_amount`] = 'Either percentage or fixed amount is required';
      if (head.percentage && head.fixedAmount) newErrors[`head_${index}_amount`] = 'Cannot have both percentage and fixed amount';
      if (head.percentage && (head.percentage < 0 || head.percentage > 100)) newErrors[`head_${index}_percentage`] = 'Percentage must be 0-100';
      if (head.fixedAmount && head.fixedAmount < 0) newErrors[`head_${index}_fixedAmount`] = 'Fixed amount cannot be negative';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});
    try {
      const submitData = {
        name: formData.name.trim(),
        heads: formData.heads.map(head => ({
          name: head.name.trim(),
          type: head.type,
          ...(head.percentage ? { percentage: parseFloat(head.percentage) } : {}),
          ...(head.fixedAmount ? { fixedAmount: parseFloat(head.fixedAmount) } : {})
        }))
      };
      let response;
      if (editingStructure) {
        response = await api.put(`/payroll/${editingStructure._id}`, submitData);
      } else {
        response = await api.post('/payroll', submitData);
      }
      onSuccess(response.data);
      if (!editingStructure) {
        setFormData({
          name: '',
          heads: [{ name: '', type: 'allowance', percentage: '', fixedAmount: '' }]
        });
      }
    } catch (error) {
      setErrors({ general: error.response?.data?.message || 'Failed to save payroll structure' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Structure Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Enter structure name"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">Payroll Heads *</label>
          <button type="button" onClick={addHead} className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">Add Head</button>
        </div>
        {errors.heads && <p className="text-red-500 text-sm mb-4">{errors.heads}</p>}
        <div className="space-y-4">
          {formData.heads.map((head, index) => (
            <div key={index} className="border p-4 rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700">Head {index + 1}</h4>
                {formData.heads.length > 1 && (
                  <button type="button" onClick={() => removeHead(index)} className="text-red-500 hover:text-red-700">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Name *</label>
                  <input type="text" value={head.name} onChange={e => updateHead(index, 'name', e.target.value)} className={`w-full px-2 py-1 border rounded ${errors[`head_${index}_name`] ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors[`head_${index}_name`] && <p className="text-red-500 text-xs mt-1">{errors[`head_${index}_name`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Type *</label>
                  <select value={head.type} onChange={e => updateHead(index, 'type', e.target.value)} className={`w-full px-2 py-1 border rounded ${errors[`head_${index}_type`] ? 'border-red-500' : 'border-gray-300'}`}>
                    <option value="allowance">Allowance</option>
                    <option value="deduction">Deduction</option>
                  </select>
                  {errors[`head_${index}_type`] && <p className="text-red-500 text-xs mt-1">{errors[`head_${index}_type`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Percentage</label>
                  <input type="number" value={head.percentage} onChange={e => updateHead(index, 'percentage', e.target.value)} className={`w-full px-2 py-1 border rounded ${errors[`head_${index}_percentage`] ? 'border-red-500' : 'border-gray-300'}`} min="0" max="100" />
                  {errors[`head_${index}_percentage`] && <p className="text-red-500 text-xs mt-1">{errors[`head_${index}_percentage`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Fixed Amount</label>
                  <input type="number" value={head.fixedAmount} onChange={e => updateHead(index, 'fixedAmount', e.target.value)} className={`w-full px-2 py-1 border rounded ${errors[`head_${index}_fixedAmount`] ? 'border-red-500' : 'border-gray-300'}`} min="0" />
                  {errors[`head_${index}_fixedAmount`] && <p className="text-red-500 text-xs mt-1">{errors[`head_${index}_fixedAmount`]}</p>}
                </div>
              </div>
              {errors[`head_${index}_amount`] && <p className="text-red-500 text-xs mt-1">{errors[`head_${index}_amount`]}</p>}
            </div>
          ))}
        </div>
      </div>
      {errors.general && <p className="text-red-500 text-sm mt-2">{errors.general}</p>}
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={loading}>{loading ? 'Saving...' : (editingStructure ? 'Update Structure' : 'Create Structure')}</button>
    </form>
  );
} 