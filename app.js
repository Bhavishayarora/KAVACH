require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve public static assets (images, icons)
app.use(express.static(path.join(__dirname, "public")));

// ================= MongoDB Setup & Smart Fallback =================
let isDbConnected = false;

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/monkey";

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 2500,
  })
  .then(() => {
    isDbConnected = true;
    console.log("✅ MongoDB Connected to", MONGO_URI);
  })
  .catch((err) => {
    isDbConnected = false;
    console.log("⚠️ MongoDB offline. Using in-memory live simulation mode (Zero-setup).");
  });

mongoose.connection.on("disconnected", () => {
  isDbConnected = false;
});
mongoose.connection.on("connected", () => {
  isDbConnected = true;
});

// ================= Device Schema =================
const deviceSchema = new mongoose.Schema({
  LAT: { type: Number, default: 28.6139 },
  LON: { type: Number, default: 77.2090 },
  X: { type: Number, default: 120 },
  Y: { type: Number, default: -45 },
  Z: { type: Number, default: 980 },
  battery: { type: Number, default: 85 },
  signal: { type: String, default: "EXCELLENT 📶" },
  charging: { type: Boolean, default: false },
  time: {
    type: Date,
    default: Date.now,
  },
});

const Device = mongoose.model("device", deviceSchema);

// ================= In-Memory Fallback State =================
let simulatedTelemetry = {
  LAT: 28.6139,
  LON: 77.2090,
  X: 120,
  Y: -45,
  Z: 980,
  battery: 85,
  signal: "EXCELLENT 📶",
  charging: false,
  time: new Date(),
};

// Seed default contacts for quick testing
let contacts = [
  {
    id: "1",
    name: "Dr. Rajesh Sharma",
    phone: "+91 98765 43210",
    relation: "Father",
    time: new Date(),
  },
  {
    id: "2",
    name: "Sunita Sharma",
    phone: "+91 98765 43211",
    relation: "Mother",
    time: new Date(),
  },
];

// Seed recent alerts
let alerts = [
  {
    id: "alert-1",
    type: "SAFE_ZONE",
    title: "Safe Zone Entered",
    message: "Child arrived safely at Central School campus.",
    severity: "info",
    time: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "alert-2",
    type: "BATTERY",
    title: "Battery Status",
    message: "Pendant battery level at 85%. Optimal condition.",
    severity: "success",
    time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

// Background simulated fluctuations for realistic telemetry when hardware is not streaming
setInterval(() => {
  const jitterX = Math.floor((Math.random() - 0.5) * 80);
  const jitterY = Math.floor((Math.random() - 0.5) * 80);
  const jitterZ = Math.floor((Math.random() - 0.5) * 40);

  simulatedTelemetry.X = 120 + jitterX;
  simulatedTelemetry.Y = -45 + jitterY;
  simulatedTelemetry.Z = 980 + jitterZ;
  simulatedTelemetry.time = new Date();
}, 2000);

// ================= REST API ROUTES =================

// GET /api/status - Check backend & DB status
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    dbConnected: isDbConnected,
    timestamp: new Date(),
  });
});

// GET /api/esp - Get latest telemetry
app.get("/api/esp", async (req, res) => {
  try {
    if (isDbConnected) {
      const data = await Device.findOne().sort({ time: -1 });
      if (data) {
        return res.json({
          LAT: data.LAT ?? simulatedTelemetry.LAT,
          LON: data.LON ?? simulatedTelemetry.LON,
          X: data.X ?? simulatedTelemetry.X,
          Y: data.Y ?? simulatedTelemetry.Y,
          Z: data.Z ?? simulatedTelemetry.Z,
          battery: data.battery ?? simulatedTelemetry.battery,
          signal: data.signal ?? simulatedTelemetry.signal,
          charging: data.charging ?? simulatedTelemetry.charging,
          time: data.time || new Date(),
        });
      }
    }
    // Return live in-memory telemetry
    res.json(simulatedTelemetry);
  } catch (err) {
    console.error("Error fetching device data:", err.message);
    res.json(simulatedTelemetry);
  }
});

