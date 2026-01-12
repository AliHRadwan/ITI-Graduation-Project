import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  TicketIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  UsersIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  BookOpenIcon,
  PaperClipIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import Header from './Header';
import AnimatedOutlet from '@/components/animations/AnimatedOutlet';
import { useNotifications } from '@/context/NotificationsContext';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Tickets', href: '/admin/tickets', icon: TicketIcon },
  { name: 'Conversations', href: '/admin/conversations', icon: ChatBubbleLeftRightIcon },
  { name: 'Rooms', href: '/admin/rooms', icon: BuildingOfficeIcon },
  { name: 'Attachments', href: '/admin/attachments', icon: PaperClipIcon },
  { name: 'Notifications Log', href: '/admin/notifications-logs', icon: BellIcon },
  { name: 'Staff', href: '/admin/staff/users', icon: UsersIcon },
  { name: 'Departments', href: '/admin/staff/departments', icon: BuildingOfficeIcon },
  { name: 'Knowledge Base', href: '/admin/knowledge-base', icon: BookOpenIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { counts } = useNotifications();

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Hotel Concierge</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            const badge =
              item.href === '/admin/tickets'
                ? counts.tickets
                : item.href === '/admin/conversations'
                ? counts.conversations
                : item.href === '/admin/attachments'
                ? counts.attachments
                : item.href === '/admin/settings'
                ? counts.sla
                : item.href === '/admin/notifications-logs'
                ? counts.logs
                : 0;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group relative flex items-center px-3 py-2 mt-1 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <span
                  className={`absolute left-0 top-2 bottom-2 w-1 rounded-r bg-blue-500 transition-opacity duration-200 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <item.icon className="h-5 w-5 mr-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                <span className="flex-1">{item.name}</span>
                {badge > 0 && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Admin Dashboard</p>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6">
          <AnimatedOutlet />
        </main>
      </div>
    </div>
  );
}
