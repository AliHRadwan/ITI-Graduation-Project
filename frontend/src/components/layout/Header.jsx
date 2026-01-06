import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Dropdown, DropdownItem } from '@/components/ui';
import useAuthStore from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-500 hover:text-gray-700"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>

        {/* User menu */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
              <UserCircleIcon className="h-8 w-8" />
              <span className="hidden md:block">{user?.name || user?.email}</span>
            </button>
          }
        >
          <DropdownItem onClick={handleLogout}>Sign out</DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}

