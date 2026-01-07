import React, { useEffect, useState } from 'react';
import { fetchDrugs } from '../api';

const DrugList = ({ refreshTrigger, onEditClick, setCategories }) => {
  const [drugs, setDrugs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Search & Sort States
  const [searchTerm, setSearchTerm] = useState(''); 
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at'); // Default: Newest
  const [sortOrder, setSortOrder] = useState('desc'); 

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); 
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Data
  useEffect(() => {
    const loadDrugs = async () => {
      setLoading(true);
      try {
        // Pass sort params to API
        const data = await fetchDrugs(currentPage, 20, debouncedSearch, sortBy, sortOrder);
        
        if (data && data.items) {
          setDrugs(data.items);
          setTotalPages(data.totalPages);
          if (setCategories) {
            const uniqueCats = [...new Set(data.items.map(d => d.category).filter(Boolean))];
            setCategories(uniqueCats);
          }
        }
      } catch (error) {
        console.error("Failed to load drugs", error);
      } finally {
        setLoading(false);
      }
    };
    loadDrugs();
  }, [refreshTrigger, currentPage, debouncedSearch, sortBy, sortOrder, setCategories]);

  // Handle Header Click (Toggle Sort)
  const handleSortChange = (field) => {
    if (sortBy === field) {
        // Toggle Order
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
        // Set new field, default to ascending
        setSortBy(field);
        setSortOrder('asc');
    }
  };

  const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };

  return (
    <div className="list-container">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'10px'}}>
        <h3 style={{margin:0}}>Inventory</h3>
        
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
            {/* Sort Dropdown */}
            <select 
                onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                }}
                value={`${sortBy}-${sortOrder}`}
                style={{
                  padding: '10px', 
                  borderRadius:'25px', 
                  border:'1px solid #ddd', 
                  outline:'none', 
                  cursor:'pointer',
                  backgroundColor: '#fff'
                }}
            >
                <option value="created_at-desc">Newest Added</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="stock-asc">Stock: Low to High</option>
                <option value="stock-desc">Stock: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="category-asc">Category: A-Z</option>
            </select>

            <input 
                type="text" 
                placeholder="Search drugs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    padding: '10px 15px',
                    width: '200px',
                    borderRadius: '25px',
                    border: '1px solid #ddd',
                    outline: 'none'
                }}
            />
        </div>
      </div>

      {loading ? <p style={{textAlign:'center', padding:'20px'}}>Loading data...</p> : (
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSortChange('name')} style={{cursor:'pointer', userSelect:'none'}}>
                Product {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSortChange('category')} style={{cursor:'pointer', userSelect:'none'}}>
                Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSortChange('price')} style={{cursor:'pointer', userSelect:'none'}}>
                Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSortChange('stock')} style={{cursor:'pointer', userSelect:'none'}}>
                Stock {sortBy === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {drugs.length > 0 ? drugs.map((drug) => (
              <tr key={drug.id}>
                <td>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                      {drug.image ? 
                          <img src={drug.image} alt="" style={{width:'40px', height:'40px', objectFit:'cover', borderRadius:'6px', border:'1px solid #eee'}}/> 
                          : <div style={{width:'40px', height:'40px', background:'#f0f0f0', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#aaa'}}>💊</div>
                      }
                      <span style={{fontWeight:'500'}}>{drug.name}</span>
                  </div>
                </td>
                <td><span style={{background:'#f8f9fa', padding:'4px 8px', borderRadius:'4px', fontSize:'0.85rem', border:'1px solid #eee'}}>{drug.category}</span></td>
                <td>₦{parseFloat(drug.price).toLocaleString()}</td>
                <td style={{ color: drug.stock < 5 ? '#e74c3c' : '#27ae60', fontWeight: 'bold' }}>
                  {drug.stock}
                </td>
                <td>
                    <button 
                      onClick={() => onEditClick(drug)}
                      style={{
                          padding: '6px 12px', 
                          cursor: 'pointer', 
                          background: '#3498db', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px',
                          fontSize: '0.85rem'
                      }}
                    >
                      Edit
                    </button>
                </td>
              </tr>
            )) : (
                <tr>
                    <td colSpan="5" style={{textAlign:'center', padding:'30px', color:'#777'}}>
                        No drugs found matching "{searchTerm}"
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{marginTop: '25px', display: 'flex', justifyContent: 'center', alignItems:'center', gap: '15px'}}>
            <button 
                onClick={handlePrev} 
                disabled={currentPage === 1}
                style={{padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, border:'1px solid #ddd', background:'white', borderRadius:'4px'}}
            > 
                Previous 
            </button>
            <span style={{fontSize: '0.9rem', color: '#555', fontWeight:'600'}}>Page {currentPage} of {totalPages}</span>
            <button 
                onClick={handleNext} 
                disabled={currentPage === totalPages}
                style={{padding: '8px 16px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, border:'1px solid #ddd', background:'white', borderRadius:'4px'}}
            > 
                Next 
            </button>
        </div>
      )}
    </div>
  );
};

export default DrugList;
