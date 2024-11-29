import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import SharedReport from './pages/SharedReport';
import CustomerManagement from './pages/CustomerManagement';
import Connections from './pages/Connections';
import { TikTokCallback } from './components/connections/TikTokCallback';
import { FaBars } from 'react-icons/fa6';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const path = window.location.pathname;
  const isSharedReport = path.startsWith('/shared/');
  const isTikTokCallback = path.startsWith('/tiktok/callback');

  if (isSharedReport || isTikTokCallback) {
    return (
      <Router>
        <Routes>
          <Route path="/shared/:reportId" element={<SharedReport />} />
          <Route path="/tiktok/callback" element={<TikTokCallback />} />
          <Route path="*" element={<Navigate to="/reports" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex font-sans">
        <Sidebar isOpen={sidebarOpen} />
        
        <div className="flex-1">
          <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-md hover:bg-gray-50 mr-4"
                >
                  <FaBars className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-primary">Ad Campaign Dashboard</h1>
              </div>
            </div>
          </header>

          <main className="p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/reports" replace />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/:reportId" element={<ReportDetail />} />
              <Route path="/customers" element={<CustomerManagement />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="*" element={<Navigate to="/reports" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;