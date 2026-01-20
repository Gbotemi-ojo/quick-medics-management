import React, { useEffect, useState } from 'react';
import { fetchCategories, updateCategory } from '../api';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', imageUrl: '', isFeatured: false });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await fetchCategories();
        setCategories(data);
        setLoading(false);
    };

    const handleEdit = (cat) => {
        setEditingId(cat.id);
        setEditForm({ 
            name: cat.name, 
            imageUrl: cat.imageUrl || '', 
            isFeatured: cat.isFeatured || false 
        });
    };

    const handleSave = async (id) => {
        await updateCategory(id, editForm);
        setEditingId(null);
        loadData(); 
    };

    return (
        <div className="list-container">
            <h3>Homepage Categories Manager</h3>
            <p style={{fontSize:'0.9rem', color:'#666', marginBottom:'20px'}}>
                Mark categories as <strong>Featured</strong> to show them on the Homepage. Add image URLs for the cards.
            </p>

            {loading ? <p>Loading...</p> : (
                <table>
                    <thead>
                        <tr>
                            <th>Category Name</th>
                            <th>Image Preview</th>
                            <th>Homepage Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td>
                                    {editingId === cat.id ? (
                                        <input 
                                            value={editForm.name} 
                                            onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                                        />
                                    ) : cat.name}
                                </td>
                                <td>
                                    {editingId === cat.id ? (
                                        <input 
                                            placeholder="Image URL" 
                                            value={editForm.imageUrl} 
                                            onChange={(e) => setEditForm({...editForm, imageUrl: e.target.value})} 
                                        />
                                    ) : (
                                        cat.imageUrl ? <img src={cat.imageUrl} alt="" style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'4px'}} /> : 'No Image'
                                    )}
                                </td>
                                <td>
                                    {editingId === cat.id ? (
                                        <label style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                                            <input 
                                                type="checkbox" 
                                                checked={editForm.isFeatured} 
                                                onChange={(e) => setEditForm({...editForm, isFeatured: e.target.checked})} 
                                            />
                                            Show on Home
                                        </label>
                                    ) : (
                                        cat.isFeatured ? 
                                        <span className="status-badge paid">Featured</span> : 
                                        <span className="status-badge pending">Hidden</span>
                                    )}
                                </td>
                                <td>
                                    {editingId === cat.id ? (
                                        <div style={{display:'flex', gap:'5px'}}>
                                            <button onClick={() => handleSave(cat.id)} className="action-btn">Save</button>
                                            <button onClick={() => setEditingId(null)} style={{background:'none', border:'none', color:'red', cursor:'pointer'}}>Cancel</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleEdit(cat)} className="action-btn">Edit</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CategoryManager;
