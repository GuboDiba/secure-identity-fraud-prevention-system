'use client';

import axios from 'axios';
import Cookies from 'js-cookie';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Protected from '@/components/Protected';
import { API } from '@/config/api';

type Tool =
  | 'luhn'
  | 'verhoeff'
  | 'hash'
  | 'hmac'
  | 'aes'
  | 'rsa';

const TOOLS: { id: Tool; icon: string; label: string; desc: string }[] = [
  { id: 'luhn', icon: '🔢', label: 'Luhn', desc: 'Generate & validate Luhn check digits (credit card IDs).' },
  { id: 'verhoeff', icon: '🔣', label: 'Verhoeff', desc: 'Generate & validate Verhoeff check digits.' },
  { id: 'hash', icon: '#️⃣', label: 'SHA-256', desc: 'Hash arbitrary data using SHA-256.' },
  { id: 'hmac', icon: '🔏', label: 'HMAC', desc: 'Generate and verify HMAC-SHA256 signatures.' },
  { id: 'aes', icon: '🔓', label: 'AES', desc: 'Encrypt and decrypt data with AES (256-bit).' },
  { id: 'rsa', icon: '🗝️', label: 'RSA', desc: 'Generate RSA key pairs, sign data, and verify signatures.' },
];

function ResultBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4">
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm text-gray-800 break-all whitespace-pre-wrap select-all">
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ valid }: { valid: boolean }) {
  return valid ? (
    <span className="badge-success text-base">✅ Valid</span>
  ) : (
    <span className="badge-danger text-base">❌ Invalid</span>
  );
}

