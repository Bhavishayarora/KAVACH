import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  Activity,
  MapPin,
  Compass,
  Waves,
  ShieldCheck,
  AlertOctagon,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { getTelemetry } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function HealthMonitor() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    LAT: 28.6139,
    LON: 77.209,
    X: 120,
    Y: -45,
    Z: 980,
  });

  const [motion, setMotion] = useState(988);
  const [status, setStatus] = useState('SAFE 🟢');
  const [isFall, setIsFall] = useState(false);

  const [chartHistory, setChartHistory] = useState({
    labels: Array.from({ length: 10 }, (_, i) => `${10 - i}s ago`),
    values: Array(10).fill(988),
  });

  const updateTelemetry = async () => {
    try {
      const telemetry = await getTelemetry();
      setData(telemetry);

      const x = Number(telemetry.X) || 0;
      const y = Number(telemetry.Y) || 0;
      const z = Number(telemetry.Z) || 0;
      const currentMotion = Math.round(Math.sqrt(x * x + y * y + z * z));
      setMotion(currentMotion);

      if (currentMotion > 25000) {
        setStatus('FALL ALERT 🔴');
        setIsFall(true);
      } else {
        setStatus('SAFE 🟢');
        setIsFall(false);
      }

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setChartHistory((prev) => {
        const nextLabels = [...prev.labels.slice(1), now];
        const nextValues = [...prev.values.slice(1), currentMotion];
        return { labels: nextLabels, values: nextValues };
      });
    } catch (err) {
      setStatus('DEVICE OFFLINE 🔴');
    }
  };

  useEffect(() => {
    updateTelemetry();
    const interval = setInterval(updateTelemetry, 1500);
    return () => clearInterval(interval);
  }, []);

  const simulateFallImpact = () => {
    const highMotion = 28500;
    setMotion(highMotion);
    setStatus('FALL ALERT 🔴');
    setIsFall(true);
    setChartHistory((prev) => ({
      labels: [...prev.labels.slice(1), new Date().toLocaleTimeString()],
      values: [...prev.values.slice(1), highMotion],
    }));

    // Auto-recover after 4 seconds for testing
    setTimeout(() => {
      setIsFall(false);
      setStatus('SAFE 🟢');
    }, 4000);
  };

  const chartData = {
    labels: chartHistory.labels,
    datasets: [
      {
        label: 'Motion Magnitude',
        data: chartHistory.values,
        borderColor: isFall ? '#ef4444' : '#00eaff',
        backgroundColor: isFall ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 234, 255, 0.15)',
        borderWidth: 3,
        pointBackgroundColor: isFall ? '#ef4444' : '#00eaff',
        pointBorderColor: '#ffffff',
        pointRadius: 4,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#00eaff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(0, 234, 255, 0.3)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 11 } },
      },
    },
  };

  return (
    <div
      className="min-h-screen w-full pt-[100px] pb-12 px-4 md:px-8"
      style={{
        backgroundImage: "linear-gradient(rgba(10, 15, 30, 0.75), rgba(10, 15, 30, 0.85)), url('/HEALTH1.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>AI VIGILANCE TELEMETRY</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-wide drop-shadow-[0_0_25px_#00eaff]">
            CHILD HEALTH AI
          </h1>
          <p className="text-sm text-gray-300 max-w-xl mx-auto">
            Autonomous sensor readings for fall detection, IMU orientation, and movement frequency.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: GPS */}
          <div className="glass-panel p-6 flex flex-col items-center justify-center text-center hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_0_35px_#00eaff]">
            <MapPin className="w-10 h-10 text-[#00eaff] mb-3" />
            <h3 className="text-xs uppercase tracking-widest text-gray-300 font-semibold">GPS Coordinates</h3>
            <div className="mt-3 text-lg font-bold text-white font-mono space-y-0.5">
              <div>LAT: <span className="text-cyan-300">{data.LAT ?? '--'}</span></div>
              <div>LON: <span className="text-cyan-300">{data.LON ?? '--'}</span></div>
            </div>
          </div>

          {/* Card 2: Accelerometer */}
          <div className="glass-panel p-6 flex flex-col items-center justify-center text-center hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_0_35px_#00eaff]">
            <Compass className="w-10 h-10 text-[#00eaff] mb-3" />
            <h3 className="text-xs uppercase tracking-widest text-gray-300 font-semibold">Accelerometer (6-Axis)</h3>
            <div className="mt-3 text-base font-bold text-white font-mono flex items-center justify-center gap-3">
              <div>X: <span className="text-cyan-300">{data.X ?? '--'}</span></div>
              <div>Y: <span className="text-cyan-300">{data.Y ?? '--'}</span></div>
              <div>Z: <span className="text-cyan-300">{data.Z ?? '--'}</span></div>
            </div>
          </div>

          {/* Card 3: Movement */}
          <div className="glass-panel p-6 flex flex-col items-center justify-center text-center hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_0_35px_#00eaff]">
            <Waves className="w-10 h-10 text-[#00eaff] mb-3" />
            <h3 className="text-xs uppercase tracking-widest text-gray-300 font-semibold">Movement Index</h3>
            <div className="mt-3 text-3xl font-extrabold text-white font-mono drop-shadow-[0_0_15px_#00eaff]">
              {motion}
            </div>
          </div>

          {/* Card 4: Health Status */}
          <div
            className={`glass-panel p-6 flex flex-col items-center justify-center text-center hover:-translate-y-2 transition-transform duration-300 ${
              isFall ? 'border-red-500/70 shadow-[0_0_40px_rgba(239,68,68,0.7)]' : 'hover:shadow-[0_0_35px_#10b981]'
            }`}
          >
            {isFall ? (
              <AlertOctagon className="w-10 h-10 text-red-500 mb-3 animate-bounce" />
            ) : (
              <ShieldCheck className="w-10 h-10 text-emerald-400 mb-3" />
            )}
            <h3 className="text-xs uppercase tracking-widest text-gray-300 font-semibold">Status</h3>
            <div
              className={`mt-3 text-2xl font-black font-mono ${
                isFall ? 'text-red-400 animate-pulse' : 'text-emerald-400'
              }`}
            >
              {status}
            </div>
          </div>
        </div>

        {/* Real-Time Graph Section */}
        <div className="glass-panel p-6 md:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#00eaff]" />
                Live Motion Dynamics
              </h2>
              <p className="text-xs text-gray-300">Continuous 1.5-second sampling of IMU magnitude vector.</p>
            </div>

            {/* Test Simulation Trigger */}
            <button
              onClick={simulateFallImpact}
              className="px-3.5 py-1.5 rounded-full bg-red-600/30 hover:bg-red-600/60 border border-red-500/60 text-xs font-semibold text-red-200 transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              Simulate High Impact / Fall
            </button>
          </div>

          <div className="h-[280px] w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Navigation & Controls */}
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
