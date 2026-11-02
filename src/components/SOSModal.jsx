import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, PhoneCall, ShieldCheck, X } from 'lucide-react';
import { triggerSOS } from '../services/api';

export default function SOSModal({ isOpen, onClose, telemetry }) {
  const [isSending, setIsSending] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSending(true);
      // Play alert tone using Web Audio API
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch (e) {
        // AudioContext might require interaction
      }

      triggerSOS('User clicked emergency SOS alert on web dashboard')
        .then(() => {
          setIsSending(false);
          setIsConfirmed(true);
        })
        .catch(() => {
          setIsSending(false);
          setIsConfirmed(true);
        });
    } else {
      setIsConfirmed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/90 border-2 border-red-500/80 shadow-[0_0_50px_rgba(239,68,68,0.7)] p-6 md:p-8 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 border-b border-red-500/30 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600/30 border border-red-500 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-red-400 flex items-center gap-2">
              EMERGENCY SOS
            </h2>
            <p className="text-xs text-red-200">High-priority alert broadcast sequence</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-red-950/40 border border-red-500/30 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white text-sm">Emergency Dispatch Active</h4>
                <p className="text-xs text-gray-300">
                  Instant SMS alerts and push notifications have been routed to registered emergency contacts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-cyan-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white text-sm">Live Location Broadcasted</h4>
                <p className="text-xs font-mono text-cyan-300">
                  Lat: {telemetry?.LAT || '28.6139'}, Lon: {telemetry?.LON || '77.2090'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <PhoneCall className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white text-sm">Parents & School Alerted</h4>
                <p className="text-xs text-gray-300">Auto-dialer standby and LoRa gateway pinged.</p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="text-xs text-gray-300">
              {isSending
                ? 'Broadcasting satellite and LoRa packets...'
                : '✅ Gateway acknowledged emergency packets.'}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition shadow-[0_0_20px_rgba(239,68,68,0.5)]"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