function LuhnTool() {
  const [base, setBase] = useState('');
  const [number, setNumber] = useState('');
  const [genResult, setGenResult] = useState('');
  const [valResult, setValResult] = useState<boolean | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = () => ({ Authorization: `Bearer ${Cookies.get('token')}` });

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setGenResult('');
    setLoading(true);
    try {
      const res = await axios.post(API.CRYPTO.LUHN.GENERATE, { base }, { headers: auth() });
      setGenResult(res.data.generated_id ?? JSON.stringify(res.data));
    } catch (e: unknown) {
      setErr(axios.isAxiosError(e) ? e.response?.data?.detail ?? 'Error' : 'Error');
    } finally { setLoading(false); }
  };

  const validate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setValResult(null);
    setLoading(true);
    try {
      const res = await axios.post(API.CRYPTO.LUHN.VALIDATE, { number }, { headers: auth() });
      setValResult(res.data.valid);
    } catch (e: unknown) {
      setErr(axios.isAxiosError(e) ? e.response?.data?.detail ?? 'Error' : 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="font-semibold mb-4">Generate Luhn Number</h3>
        {err && <div className="badge-danger mb-3 block text-sm">{err}</div>}
        <form onSubmit={generate} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base digits</label>
            <input className="input-field font-mono" placeholder="e.g. 123456789" value={base} onChange={(e) => setBase(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <span className="loader" /> : null} Generate
          </button>
        </form>
        {genResult && <ResultBox label="Generated ID" value={genResult} />}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Validate Luhn Number</h3>
        <form onSubmit={validate} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number to validate</label>
            <input className="input-field font-mono" placeholder="e.g. 1234567897" value={number} onChange={(e) => setNumber(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <span className="loader" /> : null} Validate
          </button>
        </form>
        {valResult !== null && <div className="mt-4"><StatusBadge valid={valResult} /></div>}
      </div>
    </div>
  );
}

function VerhoeffTool() {
  const [base, setBase] = useState('');
  const [number, setNumber] = useState('');
  const [genResult, setGenResult] = useState('');
  const [valResult, setValResult] = useState<boolean | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = () => ({ Authorization: `Bearer ${Cookies.get('token')}` });

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setGenResult('');
    setLoading(true);
    try {
      const res = await axios.post(API.CRYPTO.VERHOEFF.GENERATE, { base }, { headers: auth() });
      setGenResult(res.data.generated_id ?? JSON.stringify(res.data));
    } catch (e: unknown) {
      setErr(axios.isAxiosError(e) ? e.response?.data?.detail ?? 'Error' : 'Error');
    } finally { setLoading(false); }
  };

  const validate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setValResult(null);
    setLoading(true);
    try {
      const res = await axios.post(API.CRYPTO.VERHOEFF.VALIDATE, { number }, { headers: auth() });
      setValResult(res.data.valid);
    } catch (e: unknown) {
      setErr(axios.isAxiosError(e) ? e.response?.data?.detail ?? 'Error' : 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="font-semibold mb-4">Generate Verhoeff Number</h3>
        {err && <div className="badge-danger mb-3 block text-sm">{err}</div>}
        <form onSubmit={generate} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base digits</label>
            <input className="input-field font-mono" placeholder="e.g. 236" value={base} onChange={(e) => setBase(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <span className="loader" /> : null} Generate
          </button>
        </form>
        {genResult && <ResultBox label="Generated ID" value={genResult} />}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Validate Verhoeff Number</h3>
        <form onSubmit={validate} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number to validate</label>
            <input className="input-field font-mono" placeholder="e.g. 2363" value={number} onChange={(e) => setNumber(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <span className="loader" /> : null} Validate
          </button>
        </form>
        {valResult !== null && <div className="mt-4"><StatusBadge valid={valResult} /></div>}
      </div>
    </div>
  );
}

function HashTool() {
  const [data, setData] = useState('');
  const [result, setResult] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = () => ({ Authorization: `Bearer ${Cookies.get('token')}` });

  const hash = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setResult('');
    setLoading(true);
    try {
      const res = await axios.post(API.CRYPTO.HASH, { data }, { headers: auth() });
      setResult(res.data.hash ?? JSON.stringify(res.data));
    } catch (e: unknown) {
      setErr(axios.isAxiosError(e) ? e.response?.data?.detail ?? 'Error' : 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="card max-w-xl">
      <h3 className="font-semibold mb-4">SHA-256 Hash</h3>
      {err && <div className="badge-danger mb-3 block text-sm">{err}</div>}
      <form onSubmit={hash} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data to hash</label>
          <textarea className="input-field resize-none" rows={3} placeholder="Enter any string…" value={data} onChange={(e) => setData(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <span className="loader" /> : null} Hash
        </button>
      </form>
      {result && <ResultBox label="SHA-256 Hash" value={result} />}
    </div>
  );
}

function HmacTool() {
  const [genData, setGenData] = useState('');
  const [genSecret, setGenSecret] = useState('');
  const [genResult, setGenResult] = useState('');
  const [verData, setVerData] = useState('');
  const [verSecret, setVerSecret] = useState('');
  const [verSig, setVerSig] = useState('');
  const [verResult, setVerResult] = useState<boolean | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = () => ({ Authorization: `Bearer ${Cookies.get('token')}` });

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setGenResult('');
    setLoading(true);
    try {
      const res = await axios.post(API.CRYPTO.HMAC.GENERATE, { data: genData, secret: genSecret }, { headers: auth() });
      setGenResult(res.data.signature ?? JSON.stringify(res.data));
    } catch (e: unknown) {
      setErr(axios.isAxiosError(e) ? e.response?.data?.detail ?? 'Error' : 'Error');
    } finally { setLoading(false); }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setVerResult(null);
    setLoading(true);
    try {
      const res = await axios.post(API.CRYPTO.HMAC.VERIFY, { data: verData, secret: verSecret, signature: verSig }, { headers: auth() });
      setVerResult(res.data.valid);
    } catch (e: unknown) {
      setErr(axios.isAxiosError(e) ? e.response?.data?.detail ?? 'Error' : 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="font-semibold mb-4">Generate HMAC</h3>
        {err && <div className="badge-danger mb-3 block text-sm">{err}</div>}
        <form onSubmit={generate} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <textarea className="input-field resize-none" rows={2} value={genData} onChange={(e) => setGenData(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
            <input type="password" className="input-field" value={genSecret} onChange={(e) => setGenSecret(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <span className="loader" /> : null} Generate Signature
          </button>
        </form>
        {genResult && <ResultBox label="HMAC Signature" value={genResult} />}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Verify HMAC</h3>
        <form onSubmit={verify} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <textarea className="input-field resize-none" rows={2} value={verData} onChange={(e) => setVerData(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
            <input type="password" className="input-field" value={verSecret} onChange={(e) => setVerSecret(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Signature</label>
            <input className="input-field font-mono text-xs" value={verSig} onChange={(e) => setVerSig(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <span className="loader" /> : null} Verify
          </button>
        </form>
        {verResult !== null && <div className="mt-4"><StatusBadge valid={verResult} /></div>}
      </div>
    </div>
  );
}

function AesTool() {
  const [plaintext, setPlaintext] = useState('');
  const [encSecret, setEncSecret] = useState('');
  const [encResult, setEncResult] = useState<{ iv: string; ciphertext: string } | null>(null);
  const [decIv, setDecIv] = useState('');
  const [decCipher, setDecCipher] = useState('');
  const [decSecret, setDecSecret] = useState('');
  const [decResult, setDecResult] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = () => ({ Authorization: `Bearer ${Cookies.get('token')}` });

  const encrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setEncResult(null);
    setLoading(true);
    try {
      const res = await axios.post(API.CRYPTO.AES.ENCRYPT, { plaintext, secret: encSecret }, { headers: auth() });
      setEncResult(res.data);
      // Prefill decrypt fields for convenience
      setDecIv(res.data.iv ?? '');
      setDecCipher(res.data.ciphertext ?? '');
      setDecSecret(encSecret);
    } catch (e: unknown) {
      setErr(axios.isAxiosError(e) ? e.response?.data?.detail ?? 'Error' : 'Error');
    } finally { setLoading(false); }
  };

  const decrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setDecResult('');
    setLoading(true);
    try {
      const res = await axios.post(API.CRYPTO.AES.DECRYPT, { iv: decIv, ciphertext: decCipher, secret: decSecret }, { headers: auth() });
      setDecResult(res.data.plaintext ?? JSON.stringify(res.data));
    } catch (e: unknown) {
      setErr(axios.isAxiosError(e) ? e.response?.data?.detail ?? 'Error' : 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="font-semibold mb-4">AES Encrypt</h3>
        {err && <div className="badge-danger mb-3 block text-sm">{err}</div>}
        <form onSubmit={encrypt} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plaintext</label>
            <textarea className="input-field resize-none" rows={3} value={plaintext} onChange={(e) => setPlaintext(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
            <input type="password" className="input-field" placeholder="16, 24 or 32 chars" value={encSecret} onChange={(e) => setEncSecret(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <span className="loader" /> : null} Encrypt
          </button>
        </form>
        {encResult && (
          <div className="space-y-2 mt-4">
            <ResultBox label="IV" value={encResult.iv ?? ''} />
            <ResultBox label="Ciphertext" value={encResult.ciphertext ?? ''} />
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">AES Decrypt</h3>
        <form onSubmit={decrypt} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IV</label>
            <input className="input-field font-mono text-xs" value={decIv} onChange={(e) => setDecIv(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciphertext</label>
            <textarea className="input-field font-mono text-xs resize-none" rows={2} value={decCipher} onChange={(e) => setDecCipher(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
            <input type="password" className="input-field" value={decSecret} onChange={(e) => setDecSecret(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <span className="loader" /> : null} Decrypt
          </button>
        </form>
        {decResult && <ResultBox label="Plaintext" value={decResult} />}
      </div>
    </div>
  );
}

function RsaTool() {
  const [keys, setKeys] = useState<{ public_key: string; private_key: string } | null>(null);
  const [signData, setSignData] = useState('');
  const [signResult, setSignResult] = useState('');
  const [verData, setVerData] = useState('');
  const [verSig, setVerSig] = useState('');
  const [verResult, setVerResult] = useState<boolean | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = () => ({ Authorization: `Bearer ${Cookies.get('token')}` });

  const generateKeys = async () => {
    setErr(''); setKeys(null);
    setLoading(true);
    try {
      const res = await axios.post(API.CRYPTO.RSA.GENERATE_KEYS, {}, { headers: auth() });
      setKeys(res.data);
    } catch (e: unknown) {
      setErr(axios.isAxiosError(e) ? e.response?.data?.detail ?? 'Error' : 'Error');
    } finally { setLoading(false); }
  };

  const sign = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setSignResult('');
    setLoading(true);
    try {
      const res = await axios.post(API.CRYPTO.RSA.SIGN, { data: signData }, { headers: auth() });
      setSignResult(res.data.signature ?? JSON.stringify(res.data));
      // Prefill verify fields
      setVerData(signData);
      setVerSig(res.data.signature ?? '');
    } catch (e: unknown) {
      setErr(axios.isAxiosError(e) ? e.response?.data?.detail ?? 'Error' : 'Error');
    } finally { setLoading(false); }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setVerResult(null);
    setLoading(true);
    try {
      const res = await axios.post(API.CRYPTO.RSA.VERIFY, { data: verData, signature: verSig }, { headers: auth() });
      setVerResult(res.data.valid);
    } catch (e: unknown) {
      setErr(axios.isAxiosError(e) ? e.response?.data?.detail ?? 'Error' : 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Key generation */}
      <div className="card">
        <h3 className="font-semibold mb-2">Generate RSA Key Pair</h3>
        <p className="text-sm text-gray-500 mb-4">Keys are stored server-side. Click to generate a new pair.</p>
        {err && <div className="badge-danger mb-3 block text-sm">{err}</div>}
        <button onClick={generateKeys} disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <span className="loader" /> : null} Generate Key Pair
        </button>
        {keys && (
          <div className="mt-4 space-y-3">
            <ResultBox label="Public Key" value={keys.public_key} />
            <ResultBox label="Private Key" value={keys.private_key} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sign */}
        <div className="card">
          <h3 className="font-semibold mb-4">Sign Data</h3>
          <form onSubmit={sign} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data to sign</label>
              <textarea className="input-field resize-none" rows={3} value={signData} onChange={(e) => setSignData(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <span className="loader" /> : null} Sign
            </button>
          </form>
          {signResult && <ResultBox label="Signature" value={signResult} />}
        </div>

        {/* Verify */}
        <div className="card">
          <h3 className="font-semibold mb-4">Verify Signature</h3>
          <form onSubmit={verify} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <textarea className="input-field resize-none" rows={2} value={verData} onChange={(e) => setVerData(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Signature</label>
              <textarea className="input-field font-mono text-xs resize-none" rows={3} value={verSig} onChange={(e) => setVerSig(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <span className="loader" /> : null} Verify
            </button>
          </form>
          {verResult !== null && <div className="mt-4"><StatusBadge valid={verResult} /></div>}
        </div>
      </div>
    </div>
  );
}

const TOOL_COMPONENTS: Record<Tool, React.FC> = {
  luhn: LuhnTool,
  verhoeff: VerhoeffTool,
  hash: HashTool,
  hmac: HmacTool,
  aes: AesTool,
  rsa: RsaTool,
};

export default function CryptoPage() {
  const [active, setActive] = useState<Tool>('luhn');
  const ActiveTool = TOOL_COMPONENTS[active];

  return (
    <Protected>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Cryptographic Tools</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            ID validation, hashing, symmetric and asymmetric encryption.
          </p>
        </div>

        {/* Tool selector */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-8">
          {TOOLS.map(({ id, icon, label, desc }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              title={desc}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg border text-sm font-medium transition-all ${
                active === id
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Active tool */}
        <div className="fade-in">
          <ActiveTool />
        </div>
      </main>
    </Protected>
  );
}
