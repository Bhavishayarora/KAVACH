import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Users,
  Save,
  PhoneCall,
  Trash2,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import { getContacts, addContact, deleteContact } from '../services/api';

export default function EmergencyContacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relation: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadContacts = async () => {
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setIsSubmitting(true);
    try {
      const res = await addContact(formData);
      if (res.contacts) {
        setContacts(res.contacts);
      } else if (res.contact) {
        setContacts((prev) => [res.contact, ...prev]);
      }
      setFormData({ name: '', phone: '', relation: '' });
    } catch (err) {
      alert('Failed to add contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this emergency contact?')) return;
    try {
      const res = await deleteContact(id);
      if (res.contacts) {
        setContacts(res.contacts);
      } else {
        setContacts((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      alert('Failed to delete contact');
    }
  };

  return (
    <div
      className="min-h-screen w-full pt-[100px] pb-16 px-4 flex items-center justify-center"
      style={{
        backgroundImage: "linear-gradient(rgba(10, 15, 30, 0.7), rgba(10, 15, 30, 0.8)), url('/CONTACT.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-xl glass-panel p-6 sm:p-8 space-y-6">
        {/* Title */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>INSTANT DISPATCH DIRECTORY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center justify-center gap-2">
            <Phone className="w-6 h-6 text-[#00eaff]" />
            Emergency Contacts
          </h2>
          <p className="text-xs text-gray-300">
            Contacts alerted immediately when SOS or fall detection is triggered.
          </p>
        </div>

        {/* Add Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-200 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#00eaff]" />
              Person Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Rajesh Sharma"
              className="w-full px-4 py-2.5 rounded-xl bg-white/20 border border-white/20 text-sm text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:bg-white/25 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-200 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#00eaff]" />
              Mobile Number
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl bg-white/20 border border-white/20 text-sm text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:bg-white/25 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-200 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#00eaff]" />
              Relation
            </label>
            <input
              type="text"
              required
              value={formData.relation}
              onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
              placeholder="Father / Mother / Guardian / School Teacher"
              className="w-full px-4 py-2.5 rounded-xl bg-white/20 border border-white/20 text-sm text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:bg-white/25 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-black/80 hover:bg-black text-white font-bold text-sm shadow-[0_4px_15px_rgba(0,0,0,0.5)] border border-white/20 hover:border-cyan-400 flex items-center justify-center gap-2 transition"
          >
            <Save className="w-4 h-4 text-cyan-400" />
            <span>{isSubmitting ? 'Saving Contact...' : 'Save Emergency Contact'}</span>
          </button>
        </form>

        <hr className="border-white/20" />

        {/* Saved Contacts List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200">
            Registered Guardians ({contacts.length})
          </h3>

          {contacts.length === 0 ? (
            <p className="text-center text-xs text-gray-300 py-4">No contacts added yet.</p>
          ) : (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {contacts.map((contact) => (
                <div
                  key={contact.id || contact.phone}
                  className="p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-between gap-4 transition hover:bg-white/25"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      {contact.name}
                    </h4>
                    <p className="text-xs text-cyan-200 font-mono flex items-center gap-1.5">
                      <Phone className="w-3 h-3" />
                      {contact.phone}
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-white/10 text-[10px] text-gray-200">
                      {contact.relation}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${contact.phone}`}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      Call Now
                    </a>

                    {contact.id && (
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="p-2 rounded-xl bg-red-600/30 hover:bg-red-600/60 text-red-300 transition"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="pt-2 text-center">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary-glass text-xs py-2 px-4">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
