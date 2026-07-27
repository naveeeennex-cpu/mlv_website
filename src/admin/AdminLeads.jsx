import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { apiFetch } from './useAdmin';
import { FiSearch, FiX, FiTrash2, FiMessageSquare, FiExternalLink } from 'react-icons/fi';

const STATUSES = ['New Lead', 'Contacted', 'Qualified', 'Won', 'Lost'];

const STATUS_STYLE = {
  'New Lead': 'bg-blue-50 text-blue-700 border-blue-200',
  'Contacted': 'bg-amber-50 text-amber-700 border-amber-200',
  'Qualified': 'bg-purple-50 text-purple-700 border-purple-200',
  'Won': 'bg-[#e7f6ec] text-[#1a7a32] border-[#bfe3cb]',
  'Lost': 'bg-gray-100 text-gray-500 border-gray-200',
};

function StatusCell({ lead, onChange }) {
  const update = async (status) => {
    onChange(lead.id, status);
    const res = await apiFetch('/api/admin/leads', { method: 'PUT', body: { id: lead.id, status } });
    if (!res.ok) { toast.error('Failed to update status'); onChange(lead.id, lead.status); }
  };
  return (
    <select
      value={lead.status}
      onChange={e => update(e.target.value)}
      className={`text-[11px] font-semibold border rounded-full px-2 py-1 focus:outline-none cursor-pointer ${STATUS_STYLE[lead.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}
    >
      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}

function HistoryModal({ lead, onClose }) {
  const history = Array.isArray(lead.conversation_history) ? lead.conversation_history : [];
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto p-5 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-gray-900 font-semibold">Conversation</h2>
            <p className="text-xs text-gray-400">{lead.phone}{lead.customer_name ? ` · ${lead.customer_name}` : ''}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX /></button>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No transcript saved.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${m.role === 'customer' ? 'self-end bg-[#dcf8c6] text-gray-800' : 'self-start bg-gray-100 text-gray-800'}`}>
                {m.message}
              </div>
            ))}
          </div>
        )}
        <a
          href={`https://wa.me/${lead.phone}`}
          target="_blank" rel="noreferrer"
          className="mt-4 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white text-sm font-medium py-2.5 rounded-xl transition"
        >
          <FiExternalLink size={14} /> Open in WhatsApp
        </a>
      </div>
    </div>
  );
}

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch('/api/admin/leads');
    setLeads(res.ok ? await res.json() : []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleStatus = (id, status) => setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l));

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead?')) return;
    const res = await apiFetch(`/api/admin/leads?id=${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); setLeads(ls => ls.filter(l => l.id !== id)); }
    else toast.error('Failed to delete');
  };

  const term = search.trim().toLowerCase();
  const filtered = useMemo(() => leads.filter(l => {
    if (statusFilter && l.status !== statusFilter) return false;
    if (sourceFilter && l.lead_source !== sourceFilter) return false;
    if (term && !((l.phone || '').toLowerCase().includes(term) || (l.customer_name || '').toLowerCase().includes(term) || (l.product_name || '').toLowerCase().includes(term))) return false;
    return true;
  }), [leads, statusFilter, sourceFilter, term]);

  const fmtDate = (d) => { try { return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return d; } };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Loading…' : `${filtered.length} of ${leads.length} ${leads.length === 1 ? 'enquiry' : 'enquiries'}`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search phone, name or product…"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-9 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#1a5c2a]"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><FiX size={14} /></button>}
        </div>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#1a5c2a]">
          <option value="">All sources</option>
          <option value="website">Website</option>
          <option value="meta">Meta Ads</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#1a5c2a]">
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-gray-400 text-sm py-10 text-center">Loading…</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium">When</th>
                <th className="text-left px-4 py-3 font-medium">Source</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Door</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} className="border-b border-gray-50 hover:bg-[#1a5c2a]/[0.03] transition">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{fmtDate(l.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${l.lead_source === 'meta' ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'}`}>
                      {l.lead_source === 'meta' ? 'Meta' : 'Website'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900 font-medium">{l.customer_name || '—'}</div>
                    <a href={`https://wa.me/${l.phone}`} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-[#1a5c2a]">{l.phone}</a>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{l.product_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {[l.door_material, l.door_configuration, l.door_location].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="px-4 py-3"><StatusCell lead={l} onChange={handleStatus} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setViewing(l)} title="Conversation" className="p-2 rounded-lg text-gray-400 hover:text-[#1a5c2a] hover:bg-[#1a5c2a]/10 transition"><FiMessageSquare size={15} /></button>
                      <button onClick={() => handleDelete(l.id)} title="Delete" className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><FiTrash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">{leads.length ? 'No leads match these filters.' : 'No leads yet.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewing && <HistoryModal lead={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
