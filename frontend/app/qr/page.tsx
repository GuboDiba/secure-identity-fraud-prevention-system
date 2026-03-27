'use client';

import axios from 'axios';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Protected from '@/components/Protected';
import { API } from '@/config/api';

type Tab = 'enroll' | 'qr' | 'verify' | 'users';

interface TotpUser {
  username?: string;
  user_id?: string;
  enrolled_at?: string;
}

export default function QRPage() {
  const [tab, setTab] = useState<Tab>('enroll');

  // Enroll
  const [enrollUser, setEnrollUser] = useState('');
  const [enrollPass, setEnrollPass] = useState('');
  const [enrollMsg, setEnrollMsg] = useState('');
  const [enrollErr, setEnrollErr] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  // QR code
  const [qrUsername, setQrUsername] = useState('');
  const [qrData, setQrData] = useState<{ qr_code?: string; otpauth_url?: string } | null>(null);
  const [qrErr, setQrErr] = useState('');
  const [qrLoading, setQrLoading] = useState(false);

  // Verify
  const [verifyUser, setVerifyUser] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [verifyResult, setVerifyResult] = useState<{ valid?: boolean; message?: string } | null>(null);
  const [verifyErr, setVerifyErr] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Users list
  const [users, setUsers] = useState<TotpUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersErr, setUsersErr] = useState('');

  const authHeader = () => {
    const token = Cookies.get('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersErr('');
    try {
      const res = await axios.get(API.TOTP.USERS, { headers: authHeader() });
      setUsers(Array.isArray(res.data) ? res.data : res.data?.users ?? []);
    } catch {
      setUsersErr('Failed to load TOTP users.');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'users') loadUsers();
  }, [tab]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollMsg('');
    setEnrollErr('');
    if (!enrollUser.trim() || !enrollPass) {
      setEnrollErr('Username and password are required.');
      return;
    }
    setEnrolling(true);
    try {
      const res = await axios.post(
        API.TOTP.REGISTER,
        { username: enrollUser.trim(), password: enrollPass },
        { headers: authHeader() },
      );
      setEnrollMsg(res.data?.message ?? 'User enrolled in TOTP successfully.');
      setEnrollUser('');
      setEnrollPass('');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setEnrollErr(err.response?.data?.detail || 'Enrollment failed.');
      } else {
        setEnrollErr('Unexpected error.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleFetchQR = async (e: React.FormEvent) => {
    e.preventDefault();
    setQrData(null);
    setQrErr('');
    if (!qrUsername.trim()) { setQrErr('Username is required.'); return; }
    setQrLoading(true);
    try {
      const res = await axios.get(API.TOTP.QR(qrUsername.trim()), { headers: authHeader() });
      setQrData(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setQrErr(err.response?.data?.detail || 'Could not fetch QR code.');
      } else {
        setQrErr('Unexpected error.');
      }
    } finally {
      setQrLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyResult(null);
    setVerifyErr('');
    if (!verifyUser.trim() || !verifyToken.trim()) {
      setVerifyErr('Username and token are required.');
      return;
    }
    setVerifying(true);
    try {
      const res = await axios.post(
        API.TOTP.VERIFY,
        { username: verifyUser.trim(), token: verifyToken.trim() },
        { headers: authHeader() },
      );
      setVerifyResult(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setVerifyErr(err.response?.data?.detail || 'Verification failed.');
      } else {
        setVerifyErr('Unexpected error.');
      }
    } finally {
      setVerifying(false);
    }
  };

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'enroll', label: 'Enroll User', icon: '➕' },
    { id: 'qr', label: 'Get QR Code', icon: '📷' },
    { id: 'verify', label: 'Verify Token', icon: '✅' },
    { id: 'users', label: 'TOTP Users', icon: '👥' },
  ];

  return (
    <Protected>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">TOTP / Two-Factor Authentication</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Enroll users, generate QR codes for authenticator apps, and verify time-based OTP tokens.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t transition-colors ${
                tab === id
                  ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Enroll */}
        {tab === 'enroll' && (
          <div className="card max-w-md">
            <h2 className="font-semibold text-gray-800 mb-1">Enroll User in TOTP</h2>
            <p className="text-sm text-gray-500 mb-5">
              Registers a user for TOTP 2FA. They can then scan a QR code with an authenticator app.
            </p>
            {enrollMsg && <div className="bg-green-50 border border-green-200 text-green-700 rounded p-3 text-sm mb-4">{enrollMsg}</div>}
            {enrollErr && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm mb-4">{enrollErr}</div>}
            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input className="input-field" placeholder="Username" value={enrollUser} onChange={(e) => setEnrollUser(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" className="input-field" placeholder="Password" value={enrollPass} onChange={(e) => setEnrollPass(e.target.value)} required />
              </div>
              <button type="submit" disabled={enrolling} className="btn-primary w-full flex items-center justify-center gap-2">
                {enrolling ? <span className="loader" /> : null}
                {enrolling ? 'Enrolling…' : 'Enroll User'}
              </button>
            </form>
          </div>
        )}

        {/* QR Code */}
        {tab === 'qr' && (
          <div className="card max-w-md">
            <h2 className="font-semibold text-gray-800 mb-1">Generate QR Code</h2>
            <p className="text-sm text-gray-500 mb-5">
              Retrieve the QR code for a TOTP-enrolled user to scan with Google Authenticator or Authy.
            </p>
            {qrErr && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm mb-4">{qrErr}</div>}
            <form onSubmit={handleFetchQR} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input className="input-field" placeholder="Enter username" value={qrUsername} onChange={(e) => setQrUsername(e.target.value)} required />
              </div>
              <button type="submit" disabled={qrLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                {qrLoading ? <span className="loader" /> : null}
                {qrLoading ? 'Loading…' : 'Get QR Code'}
              </button>
            </form>
            {qrData && (
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                {qrData.qr_code ? (
                  <Image
                    src={`data:image/png;base64,${qrData.qr_code}`}
                    alt="TOTP QR Code"
                    width={200}
                    height={200}
                    className="mx-auto rounded"
                    unoptimized
                  />
                ) : (
                  <div className="text-gray-500 text-sm">QR code data received but no image available.</div>
                )}
                {qrData.otpauth_url && (
                  <p className="text-xs text-gray-400 break-all mt-3 font-mono">{qrData.otpauth_url}</p>
                )}
                <p className="text-xs text-gray-500 mt-3">Scan with Google Authenticator, Authy, or any TOTP app.</p>
              </div>
            )}
          </div>
        )}

        {/* Verify */}
        {tab === 'verify' && (
          <div className="card max-w-md">
            <h2 className="font-semibold text-gray-800 mb-1">Verify TOTP Token</h2>
            <p className="text-sm text-gray-500 mb-5">
              Check a 6-digit one-time token from the user's authenticator app.
            </p>
            {verifyErr && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm mb-4">{verifyErr}</div>}
            {verifyResult && (
              <div className={`rounded p-3 text-sm mb-4 border ${verifyResult.valid ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {verifyResult.valid ? '✅ Token is valid.' : '❌ Token is invalid or expired.'}
                {verifyResult.message ? ` ${verifyResult.message}` : ''}
              </div>
            )}
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input className="input-field" placeholder="Username" value={verifyUser} onChange={(e) => setVerifyUser(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">TOTP Token</label>
                <input
                  className="input-field font-mono text-xl tracking-widest text-center"
                  placeholder="000000"
                  maxLength={6}
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <button type="submit" disabled={verifying} className="btn-primary w-full flex items-center justify-center gap-2">
                {verifying ? <span className="loader" /> : null}
                {verifying ? 'Verifying…' : 'Verify Token'}
              </button>
            </form>
          </div>
        )}

        {/* Users list */}
        {tab === 'users' && (
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">TOTP-Enrolled Users</h2>
              <button onClick={loadUsers} className="btn-secondary text-sm py-1.5 px-3">↻ Refresh</button>
            </div>
            {usersErr && <div className="m-5 bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">{usersErr}</div>}
            {usersLoading ? (
              <div className="flex items-center justify-center py-16"><span className="loader" /></div>
            ) : users.length === 0 ? (
              <div className="text-center py-16 text-gray-400">No TOTP-enrolled users found.</div>
            ) : (
              <table className="w-full text-sm table-striped">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    <th className="px-5 py-3 font-medium">#</th>
                    <th className="px-5 py-3 font-medium">Username</th>
                    <th className="px-5 py-3 font-medium">Enrolled At</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i}>
                      <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">{u.username ?? u.user_id ?? '—'}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{u.enrolled_at ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </Protected>
  );
}
