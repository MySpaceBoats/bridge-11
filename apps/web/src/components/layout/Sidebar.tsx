'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, GitBranch, Calendar, MessageCircle,
  Image, BarChart2, Wallet, Settings, LogOut, Users, Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useFamilyStore } from '@/store/family.store';
import { Avatar } from '@/components/ui/Avatar';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tree', label: 'Family Tree', icon: GitBranch },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/albums', label: 'Albums', icon: Image },
  { href: '/polls', label: 'Polls', icon: BarChart2 },
  { href: '/contributions', label: 'Contributions', icon: Wallet },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { currentFamily } = useFamilyStore();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Family Bridge</p>
            {currentFamily && (
              <p className="text-xs text-gray-500 truncate max-w-[140px]">{currentFamily.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user + settings */}
      <div className="border-t border-gray-100 p-4 space-y-2">
        <Link
          href="/admin"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          <Settings className="w-4 h-4" />
          Admin
        </Link>
        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar src={user.avatarUrl} firstName={user.firstName} lastName={user.lastName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
