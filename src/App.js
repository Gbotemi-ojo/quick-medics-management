import React, { useState } from 'react';
import './App.css';
import DrugForm from './components/DrugForm';
import DrugList from './components/DrugList';
import OrderList from './components/OrderList'; 
import HomepageManager from './components/HomepageManager';
import BannerManager from './components/BannerManager'; // NEW
import Login from './components/Login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'orders', 'layout', 'banners'
  const [refresh, setRefresh] = useState(0); 
  const [editingDrug, setEditingDrug] = useState(null); 
  const [categories, setCategories] = useState([]);

  if (!token) return <Login onLoginSuccess={() => setToken(localStorage.getItem('token'))} />;

  const handleLogout = () => { localStorage.removeItem('token'); setToken(null); };

  const handleDrugSaved = () => {
    setRefresh(prev => prev + 1);
    setEditingDrug(null);
  };

  const handleEditClick = (drug) => {
    setEditingDrug(drug);
    setActiveTab('inventory'); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="App-layout">
      <aside className="sidebar">
         <div className="brand">
            <div className="logo-circle-sm">QM</div>
            <h3>Admin Panel</h3>
         </div>

         <nav className="side-nav">
            <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>📦 Inventory</button>
            <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>🛒 Orders</button>
            <div style={{borderTop:'1px solid #34495e', margin:'10px 0'}}></div>
            <button className={activeTab === 'banners' ? 'active' : ''} onClick={() => setActiveTab('banners')}>🖼️ Ad Banners</button>
            <button className={activeTab === 'layout' ? 'active' : ''} onClick={() => setActiveTab('layout')}>🎨 Website Sections</button>
         </nav>

         <div className="logout-wrapper">
             <button onClick={handleLogout} className="sidebar-logout">Logout</button>
         </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
            <h2>Admin Dashboard</h2>
            <div className="user-profile">Admin</div>
        </header>

        <div className="content-body">
            {activeTab === 'inventory' && (
                <div className="inventory-split">
                    <div className="left-panel">
                        <DrugForm onDrugSaved={handleDrugSaved} drugToEdit={editingDrug} existingCategories={categories} />
                    </div>
                    <div className="right-panel">
                        <DrugList refreshTrigger={refresh} onEditClick={handleEditClick} setCategories={setCategories} />
                    </div>
                </div>
            )}
            {activeTab === 'orders' && <OrderList />}
            {activeTab === 'banners' && <BannerManager />}
            {activeTab === 'layout' && <HomepageManager />}
        </div>
      </main>
    </div>
  );
}

export default App;
