import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import SOSModal from './components/SOSModal';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import HealthMonitor from './pages/HealthMonitor';
import LiveLocation from './pages/LiveLocation';
import WatchStatus from './pages/WatchStatus';
import EmergencyContacts from './pages/EmergencyContacts';
import Alerts from './pages/Alerts';
import SafetyQuiz from './pages/SafetyQuiz';
import { getTelemetry } from './services/api';

export default function App() {
  const location = useLocation();
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const data = await getTelemetry();
        setTelemetry(data);
      } catch (err) {
        console.warn('Live telemetry polling:', err.message);
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 2500);
    return () => clearInterval(interval);
  }, []);

  const isHomeScreen = location.pathname === '/';

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white font-['Outfit',sans-serif]">
      {/* Top Navbar on all pages except the retro home start screen */}
      {!isHomeScreen && <Navbar onOpenSOS={() => setIsSOSOpen(true)} />}

      {/* Main Page Routing */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard telemetry={telemetry} onOpenSOS={() => setIsSOSOpen(true)} />} />
        <Route path="/gps" element={<HealthMonitor />} />
        <Route path="/health" element={<HealthMonitor />} />
        <Route path="/location" element={<LiveLocation />} />
        <Route path="/battery" element={<WatchStatus />} />
        <Route path="/contact" element={<EmergencyContacts />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/quiz" element={<SafetyQuiz />} />
      </Routes>

      {/* Global Emergency SOS Modal */}
      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        telemetry={telemetry}
      />
    </div>
  );
}
