import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { apiFetch } from './useAdmin';
import { FiSend, FiSearch, FiX, FiUsers, FiCheckCircle, FiClock, FiMessageSquare, FiArrowLeft } from 'react-icons/fi';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
}

function MessageModal({ target, onClose }) {
  const isAll = !!target.isAll;
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState(target.filter || 'all');
  const [useButtons, setUseButtons] = useState(false);
  const [buttons, setButtons] = useState(['', '', '']);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const validButtons = buttons.filter(b => b.trim());

  const handleSend = async () => {
    if (!message.trim()) { toast.error('Message cannot be empty'); return; }
    setSending(true);

    const body = {
      message: message.trim(),
      ...(useButtons && validButtons.length > 0 ? { buttons: validButtons } : {}),
    };

    if (isAll) {
      body.filter = filter;
      const res = await apiFetch('/api/admin/broadcast', { method: 'POST', body });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        toast.success(`Sent to ${data.sent} customers`);
      } else toast.error('Broadcast failed');
    } else {
      body.phone = target.phone;
      const res = await apiFetch('/api/admin/send-message', { method: 'POST', body });
      if (res.ok) { toast.success('Message sent!'); onClose(); }
      else toast.error('Failed to send message');
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-gray-900 font-semibold">
            {isAll ? 'Broadcast Message' : `Message to +${target.phone}`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX /></button>
        </div>

        {result ? (
          <div className="text-center py-6">
            <div className="text-3xl font-bold text-[#1a5c2a] mb-1">{result.sent}</div>
            <div className="text-gray-500 text-sm">messages sent</div>
            {result.failed > 0 && <div className="text-red-500 text-xs mt-1">{result.failed} failed</div>}
            <button onClick={onClose} className="mt-5 bg-[#1a5c2a] text-white px-6 py-2 rounded-lg text-sm font-semibold">Done</button>
          </div>
        ) : (
          <div className="space-y-4">
            {isAll && (
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Send to</label>
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-[#1a5c2a]"
                >
                  <option value="all">All customers</option>
                  <option value="not_booked">Not booked yet</option>
                  <option value="booked">Already booked</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Use <span className="font-mono">{'{name}'}</span> to personalize</p>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-500 font-medium mb-1">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder={isAll ? "Hi {name}! We have a special offer…" : "Type your message…"}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-[#1a5c2a] resize-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={useButtons} onChange={e => setUseButtons(e.target.checked)} className="accent-[#1a5c2a]" />
                <span className="text-sm text-gray-500">Add quick-reply buttons (optional)</span>
              </label>
              {useButtons && (
                <div className="mt-3 space-y-2">
                  {buttons.map((b, i) => (
                    <input
                      key={i}
                      value={b}
                      onChange={e => setButtons(bs => bs.map((v, j) => j === i ? e.target.value : v))}
                      placeholder={`Button ${i + 1} (max 20 chars)`}
                      maxLength={20}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-[#1a5c2a]"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-500 rounded-lg py-2 text-sm hover:bg-gray-50 transition">Cancel</button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 bg-[#1a5c2a] hover:bg-[#154d23] text-white font-semibold rounded-lg py-2 text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FiSend size={14} /> {sending ? 'Sending…' : isAll ? 'Broadcast' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationDrawer({ customer, onClose, onMessage }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/admin/messages?phone=${customer.phone}&limit=200`)
      .then(r => r.json())
      .then(data => {
        setMessages(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [customer.phone]);

  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [loading, messages.length]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full sm:max-w-md bg-white flex flex-col h-full shadow-2xl border-l border-gray-200">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <FiArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 font-semibold truncate">{customer.name || `+${customer.phone}`}</p>
            <p className="text-gray-400 text-xs font-mono">+{customer.phone}</p>
          </div>
          <button
            onClick={() => onMessage(customer)}
            className="flex items-center gap-1.5 text-xs bg-[#1a5c2a] hover:bg-[#154d23] text-white font-semibold px-3 py-1.5 rounded-lg transition"
          >
            <FiSend size={12} /> Send
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50">
          {loading && (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading…</div>
          )}
          {!loading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
              <FiMessageSquare size={32} className="mb-2 opacity-30" />
              No messages yet
            </div>
          )}
          {!loading && messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'customer' ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words ${
                  msg.role === 'customer'
                    ? 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm'
                    : 'bg-[#1a5c2a] text-white rounded-tr-sm shadow-sm'
                }`}
              >
                {msg.message}
                <div className={`text-[10px] mt-1 ${msg.role === 'customer' ? 'text-gray-400' : 'text-white/60'}`}>
                  {formatTime(msg.created_at)}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between bg-white">
          <span>{messages.length} messages</span>
          <span>Last seen {formatDate(customer.last_seen)}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminChats() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [drawer, setDrawer] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('filter', filter);
    if (search) params.set('search', search);
    const res = await apiFetch(`/api/admin/customers?${params}`);
    setCustomers(await res.json());
    setLoading(false);
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const total = customers.length;
  const booked = customers.filter(c => c.booked).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Chat Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} customers · {booked} booked</p>
        </div>
        <button
          onClick={() => setModal({ isAll: true, filter: 'all' })}
          className="flex items-center gap-2 bg-[#1a5c2a] hover:bg-[#154d23] text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          <FiUsers size={14} /> Broadcast
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Customers', value: total, icon: FiUsers, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Booked', value: booked, icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pending', value: total - booked, icon: FiClock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 flex items-center gap-3 shadow-sm">
            <div className={`${s.bg} p-2 md:p-2.5 rounded-lg flex-shrink-0`}>
              <s.icon size={16} className={s.color} />
            </div>
            <div className="min-w-0">
              <div className="text-xl md:text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-[10px] md:text-xs text-gray-500 leading-tight">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search phone or name…"
            className="bg-white border border-gray-200 rounded-lg pl-8 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#1a5c2a] w-56"
          />
        </div>
        {['all', 'booked', 'not_booked'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-lg text-sm transition ${
              filter === f
                ? 'bg-[#1a5c2a] text-white font-semibold'
                : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {f === 'all' ? 'All' : f === 'booked' ? 'Booked' : 'Not Booked'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-gray-400 text-sm">Loading…</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium">Phone</th>
                <th className="text-left px-5 py-3 font-medium">Name</th>
                <th className="text-left px-5 py-3 font-medium">Interested In</th>
                <th className="text-left px-5 py-3 font-medium">Last Seen</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr
                  key={c.phone}
                  onClick={() => setDrawer(c)}
                  className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer"
                >
                  <td className="px-5 py-3 font-mono text-gray-600">+{c.phone}</td>
                  <td className="px-5 py-3 text-gray-900">{c.name || <span className="text-gray-300">—</span>}</td>
                  <td className="px-5 py-3 text-gray-500 max-w-[180px] truncate">{c.product_interest || '—'}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(c.last_seen)}</td>
                  <td className="px-5 py-3">
                    {c.booked
                      ? <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">Booked</span>
                      : <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Enquiry</span>
                    }
                  </td>
                  <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setModal({ phone: c.phone, name: c.name })}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#1a5c2a] transition border border-gray-200 hover:border-[#1a5c2a] px-3 py-1.5 rounded-lg"
                    >
                      <FiSend size={12} /> Message
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No customers yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && <MessageModal target={modal} onClose={() => { setModal(null); load(); }} />}

      {drawer && (
        <ConversationDrawer
          customer={drawer}
          onClose={() => setDrawer(null)}
          onMessage={c => { setDrawer(null); setModal({ phone: c.phone, name: c.name }); }}
        />
      )}
    </div>
  );
}
