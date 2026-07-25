import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiFetch } from './useAdmin';
import { FiZap, FiToggleLeft, FiToggleRight, FiSave, FiClock, FiSend } from 'react-icons/fi';

function formatDate(iso) {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminCron() {
  const [settings, setSettings] = useState({});
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [triggering, setSaving] = useState(false);
  const [savingMsg, setSavingMsg] = useState(false);
  const [toggling, setToggling] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await apiFetch('/api/admin/cron-config');
    const data = await res.json();
    setSettings(data.settings || {});
    setLog(data.log || []);
    const msg = data.settings?.followup_message || '';
    setMessage(msg);
    setSavedMessage(msg);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const cronEnabled = settings.cron_enabled !== 'false';

  const handleToggle = async () => {
    setToggling(true);
    const res = await apiFetch('/api/admin/cron-config', {
      method: 'PUT',
      body: { key: 'cron_enabled', value: cronEnabled ? 'false' : 'true' },
    });
    if (res.ok) {
      setSettings(s => ({ ...s, cron_enabled: cronEnabled ? 'false' : 'true' }));
      toast.success(cronEnabled ? 'Follow-up cron disabled' : 'Follow-up cron enabled');
    } else toast.error('Failed to toggle');
    setToggling(false);
  };

  const handleSaveMessage = async () => {
    setSavingMsg(true);
    const res = await apiFetch('/api/admin/cron-config', {
      method: 'PUT',
      body: { key: 'followup_message', value: message },
    });
    if (res.ok) { setSavedMessage(message); toast.success('Follow-up message saved'); }
    else toast.error('Failed to save');
    setSavingMsg(false);
  };

  const handleTrigger = async () => {
    if (!confirm('Manually trigger follow-up messages now? This will message all stale customers.')) return;
    setSaving(true);
    const res = await apiFetch('/api/admin/cron-config', {
      method: 'POST',
      body: { action: 'trigger' },
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(`Done — sent: ${data.sent}, failed: ${data.failed}`);
      load();
    } else toast.error('Trigger failed');
    setSaving(false);
  };

  const isDirty = message !== savedMessage;

  return (
    <div className="max-w-2xl w-full">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Cron Management</h1>
      <p className="text-sm text-gray-500 mb-8">Control the automated follow-up messages sent to inactive customers</p>

      {loading ? (
        <div className="text-gray-400 text-sm">Loading…</div>
      ) : (
        <div className="space-y-5">
          {/* Toggle + schedule info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-900 font-medium">Daily Follow-up Cron</div>
                <div className="text-xs text-gray-500 mt-0.5">Runs every day at 7:30 AM UTC (1:00 PM IST)</div>
              </div>
              <button
                onClick={handleToggle}
                disabled={toggling}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  cronEnabled
                    ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                    : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                }`}
              >
                {cronEnabled ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                {cronEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100">
              <div>
                <div className="text-xs text-gray-500">Last Run</div>
                <div className="text-sm text-gray-900 mt-0.5">{formatDate(settings.cron_last_run)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Last Run Sent</div>
                <div className="text-sm text-gray-900 mt-0.5">{settings.cron_last_count ?? '—'} messages</div>
              </div>
            </div>
          </div>

          {/* Manual trigger */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-900 font-medium">Manual Trigger</div>
                <div className="text-xs text-gray-500 mt-0.5">Fire follow-up messages right now for all inactive customers</div>
              </div>
              <button
                onClick={handleTrigger}
                disabled={triggering}
                className="flex items-center gap-2 bg-[#1a5c2a] hover:bg-[#154d23] text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                <FiZap size={14} /> {triggering ? 'Running…' : 'Trigger Now'}
              </button>
            </div>
          </div>

          {/* Follow-up message */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="text-gray-900 font-medium">Follow-up Message</div>
              <button
                onClick={handleSaveMessage}
                disabled={savingMsg || !isDirty}
                className="flex items-center gap-2 bg-[#1a5c2a] hover:bg-[#154d23] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
              >
                <FiSave size={12} /> {savingMsg ? 'Saving…' : 'Save'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Use <span className="font-mono text-gray-600">{'{name}'}</span> to insert the customer's name.
              Sent to customers who haven't interacted in 20+ hours and haven't booked.
            </p>
            {isDirty && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1.5 mb-3">
                Unsaved changes
              </div>
            )}
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a5c2a] rounded-lg px-4 py-3 text-gray-900 text-sm font-mono resize-none focus:outline-none leading-relaxed"
            />
            <p className="text-xs text-gray-400 mt-1">{message.length} characters</p>
          </div>

          {/* Broadcast log */}
          {log.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="text-gray-900 font-medium mb-4">Recent Broadcasts</div>
              <div className="space-y-3">
                {log.map(l => (
                  <div key={l.id} className="flex items-start gap-4 text-sm border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <div className="text-gray-700 line-clamp-2">{l.message}</div>
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1"><FiSend size={10} /> {l.recipient_count} sent</span>
                        <span>Filter: {l.filter}</span>
                        <span><FiClock size={10} className="inline mr-0.5" />{formatDate(l.sent_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
