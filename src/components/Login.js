// src/components/Login.js
import React, { useState } from 'react';
import { loginUser, requestPasswordReset, confirmPasswordReset } from '../api';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [view, setView] = useState('LOGIN'); // 'LOGIN', 'FORGOT', 'RESET'
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Reset Flow States
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UI States
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Send EMAIL and PASSWORD
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.token); 
      onLoginSuccess(); 
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // 2. Send OTP Email
  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await requestPasswordReset(resetEmail);
      setSuccessMsg(`OTP sent to ${resetEmail}`);
      setView('RESET'); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Confirm OTP and New Password
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await confirmPasswordReset(resetEmail, otp, newPassword);
      setSuccessMsg('Password reset successful! Please login.');
      setView('LOGIN'); 
      setPassword(''); 
      setOtp('');
      setNewPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        
        <div className="login-header">
          <div className="logo-circle">QM</div>
          <h2>Quick Medics</h2>
          <p>
            {view === 'LOGIN' && 'Sign in to manage inventory'}
            {view === 'FORGOT' && 'Recover your account'}
            {view === 'RESET' && 'Set new password'}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMsg && <div className="success-message">{successMsg}</div>}

        {/* --- VIEW: LOGIN --- */}
        {view === 'LOGIN' && (
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com" 
                required 
              />
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required 
              />
              <div style={{textAlign:'right', marginTop:'5px'}}>
                <button type="button" className="link-btn" onClick={() => { setView('FORGOT'); setError(''); setSuccessMsg(''); }}>
                  Forgot Password?
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* --- VIEW: FORGOT PASSWORD --- */}
        {view === 'FORGOT' && (
          <form onSubmit={handleForgot}>
            <div className="input-group">
              <label>Registered Email</label>
              <input 
                type="email" 
                value={resetEmail} 
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="admin@example.com" 
                required 
              />
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Sending...' : 'Send OTP Code'}
            </button>

            <button type="button" className="link-btn back-btn" onClick={() => setView('LOGIN')}>
              ← Back to Login
            </button>
          </form>
        )}

        {/* --- VIEW: RESET PASSWORD --- */}
        {view === 'RESET' && (
          <form onSubmit={handleReset}>
            <div className="input-group">
              <label>OTP Code</label>
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456" 
                required 
              />
            </div>

            <div className="input-group">
              <label>New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New strong password" 
                required 
              />
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Processing...' : 'Reset Password'}
            </button>

            <button type="button" className="link-btn back-btn" onClick={() => setView('FORGOT')}>
              ← Resend OTP
            </button>
          </form>
        )}
        
        <div className="login-footer">
            <p>Quick Medics • Authorized Access Only</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
