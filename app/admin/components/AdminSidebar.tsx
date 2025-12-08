'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  CreditCard,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Wrench,
  MessageSquare,
  Ticket,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Image from 'next/image';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Gyms', href: '/admin/gyms', icon: Building2 },
  { name: 'Cities', href: '/admin/cities', icon: MapPin },
  { name: 'Facilities', href: '/admin/facilities', icon: Wrench },
  { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
  { name: 'Promo Codes', href: '/admin/promo-codes', icon: Ticket },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
];

interface AdminSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-fitcamp-royal-blue hover:bg-fitcamp-royal-blue/90 text-white border-fitcamp-royal-blue shadow-md"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-sm',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 sm:px-8 border-b border-gray-200">
            <Link href="/admin/dashboard" className="flex items-center">
              <Image
                src="/assets/images/logos/Logo.svg"
                alt="Fitcamp Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 sm:px-6 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-fitcamp-royal-blue text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 sm:p-6 border-t border-gray-200 space-y-3">
            {/* User Profile */}
            {user && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-fitcamp-royal-blue text-white">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.name || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email || ''}
                  </p>
                </div>
              </div>
            )}
            {/* Sign Out Button */}
            <Button
              variant="outline"
              className="w-full justify-center px-4 py-3.5 rounded-xl hover:bg-gray-100"
              onClick={() => signOut({ callbackUrl: '/admin/sign-in' })}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