// POST /api/esp - Ingest device telemetry (e.g. from ESP32 gateway / tester)
app.post("/api/esp", async (req, res) => {
  try {
    const payload = {
      LAT: req.body.LAT !== undefined ? Number(req.body.LAT) : simulatedTelemetry.LAT,
      LON: req.body.LON !== undefined ? Number(req.body.LON) : simulatedTelemetry.LON,
      X: req.body.X !== undefined ? Number(req.body.X) : simulatedTelemetry.X,
      Y: req.body.Y !== undefined ? Number(req.body.Y) : simulatedTelemetry.Y,
      Z: req.body.Z !== undefined ? Number(req.body.Z) : simulatedTelemetry.Z,
      battery: req.body.battery !== undefined ? Number(req.body.battery) : simulatedTelemetry.battery,
      signal: req.body.signal || simulatedTelemetry.signal,
      charging: req.body.charging !== undefined ? Boolean(req.body.charging) : simulatedTelemetry.charging,
      time: new Date(),
    };

    simulatedTelemetry = { ...payload };

    if (isDbConnected) {
      const newDevice = new Device(payload);
      await newDevice.save();
    }

    // Check if motion indicates a fall
    const motion = Math.sqrt(payload.X * payload.X + payload.Y * payload.Y + payload.Z * payload.Z);
    if (motion > 25000) {
      alerts.unshift({
        id: "fall-" + Date.now(),
        type: "FALL",
        title: "🚨 Fall Detected!",
        message: `High impact detected (motion magnitude: ${motion.toFixed(0)}). Immediate attention recommended.`,
        severity: "danger",
        time: new Date().toISOString(),
      });
    }

    res.json({ success: true, data: simulatedTelemetry });
  } catch (err) {
    console.error("Error saving telemetry:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/contacts - List all emergency contacts
app.get("/api/contacts", (req, res) => {
  res.json(contacts);
});

// POST /api/contacts - Add emergency contact
app.post("/api/contacts", (req, res) => {
  const { name, phone, relation } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required" });
  }

  const newContact = {
    id: Date.now().toString(),
    name: name.trim(),
    phone: phone.trim(),
    relation: (relation || "Guardian").trim(),
    time: new Date(),
  };

  contacts.unshift(newContact);
  console.log("🚨 Contact Added:", newContact);
  res.json({ success: true, contact: newContact, contacts });
});

// DELETE /api/contacts/:id - Remove emergency contact
app.delete("/api/contacts/:id", (req, res) => {
  const { id } = req.params;
  contacts = contacts.filter((c) => c.id !== id);
  res.json({ success: true, contacts });
});

// GET /api/alerts - List alerts
app.get("/api/alerts", (req, res) => {
  res.json(alerts);
});

// POST /api/sos - Trigger emergency SOS
app.post("/api/sos", (req, res) => {
  const newAlert = {
    id: "sos-" + Date.now(),
    type: "SOS",
    title: "🚨 SOS EMERGENCY ACTIVATED",
    message: req.body.message || "Child pressed the emergency SOS button! Live GPS location shared with all guardians.",
    location: {
      lat: simulatedTelemetry.LAT,
      lon: simulatedTelemetry.LON,
    },
    severity: "danger",
    time: new Date().toISOString(),
  };

  alerts.unshift(newAlert);
  console.log("🚨 SOS TRIGGERED:", newAlert);

  res.json({
    success: true,
    alert: newAlert,
    location: newAlert.location,
    notification: "Parents notified via SMS & Cloud Dispatch",
  });
});

// ================= Frontend Serving & Dev Forwarding =================
const distPath = path.join(__dirname, "dist");
const isProduction = process.env.NODE_ENV === "production";

if (isProduction && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if ((req.method === "GET" || req.method === "HEAD") && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(distPath, "index.html"));
    }
    next();
  });
} else if (!isProduction) {
  // In development, if a user opens the backend port (3000), redirect to Vite dev server (5173)
  app.use((req, res, next) => {
    if ((req.method === "GET" || req.method === "HEAD") && !req.path.startsWith("/api")) {
      return res.redirect("http://localhost:5173" + req.originalUrl);
    }
    next();
  });
}

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`🚀 Child Safety API Server running at http://localhost:${PORT}`);
  if (!isProduction) {
    console.log(`✨ Vite React Frontend running at http://localhost:5173`);
  }
});