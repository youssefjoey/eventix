import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/Management.css';

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // api.baseURL already contains /api/v1, so use the relative path here
      const response = await api.get('/categories');
      console.log('✅ Categories fetched:', response.data);
      // Handle response - ensure it's an array
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategories([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert('⚠️ Please enter category name');
      return;
    }

    try {
      console.log('📤 Creating Category:', formData);
      await api.post('/admin/categories', formData);
      console.log('✅ Category created successfully!');
      setShowForm(false);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('❌ Error creating category:', error);
      alert('Failed to create category: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('🗑️ Are you sure you want to delete this category?')) return;

    try {
      console.log('📤 Deleting Category:', id);
      await api.delete(`/admin/categories/${id}`);
      console.log('✅ Category deleted successfully!');
      fetchCategories();
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      alert('Failed to delete category: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <div>
          <h2>🎭 Categories Management</h2>
          <p className="subtitle">Create and manage event categories</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? '❌ Cancel' : '➕ Create Category'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateCategory} className="event-form">
          <input
            type="text"
            name="name"
            placeholder="Category Name *"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
          />
          <button type="submit" className="btn btn-success">✨ Create Category</button>
        </form>
      )}

      <div className={`events-grid ${loading ? 'loading' : ''}`}>
        {categories.map(cat => (
          <div key={cat.id} className="category-card">
            <div className="card-header">
              <h3>🎭 {cat.name}</h3>
            </div>
            <p className="card-desc">{cat.description}</p>
            <div className="card-actions">
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="btn btn-danger"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesManagement;

