import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Battery,
  Wifi,
  Zap,
  HeartPulse,
  Radio,
  Clock,
  HelpCircle,
  ArrowLeft,
  X,
  CheckCircle2,
} from 'lucide-react';
import { getTelemetry } from '../services/api';

export default function WatchStatus() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    battery: 85,
    signal: 'EXCELLENT 📶',
    charging: false,
    online: true,
    time: new Date().toLocaleTimeString(),
  });

  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquiryText, setEnquiryText] = useState('');

  const fetchWatchData = async () => {
    try {
      const telemetry = await getTelemetry();
      setData({
        battery: telemetry.battery ?? 85,
        signal: telemetry.signal ?? 'STRONG 📶',
        charging: Boolean(telemetry.charging),
        online: true,
        time: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      setData((prev) => ({
        ...prev,
        online: false,
      }));
    }
  };

  useEffect(() => {
    fetchWatchData();
    const interval = setInterval(fetchWatchData, 1200);
    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = (battery) => {
    if (battery > 60) return { label: 'Excellent 💚', color: 'text-emerald-400' };
    if (battery > 30) return { label: 'Normal 💛', color: 'text-yellow-400' };
    return { label: 'LOW 🚨', color: 'text-red-400' };
  };

  const health = getHealthStatus(data.battery);

  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    setEnquirySent(true);
    setTimeout(() => {
      setEnquirySent(false);
      setIsEnquiryOpen(false);
      setEnquiryText('');
    }, 2000);
  };

  return (
    <div
      className="min-h-screen w-full pt-[100px] pb-12 px-4 md:px-8"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.75)), url('/BATTERY.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>WEARABLE HARDWARE DIAGNOSTICS</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-wide drop-shadow-[0_0_25px_#00eaff]">
            WATCH STATUS
          </h1>
          <p className="text-xs md:text-sm text-gray-300">
            Real-time power management and gateway connectivity metrics.
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Battery Level */}
          <div className="glass-panel p-6 flex flex-col items-center justify-center text-center hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_0_35px_#00eaff]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_#00eaff] mb-4">
              <Battery className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-semibold text-gray-300">Battery Level</h3>
            <div className="mt-2 text-3xl font-extrabold text-white font-mono">
              {data.battery}%
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, data.battery))}%` }}
              ></div>
            </div>
          </div>

          {/* Card 2: Signal Strength */}
          <div className="glass-panel p-6 flex flex-col items-center justify-center text-center hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_0_35px_#00eaff]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_#00eaff] mb-4">
              <Wifi className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-semibold text-gray-300">Signal Strength</h3>
            <div className="mt-2 text-2xl font-bold text-cyan-300 font-mono">
              {data.signal}
            </div>
            <span className="text-[11px] text-gray-400 mt-2">LoRa + GSM Fallback</span>
          </div>

          {/* Card 3: Charging */}
          <div className="glass-panel p-6 flex flex-col items-center justify-center text-center hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_0_35px_#00eaff]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_#00eaff] mb-4">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-semibold text-gray-300">Charging</h3>
            <div className="mt-2 text-2xl font-bold text-white font-mono">
              {data.charging ? 'YES ⚡' : 'NO'}
            </div>
            <span className="text-[11px] text-gray-400 mt-2">LiPo Battery Controller</span>
          </div>

          {/* Card 4: Device Health */}
          <div className="glass-panel p-6 flex flex-col items-center justify-center text-center hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_0_35px_#00eaff]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_#00eaff] mb-4">
              <HeartPulse className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-semibold text-gray-300">Device Health</h3>
            <div className={`mt-2 text-2xl font-bold font-mono ${health.color}`}>
              {health.label}
            </div>
            <span className="text-[11px] text-gray-400 mt-2">Internal Diagnostics</span>
          </div>

          {/* Card 5: ESP32 Status */}
          <div className="glass-panel p-6 flex flex-col items-center justify-center text-center hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_0_35px_#00eaff]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_#00eaff] mb-4">
              <Radio className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-semibold text-gray-300">ESP32 Gateway</h3>
            <div
              className={`mt-2 text-2xl font-bold font-mono ${
                data.online ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {data.online ? 'ONLINE 🟢' : 'OFFLINE 🔴'}
            </div>
            <span className="text-[11px] text-gray-400 mt-2">MQTT Broker Synced</span>
          </div>

          {/* Card 6: Last Update */}
          <div className="glass-panel p-6 flex flex-col items-center justify-center text-center hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_0_35px_#00eaff]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_#00eaff] mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-semibold text-gray-300">Last Telemetry Ping</h3>
            <div className="mt-2 text-xl font-bold text-white font-mono">
              {data.time}
            </div>
            <span className="text-[11px] text-gray-400 mt-2">Sub-second Latency</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setIsEnquiryOpen(true)}
            className="btn-primary-glow"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Support & Enquiry</span>
          </button>

          <button onClick={() => navigate('/dashboard')} className="btn-secondary-glass">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Enquiry Modal */}
      {isEnquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900/90 border border-white/20 p-6 shadow-2xl text-white">
            <button
              onClick={() => setIsEnquiryOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold flex items-center gap-2 text-cyan-300">
              <HelpCircle className="w-6 h-6 text-cyan-400" />
              Device Help & Enquiry
            </h3>
            <p className="text-xs text-gray-300 mt-1">
              Have questions about your KAVACH wearable or need technical support?
            </p>

            {enquirySent ? (
              <div className="mt-6 p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-emerald-300">Enquiry Submitted!</h4>
                <p className="text-xs text-gray-300">Our safety support team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Describe your query or issue:
                  </label>
                  <textarea
                    rows="4"
                    required
                    value={enquiryText}
                    onChange={(e) => setEnquiryText(e.target.value)}
                    placeholder="e.g. Inquiring about geo-fence radius or battery life optimization..."
                    className="w-full rounded-xl bg-white/10 border border-white/20 p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  ></textarea>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEnquiryOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-sm font-bold shadow-[0_0_15px_#00eaff] transition"
                  >
                    Send Query
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
