import React, { useEffect, useState } from 'react';
import { fetchCategories, fetchSections, createSection, deleteSection, updateCategory, fetchDrugs, fetchSectionItems, updateSectionItems } from '../api';

const HomepageManager = () => {
    const [categories, setCategories] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('sections'); 

    // -- EDIT SECTION CONTENT STATE --
    const [activeSection, setActiveSection] = useState(null); // The section currently being edited
    const [pinnedDrugs, setPinnedDrugs] = useState([]); // Drugs currently pinned to this section
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // Form for new section
    const [sectionTitle, setSectionTitle] = useState('');
    const [sectionCatId, setSectionCatId] = useState(''); 

    // Category Editing
    const [editingCatId, setEditingCatId] = useState(null);
    const [editCatForm, setEditCatForm] = useState({ name: '', imageUrl: '', isFeatured: false });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [cats, secs] = await Promise.all([fetchCategories(), fetchSections()]);
            setCategories(cats || []);
            setSections(secs || []);
        } catch(e) { console.error(e); }
        setLoading(false);
    };

    // --- SECTION ACTIONS ---
    const handleAddSection = async (e) => {
        e.preventDefault();
        await createSection({ 
            title: sectionTitle, 
            categoryId: sectionCatId ? parseInt(sectionCatId) : null 
        });
        setSectionTitle('');
        setSectionCatId('');
        loadData();
    };

    const handleDeleteSection = async (id) => {
        if(window.confirm('Remove this section?')) {
            await deleteSection(id);
            loadData();
        }
    };

    // --- PINNED ITEMS ACTIONS ---
    const openContentManager = async (section) => {
        setActiveSection(section);
        const items = await fetchSectionItems(section.id);
        setPinnedDrugs(items);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleSearch = async (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        if(q.length > 2) {
            const results = await fetchDrugs(1, 10, q);
            // Filter out already pinned items
            const currentIds = pinnedDrugs.map(d => d.id);
            setSearchResults(results.items.filter(d => !currentIds.includes(d.id)));
        } else {
            setSearchResults([]);
        }
    };

    const addToPinned = async (drug) => {
        const newPinned = [...pinnedDrugs, drug];
        setPinnedDrugs(newPinned);
        setSearchResults(prev => prev.filter(d => d.id !== drug.id));
        
        // Save to DB immediately
        await updateSectionItems(activeSection.id, newPinned.map(d => d.id));
    };

    const removeFromPinned = async (drugId) => {
        const newPinned = pinnedDrugs.filter(d => d.id !== drugId);
        setPinnedDrugs(newPinned);
        
        // Save to DB immediately
        await updateSectionItems(activeSection.id, newPinned.map(d => d.id));
    };

    // --- CATEGORY ACTIONS ---
    const handleSaveCat = async (id) => {
        await updateCategory(id, editCatForm);
        setEditingCatId(null);
        loadData();
    };

    return (
        <div style={{display:'flex', gap:'20px'}}>
            {/* --- SIDEBAR --- */}
            <div style={{width:'200px', display:'flex', flexDirection:'column', gap:'10px'}}>
                <button onClick={() => setView('sections')} style={{padding:'10px', textAlign:'left', borderRadius:'5px', border:'none', background: view === 'sections' ? '#2c3e50' : '#ecf0f1', color: view === 'sections'?'white':'black', cursor:'pointer'}}>📑 Page Sections</button>
                <button onClick={() => setView('categories')} style={{padding:'10px', textAlign:'left', borderRadius:'5px', border:'none', background: view === 'categories' ? '#2c3e50' : '#ecf0f1', color: view === 'categories'?'white':'black', cursor:'pointer'}}>🏷️ Category Bubbles</button>
            </div>

            {/* --- CONTENT --- */}
            <div className="list-container" style={{flex:1}}>
                {loading && <p>Loading...</p>}

                {/* --- SECTIONS VIEW --- */}
                {!loading && view === 'sections' && !activeSection && (
                    <div>
                        <h3>Homepage Product Rows</h3>
                        
                        {/* CREATE SECTION FORM */}
                        <form onSubmit={handleAddSection} style={{background:'#f9f9f9', padding:'15px', borderRadius:'8px', marginBottom:'20px', border:'1px solid #eee', display:'flex', gap:'10px', alignItems:'end'}}>
                            <div style={{flex:1}}>
                                <label style={{display:'block', fontSize:'0.8rem', marginBottom:'5px'}}>Custom Header (Title)</label>
                                <input required placeholder="e.g. Flash Sales" value={sectionTitle} onChange={e=>setSectionTitle(e.target.value)} style={{width:'100%', padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}} />
                            </div>
                            <div style={{flex:1}}>
                                <label style={{display:'block', fontSize:'0.8rem', marginBottom:'5px'}}>Category Auto-fill (Optional)</label>
                                <select value={sectionCatId} onChange={e=>setSectionCatId(e.target.value)} style={{width:'100%', padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}}>
                                    <option value="">None (Manual Items Only)</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="submit-btn" style={{width:'auto', marginTop:0}}>+ Add</button>
                        </form>

                        {/* SECTIONS LIST */}
                        <table style={{width:'100%'}}>
                            <thead><tr style={{background:'#eee'}}><th style={{padding:'10px'}}>Title</th><th style={{padding:'10px'}}>Behavior</th><th style={{padding:'10px'}}>Actions</th></tr></thead>
                            <tbody>
                                {sections.map(sec => (
                                    <tr key={sec.id} style={{borderBottom:'1px solid #eee'}}>
                                        <td style={{padding:'10px', fontWeight:'bold'}}>{sec.title}</td>
                                        <td style={{padding:'10px', fontSize:'0.85rem'}}>
                                            {sec.categoryId 
                                                ? <span>📌 Pinned Items first, then fill from <strong>{categories.find(c=>c.id===sec.categoryId)?.name}</strong></span>
                                                : <span>📌 Only show Pinned Items</span>
                                            }
                                        </td>
                                        <td style={{padding:'10px'}}>
                                            <button onClick={() => openContentManager(sec)} style={{marginRight:'10px', cursor:'pointer', background:'#3498db', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px'}}>Manage Content</button>
                                            <button onClick={() => handleDeleteSection(sec.id)} style={{color:'red', background:'none', border:'none', cursor:'pointer'}}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- CONTENT MANAGER (DRUG PICKER) --- */}
                {activeSection && (
                    <div>
                        <button onClick={() => setActiveSection(null)} style={{marginBottom:'15px', cursor:'pointer', border:'none', background:'none', color:'#555'}}>← Back to Sections</button>
                        <h3 style={{marginTop:0}}>Managing: {activeSection.title}</h3>
                        <p style={{fontSize:'0.9rem', color:'#666'}}>
                            {activeSection.categoryId 
                                ? "Items you pin here appear first. Remaining slots (up to 12) are filled by the category."
                                : "Only items listed below will appear in this section."}
                        </p>

                        <div style={{display:'flex', gap:'20px', height:'400px'}}>
                            {/* LEFT: PINNED ITEMS */}
                            <div style={{flex:1, border:'1px solid #ddd', borderRadius:'8px', padding:'10px', overflowY:'auto'}}>
                                <h4 style={{marginTop:0}}>📌 Pinned Items ({pinnedDrugs.length})</h4>
                                {pinnedDrugs.length === 0 && <p style={{color:'#999', fontSize:'0.9rem'}}>No items pinned yet.</p>}
                                {pinnedDrugs.map((drug, idx) => (
                                    <div key={drug.id} style={{display:'flex', justifyContent:'space-between', padding:'8px', borderBottom:'1px solid #eee', alignItems:'center'}}>
                                        <span style={{fontSize:'0.9rem'}}><strong>{idx+1}.</strong> {drug.name}</span>
                                        <button onClick={() => removeFromPinned(drug.id)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>x</button>
                                    </div>
                                ))}
                            </div>

                            {/* RIGHT: SEARCH INVENTORY */}
                            <div style={{flex:1, border:'1px solid #ddd', borderRadius:'8px', padding:'10px', display:'flex', flexDirection:'column'}}>
                                <h4 style={{marginTop:0}}>🔎 Search Inventory</h4>
                                <input placeholder="Type to search..." value={searchQuery} onChange={handleSearch} style={{padding:'8px', width:'100%', boxSizing:'border-box', marginBottom:'10px'}} />
                                
                                <div style={{flex:1, overflowY:'auto'}}>
                                    {searchResults.map(drug => (
                                        <div key={drug.id} style={{display:'flex', justifyContent:'space-between', padding:'8px', borderBottom:'1px solid #eee', alignItems:'center'}}>
                                            <span style={{fontSize:'0.9rem'}}>{drug.name} <span style={{color:'#999'}}>({drug.stock})</span></span>
                                            <button onClick={() => addToPinned(drug)} style={{color:'green', border:'none', background:'none', cursor:'pointer', fontWeight:'bold'}}>+ Add</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- CATEGORIES VIEW --- */}
                {!loading && view === 'categories' && (
                    <div>
                        <h3>Top Category Bubbles</h3>
                        <table>
                            <thead><tr><th>Name</th><th>Image</th><th>Featured?</th><th>Action</th></tr></thead>
                            <tbody>
                                {categories.map(cat => (
                                    <tr key={cat.id}>
                                        <td>{editingCatId === cat.id ? <input value={editCatForm.name} onChange={e=>setEditCatForm({...editCatForm, name:e.target.value})} /> : cat.name}</td>
                                        <td>{editingCatId === cat.id ? <input placeholder="Img URL" value={editCatForm.imageUrl} onChange={e=>setEditCatForm({...editCatForm, imageUrl:e.target.value})} /> : (cat.imageUrl ? <img src={cat.imageUrl} alt="" width="30"/> : '-')}</td>
                                        <td>
                                            {editingCatId === cat.id ? (
                                                <input type="checkbox" checked={editCatForm.isFeatured} onChange={e=>setEditCatForm({...editCatForm, isFeatured:e.target.checked})} />
                                            ) : (cat.isFeatured ? '✅' : '')}
                                        </td>
                                        <td>
                                            {editingCatId === cat.id ? (
                                                <><button onClick={()=>handleSaveCat(cat.id)} style={{color:'green', marginRight:'10px', cursor:'pointer'}}>Save</button><button onClick={()=>setEditingCatId(null)} style={{color:'red', cursor:'pointer'}}>Cancel</button></>
                                            ) : (
                                                <button onClick={() => { setEditingCatId(cat.id); setEditCatForm({name: cat.name, imageUrl: cat.imageUrl, isFeatured: cat.isFeatured}); }} style={{cursor:'pointer', color:'#2980b9'}}>Edit</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomepageManager;
