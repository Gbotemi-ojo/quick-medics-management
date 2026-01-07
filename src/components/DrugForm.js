// src/components/DrugForm.js
import React, { useState, useEffect } from 'react';
import { createDrug, updateDrug } from '../api';

const DrugForm = ({ onDrugSaved, drugToEdit, existingCategories = [] }) => {
  const [loading, setLoading] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  
  const [formData, setFormData] = useState({
    Product: '',
    Category: '',
    Retail_Price: '',
    In_Stock: '',
    image_url: ''
  });

  // Populate form if we are Editing, otherwise Clear it
  useEffect(() => {
    if (drugToEdit) {
      setFormData({
        Product: drugToEdit.name,
        Category: drugToEdit.category,
        Retail_Price: drugToEdit.price,
        In_Stock: drugToEdit.stock,
        image_url: drugToEdit.image || ''
      });
      setIsNewCategory(false);
    } else {
        setFormData({ Product: '', Category: '', Retail_Price: '', In_Stock: '', image_url: '' });
    }
  }, [drugToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === 'NEW_CATEGORY_OPTION') {
        setIsNewCategory(true);
        setFormData({ ...formData, Category: '' });
    } else {
        setIsNewCategory(false);
        setFormData({ ...formData, Category: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (drugToEdit) {
        await updateDrug(drugToEdit.id, formData);
        alert('Drug updated successfully!');
      } else {
        await createDrug(formData);
        alert('Drug added successfully!');
      }
      
      // Reset Form
      setFormData({ Product: '', Category: '', Retail_Price: '', In_Stock: '', image_url: '' });
      setIsNewCategory(false);
      
      // Notify parent to refresh list
      if (onDrugSaved) onDrugSaved(); 
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:'15px'}}>
        <h3 style={{margin:0}}>{drugToEdit ? `Edit Drug #${drugToEdit.id}` : 'Add New Drug'}</h3>
        {drugToEdit && (
            <button onClick={() => onDrugSaved()} style={{fontSize: '0.8rem', padding: '5px 10px', cursor:'pointer', background:'#ddd', border:'none', borderRadius:'4px'}}>
                Cancel
            </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name</label>
          <input name="Product" value={formData.Product} onChange={handleChange} required placeholder="e.g. Panadol Extra" />
        </div>

        <div className="form-group">
            <label>Category</label>
            {!isNewCategory ? (
                <select 
                    value={existingCategories.includes(formData.Category) ? formData.Category : (formData.Category ? 'NEW_CATEGORY_OPTION' : '')} 
                    onChange={handleCategoryChange}
                    style={{width: '100%', padding: '0.6rem', marginBottom: '10px'}}
                >
                    <option value="">-- Select Category --</option>
                    {existingCategories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                    ))}
                    <option value="NEW_CATEGORY_OPTION" style={{fontWeight: 'bold', color:'#2980b9'}}>+ Create New Category</option>
                </select>
            ) : (
                <div style={{display: 'flex', gap: '5px', marginBottom:'10px'}}>
                    <input 
                        name="Category" 
                        value={formData.Category} 
                        onChange={handleChange} 
                        placeholder="Type new category name..." 
                        autoFocus
                    />
                    <button type="button" onClick={() => setIsNewCategory(false)} style={{padding:'0 15px'}}>x</button>
                </div>
            )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price (₦)</label>
            <input type="number" name="Retail_Price" value={formData.Retail_Price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Stock Qty</label>
            <input type="number" name="In_Stock" value={formData.In_Stock} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
            <label>Image URL</label>
            <input name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://..." />
        </div>

        <button type="submit" disabled={loading} className="submit-btn" style={{backgroundColor: drugToEdit ? '#f39c12' : '#27ae60'}}>
          {loading ? 'Processing...' : (drugToEdit ? 'Update Drug' : 'Add Drug')}
        </button>
      </form>
    </div>
  );
};

export default DrugForm;
