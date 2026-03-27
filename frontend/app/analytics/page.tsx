'use client';

import axios from 'axios';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Protected from '@/components/Protected';
import { API } from '@/config/api';

interface RiskUser {
  username?: string;
  user_id?: string;
  risk_score?: number;
  total_score?: number;
  events?: number;
}

interface DailyBlock {
  date?: string;
  day?: string;
  count?: number;
  blocked?: number;
}

function RiskBar({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const color = pct > 66 ? 'bg-red-500' : pct > 33 ? 'bg-yellow-400' : 'bg-green-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-8 text-right">{score}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const [riskUsers, setRiskUsers] = useState<RiskUser[]>([]);
  const [dailyBlocks, setDailyBlocks] = useState<DailyBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    const token = Cookies.get('token');
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    setError('');
    try {
      const [riskRes, blocksRes] = await Promise.all([
        axios.get(API.ANALYTICS.TOP_RISK_USERS, { headers }),
        axios.get(API.ANALYTICS.DAILY_BLOCKS, { headers }),
      ]);
      setRiskUsers(Array.isArray(riskRes.data) ? riskRes.data : riskRes.data?.users ?? []);
      setDailyBlocks(Array.isArray(blocksRes.data) ? blocksRes.data : blocksRes.data?.blocks ?? []);
    } catch {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const maxRisk = Math.max(...riskUsers.map((u) => u.risk_score ?? u.total_score ?? 0), 1);
  const maxBlocks = Math.max(...dailyBlocks.map((d) => d.count ?? d.blocked ?? 0), 1);

  return (
    <Protected>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 text-sm mt-0.5">Risk trends and daily block statistics</p>
          </div>
          <button onClick={fetchData} className="btn-secondary self-start">↻ Refresh</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <span className="loader scale-150" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top risk users */}
            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-1">🚨 Top Risk Users</h2>
              <p className="text-xs text-gray-400 mb-5">Users with the highest cumulative risk scores</p>

              {riskUsers.length === 0 ? (
                <div className="text-center py-10 text-gray-400">No data available.</div>
              ) : (
                <div className="space-y-4">
                  {riskUsers.map((u, i) => {
                    const name = u.username ?? u.user_id ?? `User ${i + 1}`;
                    const score = u.risk_score ?? u.total_score ?? 0;
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            <span className="text-gray-400 mr-1">#{i + 1}</span> {name}
                          </span>
                          {u.events !== undefined && (
                            <span className="text-xs text-gray-400">{u.events} events</span>
                          )}
                        </div>
                        <RiskBar score={score} max={maxRisk} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Daily blocks */}
            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-1">🚫 Daily Blocked Requests</h2>
              <p className="text-xs text-gray-400 mb-5">Number of blocked requests per day</p>

              {dailyBlocks.length === 0 ? (
                <div className="text-center py-10 text-gray-400">No data available.</div>
              ) : (
                <div className="space-y-3">
                  {dailyBlocks.map((d, i) => {
                    const label = d.date ?? d.day ?? `Day ${i + 1}`;
                    const count = d.count ?? d.blocked ?? 0;
                    const pct = maxBlocks > 0 ? Math.round((count / maxBlocks) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-24 shrink-0">{label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                          <div
                            className="bg-blue-500 h-2.5 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary stats */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: 'Risk Users Tracked',
                  value: riskUsers.length,
                  icon: '👥',
                  color: 'text-purple-600',
                },
                {
                  label: 'Avg Risk Score',
                  value: riskUsers.length
                    ? Math.round(
                        riskUsers.reduce((s, u) => s + (u.risk_score ?? u.total_score ?? 0), 0) /
                          riskUsers.length,
                      )
                    : 0,
                  icon: '📈',
                  color: 'text-orange-500',
                },
                {
                  label: 'Days Tracked',
                  value: dailyBlocks.length,
                  icon: '📅',
                  color: 'text-blue-600',
                },
                {
                  label: 'Total Blocked',
                  value: dailyBlocks.reduce((s, d) => s + (d.count ?? d.blocked ?? 0), 0),
                  icon: '🚫',
                  color: 'text-red-600',
                },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="card text-center py-5">
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </Protected>
  );
}
