// src/App.js
import React, { useState } from 'react';
import './App.css';
import DrugForm from './components/DrugForm';
import DrugList from './components/DrugList';
import OrderList from './components/OrderList'; 
import Login from './components/Login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders'
  const [refresh, setRefresh] = useState(0); 
  const [editingDrug, setEditingDrug] = useState(null); 
  const [categories, setCategories] = useState([]);

  if (!token) {
    return <Login onLoginSuccess={() => setToken(localStorage.getItem('token'))} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const handleDrugSaved = () => {
    setRefresh(prev => prev + 1);
    setEditingDrug(null);
  };

  const handleEditClick = (drug) => {
    setEditingDrug(drug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="App-layout">
      {/* --- SIDEBAR --- */}
      <aside className="sidebar">
         <div className="brand">
            <div className="logo-circle-sm">QM</div>
            <h3>Admin Panel</h3>
         </div>

         <nav className="side-nav">
            <button 
                className={activeTab === 'inventory' ? 'active' : ''} 
                onClick={() => setActiveTab('inventory')}
            >
                📦 Inventory
            </button>
            <button 
                className={activeTab === 'orders' ? 'active' : ''} 
                onClick={() => setActiveTab('orders')}
            >
                🛒 Orders
            </button>
         </nav>

         <div className="logout-wrapper">
             <button onClick={handleLogout} className="sidebar-logout">Logout</button>
         </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="main-content">
        <header className="top-header">
            <h2>{activeTab === 'inventory' ? 'Inventory Management' : 'Order Management'}</h2>
            <div className="user-profile">Admin</div>
        </header>

        <div className="content-body">
            {activeTab === 'inventory' && (
                <div className="inventory-split">
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
                </div>
            )}

            {activeTab === 'orders' && (
                <OrderList />
            )}
        </div>
      </main>
    </div>
  );
}

export default App;
