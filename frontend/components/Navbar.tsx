
'use client';

import Cookies from 'js-cookie';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
	{ href: '/dashboard', label: 'Dashboard', icon: '⊞' },
	{ href: '/fraud', label: 'Fraud Logs', icon: '🛡' },
	{ href: '/analytics', label: 'Analytics', icon: '📊' },
	{ href: '/devices', label: 'Activity', icon: '💻' },
	{ href: '/qr', label: 'TOTP / 2FA', icon: '🔐' },
	{ href: '/crypto', label: 'Crypto Tools', icon: '🔑' },
];

function decodeJwtSub(token: string): string {
	try {
		const payload = token.split('.')[1];
		const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
		return json.sub ?? '';
	} catch {
		return '';
	}
}

export default function Navbar() {
	const pathname = usePathname();
	const [username, setUsername] = useState('');
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		const token = Cookies.get('token');
		if (token) setUsername(decodeJwtSub(token));
	}, []);

	const logout = () => {
		Cookies.remove('token');
		Cookies.remove('refresh_token');
		window.location.href = '/login';
	};

	return (
		<header className="bg-slate-900 text-white shadow-lg">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Brand */}
					<Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight">
						<span className="text-blue-400 text-xl">🔒</span>
						<span>SecureID</span>
					</Link>

					{/* Desktop nav */}
					<nav className="hidden md:flex items-center gap-1">
						{NAV_LINKS.map(({ href, label, icon }) => {
							const active = pathname === href || pathname.startsWith(href + '/');
							return (
								<Link
									key={href}
									href={href}
									className={`flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-colors ${
										active
											? 'bg-blue-600 text-white'
											: 'text-slate-300 hover:bg-slate-700 hover:text-white'
									}`}
								>
									<span>{icon}</span>
									{label}
								</Link>
							);
						})}
					</nav>

					{/* User / logout */}
					<div className="flex items-center gap-4">
						{username && (
							<span className="hidden sm:block text-sm text-slate-400">
								👤 <span className="text-slate-200 font-medium">{username}</span>
							</span>
						)}
						<button
							onClick={logout}
							className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded transition-colors"
						>
							Logout
						</button>
						{/* Mobile hamburger */}
						<button
							className="md:hidden text-slate-300 hover:text-white"
							onClick={() => setMenuOpen((o) => !o)}
							aria-label="Toggle menu"
						>
							☰
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			{menuOpen && (
				<div className="md:hidden bg-slate-800 border-t border-slate-700 px-4 py-3 flex flex-col gap-1">
					{NAV_LINKS.map(({ href, label, icon }) => {
						const active = pathname === href;
						return (
							<Link
								key={href}
								href={href}
								onClick={() => setMenuOpen(false)}
								className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
									active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
								}`}
							>
								{icon} {label}
							</Link>
						);
					})}
				</div>
			)}
		</header>
	);
}
