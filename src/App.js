// src/App.js
import React, { useState } from 'react';
import './App.css';
import DrugForm from './components/DrugForm';
import DrugList from './components/DrugList';
import Login from './components/Login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refresh, setRefresh] = useState(0); // Used to trigger list reload
  const [editingDrug, setEditingDrug] = useState(null); 
  const [categories, setCategories] = useState([]); // Shared categories between List and Form

  // If no token, show Login Screen
  if (!token) {
    return <Login onLoginSuccess={() => setToken(localStorage.getItem('token'))} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const handleDrugSaved = () => {
    setRefresh(prev => prev + 1); // Trigger List reload
    setEditingDrug(null); // Exit edit mode
  };

  const handleEditClick = (drug) => {
    setEditingDrug(drug);
    // Optional: Scroll to top if on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="App">
      <header className="App-header">
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <div style={{background:'white', color:'#2c3e50', width:'35px', height:'35px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}>QM</div>
            <h1>Pharmacy Admin</h1>
        </div>
        
        <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
            <span style={{fontSize:'0.9rem', opacity:0.8}}>Admin Mode</span>
            <button 
              onClick={handleLogout} 
              className="logout-btn"
            >
              Logout
            </button>
        </div>
      </header>
      
      <main className="App-content">
        <div className="left-panel">
          <DrugForm 
            onDrugSaved={handleDrugSaved} 
            drugToEdit={editingDrug} 
            existingCategories={categories} 
          />
        </div>
        
        <div className="right-panel">
          <DrugList 
            refreshTrigger={refresh} 
            onEditClick={handleEditClick}
            setCategories={setCategories} 
          />
        </div>
      </main>
    </div>
  );
}

export default App;
