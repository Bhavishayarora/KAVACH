import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, Home, Activity, MapPin, BatteryMedium, PhoneCall, Bell, Gamepad2, AlertTriangle } from 'lucide-react';

export default function Navbar({ onOpenSOS }) {
  return (
    <nav className="fixed top-3 md:top-4 left-1/2 -translate-x-1/2 w-[94%] max-w-7xl h-[64px] md:h-[60px] px-4 md:px-6 flex items-center justify-between rounded-[40px] border border-blue-800 bg-transparent z-50 transition-all">
      {/* Brand Logo */}
      <NavLink to="/dashboard" className="flex items-center gap-3 text-white no-underline group">
        <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-blue-400/40 flex items-center justify-center shadow-[0_0_15px_#00eaff] translate-x-2">
          <ShieldAlert className="w-6 h-6 text-[#0a57d4] group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-xl tracking-wider text-white flex items-center gap-1.5 font-['Fredoka']">
            KAVACH 
          </span>
          <span className="text-[10px] text-white font-medium tracking-widest uppercase">Child Safety Hub</span>
        </div>
      </NavLink>

      {/* Navigation Links */}
      <div className="hidden lg:flex items-center gap-6 text-sm font-semibold">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-1.5 transition-all duration-200 ${
              isActive ? 'text-[#2843b3] drop-shadow-[0_10_100px_black]' : 'text-gray-200 hover:text-black hover:-translate-y-0.5'
            }`
          }
        >
        <Home className="w-4 h-4 text-[#2843b3] drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
          Home
        </NavLink>

        <NavLink
          to="/gps"
          className={({ isActive }) =>
            `flex items-center gap-1.5 transition-all duration-200 ${
              isActive ? 'text-[#2843b3] drop-shadow-[0_0_10px_#00eaff]' : 'text-white hover:text-black hover:-translate-y-0.5'
            }`
          }
        >
          <Activity className="w-4 h-4 text-white" />
          Health AI
        </NavLink>

        <NavLink
          to="/location"
          className={({ isActive }) =>
            `flex items-center gap-1.5 transition-all duration-200 ${
              isActive ? 'text-[#2843b3] drop-shadow-[0_0_10px_#00eaff]' : 'text-white hover:text-black hover:-translate-y-0.5'
            }`
          }
        >
          <MapPin className="w-4 h-4 text-white" />
          Location
        </NavLink>

        <NavLink
          to="/battery"
          className={({ isActive }) =>
            `flex items-center gap-1.5 transition-all duration-200 ${
              isActive ? 'text-[#2843b3] drop-shadow-[0_0_10px_#00eaff]' : 'text-gray-200 hover:text-black hover:-translate-y-0.5'
            }`
          }
        >
          <BatteryMedium className="w-4 h-4 text-white" />
          Device
        </NavLink>

        <NavLink
          to="/contact"
          className={({ isActive }) =>
            `flex items-center gap-1.5 transition-all duration-200 ${
              isActive ? 'text-[#2843b3] drop-shadow-[0_0_30px_#00eaff]' : 'text-gray-200 hover:text-black hover:-translate-y-0.5'
            }`
          }
        >
          <PhoneCall className="w-4 h-4 text-white" />
          Contacts
        </NavLink>

        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            `flex items-center gap-1.5 transition-all duration-200 ${
              isActive ? 'text-[#2843b3] drop-shadow-[0_0_10px_#00eaff]' : 'text-gray-200 hover:text-black hover:-translate-y-0.5'
            }`
          }
        >
          <Bell className="w-4 h-4 text-white" />
          Alerts
        </NavLink>

        <NavLink
          to="/quiz"
          className={({ isActive }) =>
            `flex items-center gap-1.5 transition-all duration-200 ${
              isActive ? 'text-[#2843b3] drop-shadow-[0_0_10px_#00eaff]' : 'text-gray-200 hover:text-black hover:-translate-y-0.5'
            }`
          }
        >
          <Gamepad2 className="w-4 h-4 text-white" />
          Quiz
        </NavLink>
      </div>

      {/* SOS Button */}
      <button
        onClick={onOpenSOS}
        className="btn-sos text-sm tracking-wider uppercase font-bold -translate-x-2"
        title="Activate SOS Emergency Signal"
      >
        <AlertTriangle className="w-4 h-4 animate-bounce" />
        <span>SOS ALERT</span>
      </button>
    </nav>
  );
}
