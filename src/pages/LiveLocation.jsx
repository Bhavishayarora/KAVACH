import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, ArrowLeft, ExternalLink, Satellite } from 'lucide-react';
import { getTelemetry } from '../services/api';

export default function LiveLocation() {
  const navigate = useNavigate();
  const [coords, setCoords] = useState({
    lat: 28.6139,
    lon: 77.209,
  });
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());
  const [isLoading, setIsLoading] = useState(true);

  const fetchLocation = async () => {
    try {
      const data = await getTelemetry();
      if (data && data.LAT && data.LON) {
        setCoords({ lat: data.LAT, lon: data.LON });
        setLastSync(new Date().toLocaleTimeString());
      }
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
    const interval = setInterval(fetchLocation, 2000);
    return () => clearInterval(interval);
  }, []);

  const googleMapsUrl = `https://maps.google.com/maps?q=${coords.lat},${coords.lon}&z=17&output=embed`;
  const externalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lon}`;

  return (
    <div className="min-h-screen w-full pt-[100px] pb-12 px-4 md:px-8 bg-gradient-to-b from-cyan-950/80 via-slate-900 to-black flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-semibold">
            <Satellite className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>ATGM336H GNSS SATELLITE FIX</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-wide drop-shadow-[0_0_25px_#00eaff]">
            📍 Child Live Location
          </h1>
          <p className="text-xs md:text-sm text-gray-300">
            Real-time geolocation streamed via LoRaWAN & Cellular Gateway backup.
          </p>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border-4 border-white/80 shadow-[0_0_40px_rgba(0,234,255,0.4)] bg-slate-900">
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-cyan-300">
              <Navigation className="w-10 h-10 animate-spin" />
              <span className="font-semibold text-lg">Acquiring GPS Fix...</span>
            </div>
          ) : (
            <iframe
              title="Child Live GPS Map"
              src={googleMapsUrl}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}

          {/* Floating Telemetry Overlay on Map */}
          <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md p-4 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-white/20 shadow-2xl text-white space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                🛰 ESP32 GPS LIVE
              </span>
              <span className="text-[11px] text-gray-400">Updated: {lastSync}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-gray-400 block text-[10px]">LATITUDE</span>
                <span className="font-bold text-cyan-300">{coords.lat}</span>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-gray-400 block text-[10px]">LONGITUDE</span>
                <span className="font-bold text-cyan-300">{coords.lon}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={externalMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400/50 text-xs font-semibold text-cyan-200 text-center flex items-center justify-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open in Google Maps App
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary-glass">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
