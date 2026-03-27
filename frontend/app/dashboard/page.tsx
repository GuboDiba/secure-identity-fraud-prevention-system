'use client';

import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Protected from '@/components/Protected';
import { API } from '@/config/api';

function decodeJwtSub(token: string): string {
  try {
    const payload = token.split('.')[1];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return json.sub ?? '';
  } catch {
    return '';
  }
}

interface QuickStats {
  fraudLogs: number;
  topRiskUsers: number;
  dailyBlocks: number;
  totpUsers: number;
}

const SECTIONS = [
  {
    href: '/fraud',
    icon: '🛡️',
    title: 'Fraud Logs',
    desc: 'Review detected fraud events and risk scores for each user session.',
    color: 'border-red-400',
  },
  {
    href: '/analytics',
    icon: '📊',
    title: 'Analytics',
    desc: 'Top risk users and daily blocked request trends.',
    color: 'border-blue-400',
  },
  {
    href: '/devices',
    icon: '💻',
    title: 'Activity Log',
    desc: 'Log and inspect user activity events for anomaly detection.',
    color: 'border-purple-400',
  },
  {
    href: '/qr',
    icon: '🔐',
    title: 'TOTP / 2FA',
    desc: 'Enroll users in two-factor authentication and verify TOTP codes.',
    color: 'border-green-400',
  },
  {
    href: '/crypto',
    icon: '🔑',
    title: 'Crypto Tools',
    desc: 'Luhn, Verhoeff, SHA-256, HMAC, AES encryption, and RSA signatures.',
    color: 'border-yellow-400',
  },
];

export default function DashboardPage() {
  const [username, setUsername] = useState('');
  const [stats, setStats] = useState<QuickStats>({ fraudLogs: 0, topRiskUsers: 0, dailyBlocks: 0, totpUsers: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) setUsername(decodeJwtSub(token));

    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.allSettled([
      axios.get(API.FRAUD.LOGS, { headers: authHeader }),
      axios.get(API.ANALYTICS.TOP_RISK_USERS, { headers: authHeader }),
      axios.get(API.ANALYTICS.DAILY_BLOCKS, { headers: authHeader }),
      axios.get(API.TOTP.USERS, { headers: authHeader }),
    ]).then(([fraudRes, riskRes, blocksRes, totpRes]) => {
      setStats({
        fraudLogs:
          fraudRes.status === 'fulfilled'
            ? (fraudRes.value.data?.logs?.length ?? 0)
            : 0,
        topRiskUsers:
          riskRes.status === 'fulfilled'
            ? (Array.isArray(riskRes.value.data) ? riskRes.value.data.length : 0)
            : 0,
        dailyBlocks:
          blocksRes.status === 'fulfilled'
            ? (Array.isArray(blocksRes.value.data) ? blocksRes.value.data.length : 0)
            : 0,
        totpUsers:
          totpRes.status === 'fulfilled'
            ? (Array.isArray(totpRes.value.data) ? totpRes.value.data.length : 0)
            : 0,
      });
    }).finally(() => setLoadingStats(false));
  }, []);

  return (
    <Protected>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{username ? `, ${username}` : ''}!
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s a real-time overview of your fraud prevention system.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Fraud Events', value: stats.fraudLogs, icon: '🚨', color: 'text-red-600' },
            { label: 'Top Risk Users', value: stats.topRiskUsers, icon: '⚠️', color: 'text-orange-500' },
            { label: 'Daily Blocks', value: stats.dailyBlocks, icon: '🚫', color: 'text-purple-600' },
            { label: 'TOTP Users', value: stats.totpUsers, icon: '🔐', color: 'text-green-600' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="card text-center">
              <div className="text-3xl mb-2">{icon}</div>
              <div className={`text-3xl font-bold ${color}`}>
                {loadingStats ? <span className="loader inline-block" /> : value}
              </div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Section cards */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">System Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SECTIONS.map(({ href, icon, title, desc, color }) => (
            <Link
              key={href}
              href={href}
              className={`card border-l-4 ${color} hover:scale-[1.01] transition-transform block`}
            >
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{desc}</p>
              <span className="inline-block mt-4 text-blue-600 text-sm font-medium">Open →</span>
            </Link>
          ))}
        </div>
      </main>
    </Protected>
  );
}
