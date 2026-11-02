# KAVACH
### Kids' Autonomous Vigilance and Communication Hub
 
**Suraksha • Shakti • Saath**
 
A next-generation smart safety wearable that keeps children safe, connected, and fearless — built for rural and semi-urban India, where poor GSM coverage and affordability are the biggest barriers to child-safety technology.
 
> Built for today. Inspired by courage.

  
## Table of Contents
 
- [Problem Statement](#problem-statement)
- [Hardware Implementation](#Hardware)
- [User-Interface](#User-Interface)
- [Market Research & Insights](#market-research--insights)
- [Existing Solutions & Gaps](#existing-solutions--gaps)
- [Design Requirements](#design-requirements)
- [System Architecture](#system-architecture)
- [Hardware Components (BOM)](#hardware-components-bom)
- [Power Management](#power-management)
- [Form Factor](#form-factor)
- [Prototype](#prototype)
- [Success Criteria](#success-criteria)
- [Impact Snapshot](#impact-snapshot)
- [Deployment & Scaling Strategy](#deployment--scaling-strategy)
- [Funding Model](#funding-model)
- [Challenges](#challenges)
- [Future Scope](#future-scope)
- [Running the Application (Vite + React)](#running-the-application-vite--react)
---
 
## Running the Application (Vite + React)

This project has been modernized to use **Vite + React 19** on the frontend and an **Express REST API** on the backend with zero-setup simulation fallback (no local MongoDB required to test).

```bash
# Start both Backend API and Vite React frontend concurrently:
npm run dev

# Or run them independently:
npm run dev:client   # Vite Frontend on http://localhost:5173
npm run dev:server   # Express API on http://localhost:3000

# Build for production:
npm run build
npm start            # Express serves production build from /dist
```

---
 
## Problem Statement
 
**How might we design a smart, affordable child-safety wearable for school-going children from low-income rural and urban households that remains reliable in poor GSM coverage and addresses children getting lost, school dropout/route deviation, and distress on rural roads?**
 
### Problem Understanding
- 90,000+ child kidnapping cases annually; rural/semi-urban children are most vulnerable during commutes.
- Commercial 4G trackers cost ₹7,000–₹10,000, beyond many low-income families.
- Poor GSM coverage breaks alert/location reliability where it is needed most.
- Parents lack timely visibility when a child is missing, delayed, off-route, or distressed.
- Silent injury or medical distress may go unnoticed during school travel.
### Critical Safety Gaps
| Gap | Description |
|---|---|
| A. Child gets lost | No reliable location awareness |
| B. School dropout / route deviation | Unmonitored deviations from safe routes |
| C. Child in distress on rural roads | No mechanism to raise an alert |
| D. Poor connectivity during emergencies | GSM/4G unreliable in rural areas |
| E. Unmonitored physical/medical distress | No health/vitals monitoring |
 
**Core focus:** Understanding the child-safety problem through affordability, weak-network reliability, and the need for timely awareness of lost, delayed, distressed, or medically vulnerable children.
 
---
## [Click to view Hardware Implementation](https://drive.google.com/file/d/1_ViYEi3zPdkb3iJHjHMLUKKWtFmMxVRQ/view?usp=drivesdk)
)
### Kid 's Side
<img width="392" height="221" alt="image" src="https://github.com/user-attachments/assets/d7de3d76-7df7-4e7d-a788-871b98adf6eb" />




### Parent Side
<img width="392" height="221" alt="image" src="https://github.com/user-attachments/assets/61eab471-c8ab-4a67-a68d-fd3387daca59" />




## [Click here to view user-interface Kaavach.com](https://child-safety-1.onrender.com/)
### Landing Page
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/c5310e9a-8512-49c9-8804-11bd6b429ba0" />

###  Home Page
<img width="1994" height="1123" alt="image" src="https://github.com/user-attachments/assets/aeec3f4d-188d-43bc-b7c6-eb89ddf3c7d3" />


###  GPS tracking and child live location
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1b13de63-ea21-4d30-8081-04ab331cde48" />


## Market Research & Insights
 
Survey conducted via Google Forms — **40+ responses from parents/guardians**.
 
| Insight | Finding |
|---|---|
| Preferred device type | ID Card Pendant (40%), Wrist Band (32.5%) |
| Tracking preference | 40% want tracking throughout the day, not just during commute |
| Top safety update needed | Live GPS Tracking (62.5%) |
| Payment willingness | ₹1,500 – ₹3,000 (majority) |
| Top barriers | Privacy concerns and cost |
 
**Overall insight:** Parents value real-time visibility, timely alerts, and child safety above all. A reliable, easy-to-use, and privacy-conscious GPS tracking device in an affordable range will strongly meet their needs.
 
---
 
## Existing Solutions & Gaps
 
| Product | Strengths | Why It Fails for This Use Case |
|---|---|---|
| **WachMe Kids Smartwatch** | Real-time GPS, two-way video calling, SOS button | 4G network dependency, high device cost, not rugged |
| **Tata Communications IoT Safety Watch** | LoRa-based (no SIM/4G), long battery (3–7 days), fall & immobility detection | No GPS tracking, enterprise-focused deployment, no tamper detection |
| **Generic GPS Trackers** (Concox, SinoTrack, LK106, TKSTAR) | Low upfront cost, GPS via SMS/app, compact | GSM dependency (poor rural coverage), short battery life (1–2 days), no tamper detection |
 
---
 
## Design Requirements
 
1. **Long-range LoRaWAN connectivity** — reliable communication in low-network/rural regions.
2. **5–7 day battery life** — for uninterrupted real-world use.
3. **Multi-mode SOS & alert system** — SOS button with SMS + app alerts for faster emergency response.
4. **Outdoor location tracking** — accurate GPS for fields, routes, and open environments.
5. **Tamper detection & alerts** — detect removal/tampering and instantly alert parents/authorities.
6. **Affordable solution** — low-cost hardware for rural families and large-scale adoption.
7. **Child-friendly & durable design** — lightweight, comfortable, rugged, and safe for everyday wear.
---
 
## System Architecture
 
### Flow and Overview
 
```
1. CHILD'S DEVICE
   ├─ GPS Tracker           → Real-time location
   ├─ Heart Rate Sensor     → Monitors heart rate
   ├─ FSR Force Sensor      → Detects force/pressure (tamper)
   ├─ Accelerometer         → Motion & activity / fall detection
   ├─ SOS Trigger           → Emergency alert button
   ├─ MCU                   → Device control unit
   ├─ LoRa Sender           → Sends data via LoRa
   └─ LiPo Battery          → Rechargeable power
 
        │  1 min interval (Normal Mode)
        │  30s interval (Emergency Mode)
        ▼
2. GATEWAY (LoRa + GSM)
   ├─ LoRa Gateway → Receives data from device
   └─ GSM Module   → Sends data to server via cellular network (fallback)
 
        │
        ▼
3. CLOUD SERVER
   ├─ MQTT Broker → Message handling
   └─ MongoDB     → Data storage
 
        │  every 15 min
        ▼
4. WEB / DASHBOARD
   ├─ Live Tracking
   ├─ History & Reports
   ├─ Alerts & Notifications
   └─ Device Management
 
5. PARENT NOTIFICATION (30s interval)
   └─ Instant SMS + vibration alert on emergency detection
```
 
---
 
## Hardware Components (BOM)
 
| Component | Function | Cost (₹) |
|---|---|---|
| **MSPM0L1116** | Low-power TI microcontroller; handles sensor reading, SOS detection, GPS/GSM/LoRa control, mode switching | 49.35 |
| **LSM6DSOQTR** | 6-axis IMU (accelerometer + gyroscope) for motion & fall detection; low-power motion interrupts | 154.00 |
| **SX1262S9S+T-X1** | Primary LoRa communication IC for long-range, low-power tracking without SIM dependency | 412.34 |
| **ATGM336H-7N-22** | GPS/GNSS module, activated only during tracking intervals/SOS to save power | 158.52 |
| **FSR402** | Force-sensitive resistor for wear/tamper detection | 120.00 |
| **TI AFE4404** | Optical biosensing front-end for heart-rate monitoring | 224.52 |
| **TL3305AF1600G (TL3305 Series)** | Manual SOS emergency trigger (tactile switch, long-press detection) | 10.00 |
| **SIMCom A7670C-LANV** | GSM/LTE backup communication module (activates only if LoRa fails) | 509.51 |
 
**Final prototype component cost: ₹1,638.24**
 
---
 
## Power Management
 
**Goal:** Stable voltage + low standby current + controlled emergency bursts, so SOS, fall, route-deviation, and health-anomaly alerts are never lost during transmission.
 
| Mode | Current Draw | Power | Notes |
|---|---|---|---|
| Normal / Idle | 2.5 mA | 8.25 mW | ~16.6 days runtime |
| Commute Tracking | 104 mA | 343 mW | ~9.6 hours runtime |
| Emergency (LoRa) | 372 mA | 1.23 W | Short alert burst |
| GSM Backup | 622 mA | 2.05 W | Only if LoRa fails |
 
---
 
## Form Factor
 
**One module. Two ways to wear.**
 
- **Pendant Mode** — ideal for younger children; worn under the uniform, safe & discreet.
- **Wristband Mode** — ideal for older children; easy SOS access, stylish & comfortable.
- **Removable core module** — snap it into either housing; switch anytime.
### Core Feature Set
- Live GPS Tracking
- LoRa + GSM Connectivity
- SOS Emergency Alert
- Fall Detection
- Tamper Detection
- Geo-fencing (Safe Zones)
- Long Battery Life
### How KAVACH Works
`Press SOS (discreet) → Alert sent via LoRa + GSM → Live location shared with parents/guardians → Instant notification & response`
 
---
 
## Prototype
 
- Simulated on **Wokwi** using an **ESP32** with GPS, accelerometer, push-button (SOS), and LED indicator modules to validate sensor logic and alert flow before hardware build.
- Physical breadboard prototype built with the sensor stack (GPS module, motion sensor, SOS button, indicators) wired to the MCU to validate hardware and firmware integration.
---
 
## Success Criteria
 
| Criterion | Target |
|---|---|
| Emergency Detection Accuracy | ≥ 95%, false-alarm rate below 5% |
| Alert Delivery Latency | ≤ 30 seconds (event trigger → LoRa transmission → GSM fallback) |
| Battery Life | ≥ 5–6 days across Normal + Commute + Emergency mode cycles |
| Communication Reliability | LoRa must deliver to gateway in range; GSM/SMS fallback activates if LoRa ack is absent |
| Physical Robustness & Comfort | IP55-rated or above, weighs < 50g, comfortable for daily wear |
 
---
 
## Impact Snapshot
 
- **187,702** crimes against children reported in 2024 — the highest in 10 years, with kidnapping/abduction accounting for 2 in every 5 cases.
- Over **51,100** children remain listed as unrecovered victims of kidnapping and abduction, of whom 78.7% are minor girls.
- **83,350** children were reported missing in 2022; only 80,561 were recovered or traced.
### Projected Scale Impact
| Metric | Projection |
|---|---|
| Rural & semi-urban taluks covered | ~4,000+ |
| Schools with secure gateway installed | ~9 lakh+ |
| Children protected | 100 million+ |
 
---
 
## Deployment & Scaling Strategy
 
### Device Cost per Unit — Reduction Journey
 
| Stage | Units | Gateways | Devices | Cost/Unit |
|---|---|---|---|---|
| Prototype | 1–10 | 1 | 10 | ₹3,700 |
| Pilot Deployment | ~100 | 5 | 100 | ₹2,600 |
| Block Deployment | ~500 | 15 | 500 | ₹2,200 |
| District Deployment | ~50,000 | 100 | 50,000 | ₹1,500 |
| Future Mass Production | 100,000+ | 100+ | 100,000+ | ₹1,200 – ₹1,300 |
 
**Key insight:** The number of gateways grows slowly while the number of children grows rapidly — infrastructure cost is shared across more users, reducing the effective cost per child. At mass production scale, component optimization, direct sourcing, and production efficiencies push cost down further.
 
---
 
## Funding Model
 
**CSR & PPP (Public-Private Partnership) Model** — designed for **zero cost to families**.
 
- Under **Section 135 of the Companies Act**, eligible companies fund social-impact initiatives through CSR. KAVACH aligns with child safety, education, and rural development objectives.
- **Government** provides access, permissions, and infrastructure.
- **CSR partners** provide funding and fast deployment.
- **KAVACH team** provides technology, installation, and maintenance.
### Aligned Government Schemes
- Nirbhaya Fund — Child Safety
- Samagra Shiksha — School Safety
- Mission Vatsalya — Child Protection
- Beti Bachao Beti Padhao — Girl Child Safety
Recurring annual public budgets ensure long-term sustainability beyond CSR pilots.
 
---
 
## Challenges
 
| Challenge | Description |
|---|---|
| **Financial Constraint** | Estimated device cost (~₹3,000) is high relative to average rural/semi-urban household income (₹5,000–₹10,000) after rent, loans, and EMIs. |
| **Trust Barrier** | Parents may be hesitant to use a tracking device due to privacy/safety concerns or unfamiliarity with the product's purpose. |
| **LoRa Gateway Implementation** | Large-scale rollout requires installing LoRa gateways in rural/sub-urban schools; school cooperation and feasibility need further study. |
 
---
 
## Future Scope
 
- Expand LoRa gateway infrastructure across rural and semi-urban school networks.
- Reduce per-unit cost further through mass production and direct component sourcing.
- Integrate additional health-monitoring sensors and predictive anomaly detection.
- Formalize CSR/PPP partnerships and pilot programs aligned with existing government child-safety schemes.
---
 ## Team Members
 1.Agrima Adarsh (Prototype Implementation and Software Interface)
 2.Gona Meghna(Power Analysis)
 3.Siya Talwar(Market Analysis and Launching strategy)
 4.Taufika(Success Criteria and Simulation)
 5.Priya(Ideation and Simulation)
 
*KAVACH — A small wearable. A big promise. Keeping children safe, every step of the way.*
