import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  ShieldCheck,
  BatteryCharging,
  ArrowLeft,
  Clock,
  MapPin,
  Flame,
} from 'lucide-react';
import { getAlerts, triggerSOS } from '../services/api';

export default function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('ALL');

  const loadAlerts = async () => {
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTestSOS = async () => {
    await triggerSOS('Manual drill / test alert sent from Alerts dashboard');
    loadAlerts();
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'ALL') return true;
    if (filter === 'SOS') return alert.type === 'SOS';
    if (filter === 'FALL') return alert.type === 'FALL';
    return true;
  });

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'danger':
        return 'border-red-500/60 bg-red-950/40 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.3)]';
      case 'warning':
        return 'border-yellow-500/60 bg-yellow-950/40 text-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]';
      case 'success':
        return 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300';
      default:
        return 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300';
    }
  };

  return (
    <div className="min-h-screen w-full pt-[100px] pb-16 px-4 md:px-8 bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-semibold mb-2">
              <Bell className="w-3.5 h-3.5 text-cyan-400" />
              <span>INCIDENT AUDIT LOG</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Safety Alerts & History</h1>
            <p className="text-xs md:text-sm text-gray-300">
              Chronological log of distress beacons, impact anomalies, and safe-zone triggers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestSOS}
              className="px-4 py-2 rounded-xl bg-red-600/40 hover:bg-red-600/70 border border-red-500 text-xs font-bold text-red-200 transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              <Flame className="w-4 h-4 text-red-400" />
              Simulate Drill Alert
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 text-xs font-semibold">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'ALL'
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Incidents ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('SOS')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'SOS'
                ? 'bg-red-500/30 text-red-300 border border-red-400/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            SOS Alarms
          </button>
          <button
            onClick={() => setFilter('FALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'FALL'
                ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Fall Detection
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="glass-panel p-12 text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">All Clear • No Active Alerts</h3>
              <p className="text-xs text-gray-400">Child is safe within regular route parameters.</p>
            </div>
          ) : (
            filteredAlerts.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border backdrop-blur-md transition ${getSeverityStyle(
                  item.severity
                )}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10 mt-0.5">
                      {item.type === 'SOS' || item.type === 'FALL' ? (
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      ) : item.type === 'BATTERY' ? (
                        <BatteryCharging className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ShieldCheck className="w-5 h-5 text-cyan-400" />
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-base">{item.title}</h3>
                      <p className="text-xs text-gray-200 mt-1">{item.message}</p>

                      {item.location && (
                        <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-cyan-300 font-mono px-2.5 py-0.5 rounded-md bg-black/40 border border-cyan-500/30">
                          <MapPin className="w-3 h-3" />
                          Lat: {item.location.lat}, Lon: {item.location.lon}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-400 font-mono whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Back Button */}
        <div className="pt-4 flex justify-center">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary-glass">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
