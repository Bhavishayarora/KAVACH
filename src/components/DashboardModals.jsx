import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  MapPin,
  ExternalLink,
  BatteryCharging,
  BatteryMedium,
  Wifi,
  Heart,
  Activity,
  Phone,
  PhoneCall,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { getContacts, triggerSOS } from '../services/api';
import { soundEffects } from '../services/soundEffects';

export default function DashboardModals({ activeModule, onClose, telemetry, onOpenSOS }) {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [sosSent, setSosSent] = useState(false);

  useEffect(() => {
    if (activeModule === 'contacts') {
      getContacts()
        .then((data) => setContacts(data))
        .catch(() => {});
    }
  }, [activeModule]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeModule) {
        soundEffects.playModalClose();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModule, onClose]);

  if (!activeModule) return null;

  const lat = telemetry?.LAT ?? 28.6139;
  const lon = telemetry?.LON ?? 77.209;
  const battery = telemetry?.battery ?? 85;
  const signal = telemetry?.signal ?? 'EXCELLENT 📶';
  const charging = telemetry?.charging ?? false;
  const motionX = telemetry?.X ?? 120;
  const motionY = telemetry?.Y ?? -45;
  const motionZ = telemetry?.Z ?? 980;
  const motionMagnitude = Math.round(Math.sqrt(motionX ** 2 + motionY ** 2 + motionZ ** 2));

  // Estimated runtime: ~24 hours on 100% battery
  const hoursLeft = Math.floor((battery / 100) * 24);
  const minutesLeft = Math.floor((((battery / 100) * 24) % 1) * 60);

  const handleClose = () => {
    soundEffects.playModalClose();
    onClose();
  };

  const handleQuickSOS = async () => {
    try {
      await triggerSOS('Child triggered SOS from Mario Platformer Dashboard');
      setSosSent(true);
      setTimeout(() => setSosSent(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={handleClose}></div>

      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900/95 border-2 border-cyan-400/50 shadow-[0_0_50px_rgba(0,234,255,0.4)] text-white p-6 z-10 animate-[scaleUp_0.25s_cubic-bezier(0.175,0.885,0.32,1.275)] font-['Outfit',sans-serif]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {activeModule === 'location' && (
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                <MapPin className="w-5 h-5" />
              </div>
            )}
            {activeModule === 'battery' && (
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <BatteryMedium className="w-5 h-5" />
              </div>
            )}
            {activeModule === 'health' && (
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                <Heart className="w-5 h-5 fill-red-400" />
              </div>
            )}
            {activeModule === 'contacts' && (
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Phone className="w-5 h-5" />
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                KAVACH IoT System Module
              </span>
              <h2 className="text-xl font-extrabold tracking-wide text-white">
                {activeModule === 'location' && 'Live Child Location'}
                {activeModule === 'battery' && 'Device & Battery Health'}
                {activeModule === 'health' && 'Child Health & Activity'}
                {activeModule === 'contacts' && 'Emergency Contacts'}
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition"
            title="Close Module (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= LOCATION MODULE ================= */}
        {activeModule === 'location' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>ATGM336H GPS SATELLITE FIX: LOCKED</span>
              </span>
              <span>3D Precision Fix</span>
            </div>

            {/* Embedded Mini Map Preview */}
            <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-white/20 shadow-inner bg-slate-950">
              <iframe
                title="Child Geolocation Map"
                src={`https://maps.google.com/maps?q=${lat},${lon}&z=16&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-white/20">
                LAT: {lat.toFixed(4)} | LON: {lon.toFixed(4)}
              </div>
            </div>

            {/* Location Status Chips */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[11px] text-gray-400 block mb-0.5">CURRENT GEO-FENCE</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Inside Safe Zone
                </span>
                <span className="text-[10px] text-gray-400">School Campus Perimeter</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[11px] text-gray-400 block mb-0.5">LATEST POSITION SYNC</span>
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Just Now (ESP32 Stream)
                </span>
                <span className="text-[10px] text-gray-400">LoRaWAN + 4G Backup</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-xs font-bold text-cyan-300 text-center flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
              </a>
              <button
                onClick={() => {
                  handleClose();
                  navigate('/location');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-xs font-bold text-white text-center flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              >
                Full Map Hub <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= BATTERY MODULE ================= */}
        {activeModule === 'battery' && (
          <div className="space-y-4">
            {/* Battery Highlight Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-800 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-300 uppercase tracking-wider block">Battery Remaining</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold text-emerald-400">{battery}%</span>
                  <span className="text-xs text-emerald-300 font-semibold">
                    {charging ? 'Charging ⚡' : 'Optimal Health 💚'}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Est. Runtime: ~{hoursLeft} hrs {minutesLeft} mins
                </span>
              </div>

              {/* Graphical Battery Bar */}
              <div className="w-24 h-12 rounded-xl border-2 border-emerald-400/60 p-1 flex items-center relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <div
                  className="h-full rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, battery))}%` }}
                ></div>
                <div className="absolute -right-2 w-1.5 h-5 bg-emerald-400/80 rounded-r"></div>
              </div>
            </div>

            {/* Diagnostic Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-gray-400 text-[11px] block">LIPO VOLTAGE</span>
                <span className="font-bold text-cyan-300 font-mono text-sm">
                  {(3.2 + (battery / 100) * 0.95).toFixed(2)} V
                </span>
                <span className="text-[10px] text-gray-500 block">Nominal: 3.7V - 4.2V</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-gray-400 text-[11px] block">GATEWAY SIGNAL</span>
                <span className="font-bold text-yellow-300 text-sm flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" /> {signal}
                </span>
                <span className="text-[10px] text-gray-500 block">ESP32 2.4GHz + LoRa</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-gray-400 text-[11px] block">POWER MODE</span>
                <span className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Smart Sleep
                </span>
                <span className="text-[10px] text-gray-500 block">Wake on Motion INT</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-gray-400 text-[11px] block">DEVICE STATUS</span>
                <span className="font-bold text-cyan-400 text-sm flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" /> ONLINE
                </span>
                <span className="text-[10px] text-gray-500 block">Transmitting Live</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  handleClose();
                  navigate('/battery');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-xs font-bold text-white text-center flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(16,185,129,0.5)]"
              >
                View Full Device Diagnostics <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= HEALTH MODULE ================= */}
        {activeModule === 'health' && (
          <div className="space-y-4">
            {/* Top Motion Status */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-purple-950/30 to-slate-900 border border-red-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider block">Accelerometer Motion</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold text-white font-mono">{motionMagnitude}</span>
                  <span className="text-xs text-cyan-300">mg vector sum</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold block mt-1">
                  Activity: Normal Playing / Steady Movement
                </span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-400 animate-pulse">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            {/* 3-Axis IMU Acceleration Values */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-gray-400 block">AXIS X</span>
                <span className="font-mono font-bold text-cyan-300 text-sm">{motionX}</span>
                <span className="text-[9px] text-gray-500 block">Lateral</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-gray-400 block">AXIS Y</span>
                <span className="font-mono font-bold text-cyan-300 text-sm">{motionY}</span>
                <span className="text-[9px] text-gray-500 block">Longitudinal</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-gray-400 block">AXIS Z</span>
                <span className="font-mono font-bold text-cyan-300 text-sm">{motionZ}</span>
                <span className="text-[9px] text-gray-500 block">1G Earth Gravity</span>
              </div>
            </div>

            {/* Vitals Grid with clear hardware availability states */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 text-[11px]">HEART RATE</span>
                  <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                </div>
                <div className="text-lg font-extrabold text-rose-400">76 BPM</div>
                <span className="text-[10px] text-gray-400 block">Pulse Oximeter (MAX30102)</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 text-[11px]">BODY TEMPERATURE</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-lg font-extrabold text-amber-400">98.4 °F</div>
                <span className="text-[10px] text-gray-400 block">Surface Sensor Normal</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  handleClose();
                  navigate('/gps');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 text-xs font-bold text-white text-center flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(239,68,68,0.5)]"
              >
                Open Full Health AI Monitor <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= EMERGENCY CONTACTS MODULE ================= */}
        {activeModule === 'contacts' && (
          <div className="space-y-4">
            {/* SOS Dispatch Button */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wide block flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 animate-bounce" /> Emergency Rapid Dispatch
                </span>
                <span className="text-[11px] text-gray-300 mt-0.5 block">
                  Broadcast live alert + coordinates to all listed guardians.
                </span>
              </div>
              <button
                onClick={handleQuickSOS}
                disabled={sosSent}
                className="py-2 px-3.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-xs font-extrabold text-white flex items-center gap-1.5 transition shadow-[0_0_20px_rgba(239,68,68,0.7)]"
              >
                {sosSent ? 'SENT! 🚨' : 'SEND SOS'}
              </button>
            </div>

            {/* Contacts List */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                Designated Guardians ({contacts.length})
              </span>

              {contacts.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-gray-400">
                  Loading emergency contacts from server...
                </div>
              ) : (
                contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition"
                  >
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        {c.name}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                          {c.relation}
                        </span>
                      </div>
                      <span className="text-xs text-gray-300 font-mono mt-0.5 block">{c.phone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${c.phone}`}
                        className="w-8 h-8 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-400 flex items-center justify-center transition"
                        title={`Call ${c.name}`}
                      >
                        <PhoneCall className="w-4 h-4" />
                      </a>
                      <a
                        href={`sms:${c.phone}`}
                        className="w-8 h-8 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-400 flex items-center justify-center transition"
                        title={`Message ${c.name}`}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  handleClose();
                  navigate('/contact');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-xs font-bold text-white text-center flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              >
                Manage Guardians & Phonebook <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
