'use client';

import axios from 'axios';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Protected from '@/components/Protected';
import { API } from '@/config/api';

interface FraudLog {
  user_id: string;
  ip_address: string;
  risk_score: number;
  decision: string;
  action?: string;
  timestamp?: string;
}

function RiskBadge({ score }: { score: number }) {
  if (score >= 70) return <span className="badge-danger">{score}</span>;
  if (score >= 40) return <span className="badge-warning">{score}</span>;
  return <span className="badge-success">{score}</span>;
}

function DecisionBadge({ decision }: { decision: string }) {
  const d = decision?.toLowerCase();
  if (d === 'block' || d === 'blocked') return <span className="badge-danger">{decision}</span>;
  if (d === 'review') return <span className="badge-warning">{decision}</span>;
  return <span className="badge-success">{decision}</span>;
}

export default function FraudPage() {
  const [logs, setLogs] = useState<FraudLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Log activity form
  const [logUsername, setLogUsername] = useState('');
  const [logAction, setLogAction] = useState('login');
  const [logIp, setLogIp] = useState('');
  const [logDevice, setLogDevice] = useState('web-client');
  const [logMsg, setLogMsg] = useState('');
  const [logError, setLogError] = useState('');
  const [logLoading, setLogLoading] = useState(false);

  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.userAgent) {
      setLogDevice(navigator.userAgent.slice(0, 120));
    }
  }, []);

  const fetchLogs = async () => {
    const token = Cookies.get('token');
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(API.FRAUD.LOGS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data?.logs ?? res.data ?? []);
    } catch {
      setError('Failed to load fraud logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogMsg('');
    setLogError('');
    if (!logUsername.trim() || !logIp.trim()) {
      setLogError('Username and IP are required.');
      return;
    }
    setLogLoading(true);
    const token = Cookies.get('token');
    try {
      await axios.post(
        API.FRAUD.LOG_ACTIVITY,
        {
          username: logUsername.trim(),
          action: logAction,
          ip: logIp.trim(),
          device: logDevice.trim() || 'web-client',
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setLogMsg('Activity logged successfully.');
      setLogUsername('');
      setLogIp('');
      fetchLogs();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setLogError(err.response?.data?.detail || 'Failed to log activity.');
      } else {
        setLogError('Unexpected error.');
      }
    } finally {
      setLogLoading(false);
    }
  };

  const filtered = logs.filter(
    (l) =>
      !filter ||
      l.user_id?.toLowerCase().includes(filter.toLowerCase()) ||
      l.ip_address?.toLowerCase().includes(filter.toLowerCase()) ||
      l.decision?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <Protected>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fraud Logs</h1>
            <p className="text-gray-500 text-sm mt-0.5">All detected fraud events and risk assessments</p>
          </div>
          <button onClick={fetchLogs} className="btn-secondary self-start">↻ Refresh</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logs table */}
          <div className="lg:col-span-2 card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <h2 className="font-semibold text-gray-800">Event History</h2>
              <input
                className="input-field max-w-xs text-sm py-1.5"
                placeholder="Filter by user, IP, decision…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>

            {error && (
              <div className="mx-5 mt-4 bg-red-50 text-red-700 border border-red-200 rounded p-3 text-sm">{error}</div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <span className="loader" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">No fraud logs found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-striped">
                  <thead className="bg-gray-50 text-gray-600 text-left">
                    <tr>
                      <th className="px-5 py-3 font-medium">User</th>
                      <th className="px-5 py-3 font-medium">IP Address</th>
                      <th className="px-5 py-3 font-medium">Action</th>
                      <th className="px-5 py-3 font-medium">Risk Score</th>
                      <th className="px-5 py-3 font-medium">Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((log, i) => (
                      <tr key={i}>
                        <td className="px-5 py-3 font-medium text-gray-900">{log.user_id}</td>
                        <td className="px-5 py-3 text-gray-600 font-mono text-xs">{log.ip_address}</td>
                        <td className="px-5 py-3 text-gray-600">{log.action ?? '—'}</td>
                        <td className="px-5 py-3">
                          <RiskBadge score={log.risk_score} />
                        </td>
                        <td className="px-5 py-3">
                          <DecisionBadge decision={log.decision} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filtered.length} of {logs.length} events
            </div>
          </div>

          {/* Log activity form */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-5">Log New Activity</h2>

            {logMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded p-3 text-sm mb-4">{logMsg}</div>
            )}
            {logError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm mb-4">{logError}</div>
            )}

            <form onSubmit={handleLogActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  className="input-field"
                  placeholder="e.g. alice"
                  value={logUsername}
                  onChange={(e) => setLogUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select
                  className="input-field"
                  value={logAction}
                  onChange={(e) => setLogAction(e.target.value)}
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
                  placeholder="e.g. 192.168.1.100"
                  value={logIp}
                  onChange={(e) => setLogIp(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device</label>
                <input
                  className="input-field"
                  value={logDevice}
                  onChange={(e) => setLogDevice(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={logLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {logLoading ? <span className="loader" /> : null}
                {logLoading ? 'Logging…' : 'Submit Activity'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </Protected>
  );
}
