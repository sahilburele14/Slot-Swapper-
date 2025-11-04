// =====================================================
// frontend/src/components/Requests/Requests.js
// =====================================================

import React, { useState, useEffect } from 'react';
import { swapAPI } from '../../services/api';
import { format } from 'date-fns';

export const Requests = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [incoming, outgoing] = await Promise.all([
        swapAPI.getIncomingRequests(),
        swapAPI.getOutgoingRequests()
      ]);
      setIncomingRequests(incoming.data.incomingRequests);
      setOutgoingRequests(outgoing.data.outgoingRequests);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId, accept) => {
    try {
      await swapAPI.respondToSwap(requestId, accept);
      alert(`Swap ${accept ? 'accepted' : 'rejected'} successfully!`);
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to respond to swap');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-200 text-yellow-800';
      case 'ACCEPTED': return 'bg-green-200 text-green-800';
      case 'REJECTED': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Swap Requests</h1>

      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`pb-4 px-4 font-medium ${
            activeTab === 'incoming'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Incoming ({incomingRequests.filter(r => r.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`pb-4 px-4 font-medium ${
            activeTab === 'outgoing'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Outgoing ({outgoingRequests.filter(r => r.status === 'PENDING').length})
        </button>
      </div>

      {activeTab === 'incoming' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Requests You've Received</h2>
          {incomingRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No incoming requests</p>
            </div>
          ) : (
            incomingRequests.map((request) => (
              <div key={request.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        from {request.requester_name} ({request.requester_email})
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-900">They're offering:</h4>
                        <p className="text-gray-800 mt-1">{request.requester_slot_title}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(request.requester_slot_start), 'PPpp')} - 
                          {format(new Date(request.requester_slot_end), 'p')}
                        </p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold text-gray-900">For your slot:</h4>
                        <p className="text-gray-800 mt-1">{request.my_slot_title}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(request.my_slot_start), 'PPpp')} - 
                          {format(new Date(request.my_slot_end), 'p')}
                        </p>
                      </div>
                    </div>
                  </div>
                  {request.status === 'PENDING' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleResponse(request.id, true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleResponse(request.id, false)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Requested on {format(new Date(request.created_at), 'PPpp')}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'outgoing' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Requests You've Sent</h2>
          {outgoingRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No outgoing requests</p>
            </div>
          ) : (
            outgoingRequests.map((request) => (
              <div key={request.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      to {request.target_user_name} ({request.target_user_email})
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-900">You're offering:</h4>
                      <p className="text-gray-800 mt-1">{request.my_slot_title}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(request.my_slot_start), 'PPpp')} - 
                        {format(new Date(request.my_slot_end), 'p')}
                      </p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-900">For their slot:</h4>
                      <p className="text-gray-800 mt-1">{request.target_slot_title}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(request.target_slot_start), 'PPpp')} - 
                        {format(new Date(request.target_slot_end), 'p')}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Requested on {format(new Date(request.created_at), 'PPpp')}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// =====================================================
// frontend/src/components/Layout/Navigation.js
// =====================================================

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link to="/" className="flex items-center text-xl font-bold text-indigo-600">
              SlotSwapper
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/dashboard')
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/marketplace"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/marketplace')
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Marketplace
                </Link>
                <Link
                  to="/requests"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/requests')
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Requests
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">{user.name}</span>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-500 hover:text-gray-700">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// =====================================================
// frontend/src/App.js
// =====================================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navigation } from './components/Layout/Navigation';
import { Login } from './components/Auth/Login';
import { Signup } from './components/Auth/Signup';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Marketplace } from './components/Marketplace/Marketplace';
import { Requests } from './components/Requests/Requests';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <ProtectedRoute>
                  <Requests />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

// =====================================================
// frontend/src/index.js
// =====================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// =====================================================
// frontend/src/index.css
// =====================================================

