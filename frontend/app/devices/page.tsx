'use client';

import axios from 'axios';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Protected from '@/components/Protected';
import { API } from '@/config/api';

interface FraudLog {
  username: string;
  action: string;
  ip: string;
  device: string;
  time: string;
}

interface DeviceGroup {
  key: string;
  ip: string;
  device: string;
  users: string[];
  actions: string[];
  count: number;
  lastSeen: string;
}

export default function DevicesPage() {
  const [logs, setLogs] = useState<FraudLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'by-ip' | 'by-user'>('by-ip');

  // New activity form
  const [form, setForm] = useState({ username: '', action: 'login', ip: '', device: 'web-client' });
  const [msg, setMsg] = useState('');
  const [formErr, setFormErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const authHeader = () => {
    const token = Cookies.get('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(API.FRAUD.ACTIVITY, { headers: authHeader() });
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Could not load activity data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  // Group by IP
  const byIp = logs.reduce<Record<string, DeviceGroup>>((acc, log) => {
    const key = `${log.ip}::${log.device}`;
    if (!acc[key]) {
      acc[key] = {
        key,
        ip: log.ip,
        device: log.device,
        users: [],
        actions: [],
        count: 0,
        lastSeen: log.time,
      };
    }
    if (!acc[key].users.includes(log.username)) acc[key].users.push(log.username);
    if (log.action && !acc[key].actions.includes(log.action)) acc[key].actions.push(log.action);
    acc[key].count++;
    if (log.time > acc[key].lastSeen) acc[key].lastSeen = log.time;
    return acc;
  }, {});

  // Group by user
  const byUser = logs.reduce<Record<string, { user: string; ips: string[]; devices: string[]; count: number; lastSeen: string }>>((acc, log) => {
    const key = log.username;
    if (!acc[key]) acc[key] = { user: key, ips: [], devices: [], count: 0, lastSeen: log.time };
    if (!acc[key].ips.includes(log.ip)) acc[key].ips.push(log.ip);
    if (!acc[key].devices.includes(log.device)) acc[key].devices.push(log.device);
    acc[key].count++;
    if (log.time > acc[key].lastSeen) acc[key].lastSeen = log.time;
    return acc;
  }, {});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setFormErr('');
    if (!form.username.trim() || !form.ip.trim()) {
      setFormErr('Username and IP are required.');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        API.FRAUD.LOG_ACTIVITY,
        {
          username: form.username.trim(),
          action: form.action,
          ip: form.ip.trim(),
          device: form.device.trim(),
        },
        { headers: authHeader() },
      );
      setMsg('Activity logged.');
      setForm((prev) => ({ ...prev, username: '', action: 'login', ip: '' }));
      fetchLogs();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setFormErr(err.response?.data?.detail || 'Failed to log activity.');
      } else {
        setFormErr('Unexpected error.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Protected>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Device Activity</h1>
            <p className="text-gray-500 text-sm mt-0.5">User sessions grouped by IP and identity</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('by-ip')}
              className={view === 'by-ip' ? 'btn-primary text-sm py-1.5 px-3' : 'btn-secondary text-sm py-1.5 px-3'}
            >
              By IP
            </button>
            <button
              onClick={() => setView('by-user')}
              className={view === 'by-user' ? 'btn-primary text-sm py-1.5 px-3' : 'btn-secondary text-sm py-1.5 px-3'}
            >
              By User
            </button>
            <button onClick={fetchLogs} className="btn-secondary text-sm py-1.5 px-3">↻</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device list */}
          <div className="lg:col-span-2 card p-0 overflow-hidden">
            {error && (
              <div className="m-5 bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">{error}</div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <span className="loader" />
              </div>
            ) : view === 'by-ip' ? (
              Object.keys(byIp).length === 0 ? (
                <div className="text-center py-16 text-gray-400">No data yet.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {Object.values(byIp).sort((a, b) => b.lastSeen.localeCompare(a.lastSeen)).map((g) => (
                    <div key={g.key} className="px-5 py-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-gray-800">🖥 {g.ip}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {g.count} event{g.count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Users: {g.users.join(', ')}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Device: {g.device}
                        </div>
                        {g.actions.length > 0 && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            Actions: {g.actions.join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-700">{new Date(g.lastSeen).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">last seen</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : Object.keys(byUser).length === 0 ? (
              <div className="text-center py-16 text-gray-400">No data yet.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {Object.values(byUser).sort((a, b) => b.lastSeen.localeCompare(a.lastSeen)).map((u) => (
                  <div key={u.user} className="px-5 py-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">👤 {u.user}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {u.count} event{u.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 font-mono">
                        IPs: {u.ips.join(', ')}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Devices: {u.devices.join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-700">{new Date(u.lastSeen).toLocaleString()}</div>
                      <div className="text-xs text-gray-400">last seen</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Log form */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">Log Activity Event</h2>

            {msg && <div className="bg-green-50 border border-green-200 text-green-700 rounded p-3 text-sm mb-4">{msg}</div>}
            {formErr && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm mb-4">{formErr}</div>}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  className="input-field"
                  placeholder="e.g. alice"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select
                  className="input-field"
                  value={form.action}
                  onChange={(e) => setForm({ ...form, action: e.target.value })}
                >
                  <option value="login">login</option>
                  <option value="logout">logout</option>
                  <option value="purchase">purchase</option>
                  <option value="transfer">transfer</option>
                  <option value="password_change">password_change</option>
                  <option value="api_call">api_call</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                <input
                  className="input-field font-mono text-sm"
                  placeholder="e.g. 10.0.0.1"
                  value={form.ip}
                  onChange={(e) => setForm({ ...form, ip: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device</label>
                <input
                  className="input-field"
                  placeholder="e.g. chrome-windows"
                  value={form.device}
                  onChange={(e) => setForm({ ...form, device: e.target.value })}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {submitting ? <span className="loader" /> : null}
                {submitting ? 'Logging…' : 'Log Event'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </Protected>
  );
}
