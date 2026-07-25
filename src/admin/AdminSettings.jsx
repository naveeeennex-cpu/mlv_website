import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiFetch } from './useAdmin';
import { FiSave } from 'react-icons/fi';

function PhoneSettings() {
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch('/api/admin/config?key=owner_phone')
      .then(r => r.json())
      .then(d => { setPhone(d.value || ''); setSaved(d.value || ''); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      toast.error('Enter a valid phone number (with country code, e.g. 919176186062)');
      return;
    }
    setSaving(true);
    const res = await apiFetch('/api/admin/config', {
      method: 'PUT',
      body: { key: 'owner_phone', value: digits },
    });
    if (res.ok) {
      setSaved(digits);
      setPhone(digits);
      toast.success('Owner phone updated — takes effect within 5 minutes');
    } else toast.error('Failed to save');
    setSaving(false);
  };

  const isDirty = phone.replace(/\D/g, '') !== saved;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Owner WhatsApp Number</h2>
      <p className="text-xs text-gray-500">
        Appointment notifications are sent to this number. Include country code, no spaces or dashes.<br />
        Example: <span className="font-mono text-gray-600">919176186062</span> (91 = India)
      </p>
      {loading ? (
        <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
      ) : (
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="919176186062"
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm font-mono focus:outline-none focus:border-[#1a5c2a]"
        />
      )}
      {saved && (
        <p className="text-xs text-gray-400">Current: <span className="font-mono text-gray-600">+{saved}</span></p>
      )}
      <button
        onClick={handleSave}
        disabled={saving || !isDirty || loading}
        className="flex items-center gap-2 bg-[#1a5c2a] hover:bg-[#154d23] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-50"
      >
        <FiSave size={14} /> {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}

export default function AdminSettings() {
  return (
    <div className="max-w-lg w-full space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Business configuration for the WhatsApp bot</p>
      </div>
      <PhoneSettings />
    </div>
  );
}
