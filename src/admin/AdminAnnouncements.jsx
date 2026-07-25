import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { apiFetch } from './useAdmin';
import {
  FiSend, FiX, FiSearch, FiCheckSquare, FiSquare,
  FiClock, FiUsers, FiCheckCircle, FiAlertCircle,
} from 'react-icons/fi';
import ImageUpload from './ImageUpload';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Customers', desc: 'Everyone who has interacted' },
  { value: 'booked', label: 'Booked', desc: 'Customers who booked an appointment' },
  { value: 'not_booked', label: 'Not Booked', desc: 'Interested but not yet booked' },
  { value: 'custom', label: 'Pick Customers', desc: 'Choose specific people' },
];

function CustomerPicker({ selected, onChange }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/customers')
      .then(r => r.json())
      .then(data => { setCustomers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return !q || c.phone.includes(q) || (c.name || '').toLowerCase().includes(q);
  });

  const toggleAll = () => {
    if (selected.length === filtered.length) {
      onChange([]);
    } else {
      onChange(filtered.map(c => c.phone));
    }
  };

  const toggle = (phone) => {
    onChange(selected.includes(phone)
      ? selected.filter(p => p !== phone)
      : [...selected, phone]
    );
  };

  const allSelected = filtered.length > 0 && filtered.every(c => selected.includes(c.phone));

  if (loading) return <div className="text-gray-400 text-sm py-4 text-center">Loading customers…</div>;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Search + select all */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <button onClick={toggleAll} className="text-gray-400 hover:text-[#1a5c2a] transition flex-shrink-0">
          {allSelected ? <FiCheckSquare size={16} className="text-[#1a5c2a]" /> : <FiSquare size={16} />}
        </button>
        <div className="relative flex-1">
          <FiSearch size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by phone or name…"
            className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-[#1a5c2a]"
          />
        </div>
        <span className="text-xs text-gray-500 flex-shrink-0">{selected.length} selected</span>
      </div>

      {/* List */}
      <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
        {filtered.length === 0 && (
          <div className="text-gray-400 text-sm py-6 text-center">No customers found</div>
        )}
        {filtered.map(c => {
          const isSelected = selected.includes(c.phone);
          return (
            <button
              key={c.phone}
              onClick={() => toggle(c.phone)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition ${isSelected ? 'bg-green-50' : ''}`}
            >
              <span className="flex-shrink-0">
                {isSelected
                  ? <FiCheckSquare size={15} className="text-[#1a5c2a]" />
                  : <FiSquare size={15} className="text-gray-300" />
                }
              </span>
              <span className="font-mono text-xs text-gray-500">+{c.phone}</span>
              {c.name && <span className="text-sm text-gray-900">{c.name}</span>}
              <span className="ml-auto">
                {c.booked
                  ? <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full">Booked</span>
                  : <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">Enquiry</span>
                }
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminAnnouncements() {
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedPhones, setSelectedPhones] = useState([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    apiFetch('/api/admin/announcements')
      .then(r => r.json())
      .then(data => { setHistory(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleSend = async () => {
    if (!message.trim()) { toast.error('Message cannot be empty'); return; }
    if (filterType === 'custom' && selectedPhones.length === 0) {
      toast.error('Select at least one customer'); return;
    }
    if (!confirm(`Send this announcement to ${filterType === 'custom' ? selectedPhones.length + ' selected' : filterType} customers?`)) return;

    setSending(true);
    setResult(null);

    const res = await apiFetch('/api/admin/announcements', {
      method: 'POST',
      body: {
        message: message.trim(),
        imageUrl: imageUrl.trim() || null,
        filterType,
        phones: filterType === 'custom' ? selectedPhones : [],
      },
    });
    const data = await res.json();

    if (res.ok) {
      setResult(data);
      toast.success(`Sent to ${data.sent} customers`);
      loadHistory();
    } else {
      toast.error(data.error || 'Send failed');
    }
    setSending(false);
  };

  const reset = () => {
    setMessage('');
    setImageUrl('');
    setFilterType('all');
    setSelectedPhones([]);
    setResult(null);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Announcements</h1>
        <p className="text-sm text-gray-500 mt-0.5">Send a poster or message to your customers on WhatsApp</p>
      </div>

      {result ? (
        /* Result card */
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.failed === 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
            {result.failed === 0
              ? <FiCheckCircle size={32} className="text-green-600" />
              : <FiAlertCircle size={32} className="text-amber-600" />
            }
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{result.sent}</div>
          <div className="text-gray-500 text-sm mb-1">messages sent successfully</div>
          {result.failed > 0 && (
            <div className="text-red-500 text-xs mb-4">{result.failed} failed to deliver</div>
          )}
          <div className="flex gap-3 justify-center mt-5">
            <button onClick={reset} className="border border-gray-200 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
              New Announcement
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Image / Poster */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              folder="announcements"
              label="Poster Image (optional)"
            />
            <p className="text-xs text-gray-400 mt-2">Image will be sent as a WhatsApp photo with your message as caption.</p>
          </div>

          {/* Message */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-gray-900 mb-3">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              placeholder={"Hi {name}! 🎉 We have an exciting offer on Yale smart locks this week…"}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#1a5c2a] resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-xs text-gray-400">
                Use <span className="font-mono bg-gray-100 px-1 rounded">{'{name}'}</span> to personalise with customer name
              </p>
              <span className="text-xs text-gray-400">{message.length} chars</span>
            </div>
          </div>

          {/* Recipients */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-gray-900 mb-3">Send To</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setFilterType(opt.value); setSelectedPhones([]); }}
                  className={`text-left px-4 py-3 rounded-xl border-2 transition ${
                    filterType === opt.value
                      ? 'border-[#1a5c2a] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-sm font-medium ${filterType === opt.value ? 'text-[#1a5c2a]' : 'text-gray-900'}`}>
                    {opt.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>

            {filterType === 'custom' && (
              <CustomerPicker selected={selectedPhones} onChange={setSelectedPhones} />
            )}
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={sending || !message.trim() || (filterType === 'custom' && !selectedPhones.length)}
            className="w-full bg-[#1a5c2a] hover:bg-[#154d23] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            <FiSend size={15} />
            {sending ? 'Sending…' : filterType === 'custom'
              ? `Send to ${selectedPhones.length} customer${selectedPhones.length !== 1 ? 's' : ''}`
              : 'Send Announcement'
            }
          </button>
        </div>
      )}

      {/* History */}
      <div className="mt-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Sent Announcements</h2>
        {loadingHistory ? (
          <div className="text-gray-400 text-sm">Loading…</div>
        ) : history.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
            No announcements sent yet
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(a => (
              <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-4">
                  {a.image_url && (
                    <img
                      src={a.image_url}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover bg-gray-100 flex-shrink-0 border border-gray-200"
                      onError={e => e.target.style.display = 'none'}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 line-clamp-2">{a.message}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiUsers size={11} /> {a.recipient_count} sent
                      </span>
                      {a.failed_count > 0 && (
                        <span className="text-red-400">{a.failed_count} failed</span>
                      )}
                      <span className="capitalize bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                        {a.filter_type === 'not_booked' ? 'Not booked' : a.filter_type}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock size={11} /> {formatDate(a.sent_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
