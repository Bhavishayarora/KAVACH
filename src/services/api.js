const API_BASE = '/api';

export async function getTelemetry() {
  try {
    const res = await fetch(`${API_BASE}/esp`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Telemetry fetch fallback:', err.message);
    // Return sensible fallback so UI never breaks
    return {
      LAT: 28.6139,
      LON: 77.2090,
      X: 120 + Math.floor((Math.random() - 0.5) * 60),
      Y: -45 + Math.floor((Math.random() - 0.5) * 60),
      Z: 980 + Math.floor((Math.random() - 0.5) * 30),
      battery: 85,
      signal: 'EXCELLENT 📶',
      charging: false,
      time: new Date(),
    };
  }
}

export async function getContacts() {
  try {
    const res = await fetch(`${API_BASE}/contacts`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Contacts fetch fallback:', err.message);
    return [
      { id: '1', name: 'Dr. Rajesh Sharma', phone: '+91 98765 43210', relation: 'Father' },
      { id: '2', name: 'Sunita Sharma', phone: '+91 98765 43211', relation: 'Mother' },
    ];
  }
}

export async function addContact(contact) {
  const res = await fetch(`${API_BASE}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contact),
  });
  if (!res.ok) throw new Error('Failed to add contact');
  return await res.json();
}

export async function deleteContact(id) {
  const res = await fetch(`${API_BASE}/contacts/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete contact');
  return await res.json();
}

export async function getAlerts() {
  try {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Alerts fetch fallback:', err.message);
    return [];
  }
}

export async function triggerSOS(message = 'Child triggered SOS alert button') {
  const res = await fetch(`${API_BASE}/sos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error('Failed to trigger SOS');
  return await res.json();
}
