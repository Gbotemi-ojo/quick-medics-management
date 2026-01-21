import React, { useState, useEffect } from 'react';
import { fetchBanners, createBanner, deleteBanner, toggleBannerStatus } from '../api';

const BannerManager = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        setLoading(true);
        try {
            const data = await fetchBanners();
            setBanners(data);
        } catch(e) { console.error(e); }
        setLoading(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Create preview URL locally
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return alert("Please select an image");

        setLoading(true);
        try {
            // Use FormData for file upload
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('image', selectedFile);

            await createBanner(formData);
            alert("Banner uploaded!");
            
            // Reset form
            setTitle('');
            setDescription('');
            setSelectedFile(null);
            setPreviewUrl('');
            loadBanners();
        } catch (error) {
            alert("Upload failed. " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Delete this banner?")) {
            await deleteBanner(id);
            loadBanners();
        }
    };

    const handleToggle = async (id, currentStatus) => {
        await toggleBannerStatus(id, !currentStatus);
        loadBanners();
    };

    return (
        <div className="list-container">
            <h3>Homepage Banners (Advertisements)</h3>
            
            {/* UPLOAD FORM */}
            <div style={{background:'#f8f9fa', padding:'20px', borderRadius:'8px', marginBottom:'30px', border:'1px solid #e9ecef'}}>
                <h4 style={{marginTop:0}}>Add New Banner</h4>
                <form onSubmit={handleUpload} style={{display:'flex', gap:'20px', alignItems:'flex-start'}}>
                    <div style={{flex:1}}>
                        <div style={{marginBottom:'10px'}}>
                            <label style={{display:'block', fontSize:'0.85rem', fontWeight:'bold'}}>Select Image</label>
                            <input type="file" accept="image/*" onChange={handleImageChange} required />
                        </div>
                        <div style={{marginBottom:'10px'}}>
                            <label style={{display:'block', fontSize:'0.85rem', fontWeight:'bold'}}>Overlay Title</label>
                            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Big Sale!" style={{width:'100%', padding:'8px', boxSizing:'border-box'}} />
                        </div>
                        <div style={{marginBottom:'10px'}}>
                            <label style={{display:'block', fontSize:'0.85rem', fontWeight:'bold'}}>Overlay Description</label>
                            <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="e.g. 50% Off all vitamins" style={{width:'100%', padding:'8px', boxSizing:'border-box'}} />
                        </div>
                        <button type="submit" disabled={loading} className="submit-btn" style={{marginTop:'10px', width:'150px'}}>
                            {loading ? 'Uploading...' : 'Upload Banner'}
                        </button>
                    </div>

                    {/* PREVIEW */}
                    <div style={{width:'300px', height:'150px', background:'#eee', borderRadius:'8px', overflow:'hidden', position:'relative', border:'2px dashed #ccc', display:'flex', justifyContent:'center', alignItems:'center'}}>
                        {previewUrl ? (
                            <>
                                <img src={previewUrl} alt="Preview" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.3)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'20px', color:'white'}}>
                                    <h2 style={{margin:0, fontSize:'1.2rem'}}>{title || 'Title Preview'}</h2>
                                    <p style={{margin:'5px 0 0', fontSize:'0.9rem'}}>{description || 'Description...'}</p>
                                </div>
                            </>
                        ) : (
                            <span style={{color:'#999'}}>Image Preview</span>
                        )}
                    </div>
                </form>
            </div>

            {/* BANNER LIST */}
            <table>
                <thead>
                    <tr>
                        <th width="100">Image</th>
                        <th>Text Overlay</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {banners.map(banner => (
                        <tr key={banner.id}>
                            <td>
                                <img src={banner.imageUrl} alt="banner" style={{width:'80px', height:'50px', objectFit:'cover', borderRadius:'4px'}} />
                            </td>
                            <td>
                                <strong>{banner.title}</strong>
                                <br/><span style={{fontSize:'0.85rem', color:'#666'}}>{banner.description}</span>
                            </td>
                            <td>
                                <button 
                                    onClick={() => handleToggle(banner.id, banner.isActive)}
                                    style={{
                                        padding:'5px 10px', 
                                        borderRadius:'15px', 
                                        border:'none', 
                                        cursor:'pointer',
                                        background: banner.isActive ? '#d4edda' : '#f8d7da',
                                        color: banner.isActive ? '#155724' : '#721c24',
                                        fontWeight:'bold', fontSize:'0.8rem'
                                    }}
                                >
                                    {banner.isActive ? 'Active' : 'Inactive'}
                                </button>
                            </td>
                            <td>
                                <button onClick={() => handleDelete(banner.id)} style={{color:'red', background:'none', border:'none', cursor:'pointer'}}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    {banners.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding:'20px'}}>No banners uploaded.</td></tr>}
                </tbody>
            </table>
        </div>
    );
};

export default BannerManager;
