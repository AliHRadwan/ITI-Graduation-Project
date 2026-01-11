import { Bars3Icon, BellIcon, UserCircleIcon, MoonIcon, SunIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Dropdown, DropdownItem } from '@/components/ui';
import useAuthStore from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { isStaffRole } from '@/utils/permissions';
import { searchAPI } from '@/api';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isStaff = isStaffRole(user);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchValue.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const { data: searchResults, isFetching } = useQuery({
    queryKey: ['staff-search', debouncedQuery],
    queryFn: () => searchAPI.search(debouncedQuery),
    enabled: isStaff && debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  const results = useMemo(() => {
    if (!searchResults) return { tickets: [], conversations: [], rooms: [] };
    return {
      tickets: searchResults.tickets || [],
      conversations: searchResults.conversations || [],
      rooms: searchResults.rooms || [],
    };
  }, [searchResults]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    setShowResults(false);
    setSearchValue('');
    setDebouncedQuery('');
    navigate(path);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      <div className="flex-1">
        {isStaff && (
          <div className="relative max-w-lg">
            <div className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              <input
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                placeholder="Search tickets, conversations, rooms..."
                className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            {showResults && debouncedQuery.length >= 2 && (
              <div className="absolute left-0 right-0 mt-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg z-20">
                {isFetching ? (
                  <div className="p-3 text-xs text-gray-500 dark:text-gray-400">Searching…</div>
                ) : (
                  <div className="max-h-72 overflow-auto text-sm">
                    <div className="px-3 pt-3 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Tickets</div>
                    {results.tickets.length === 0 ? (
                      <div className="px-3 pb-2 text-xs text-gray-500 dark:text-gray-400">No tickets</div>
                    ) : (
                      results.tickets.map((ticket) => (
                        <button
                          key={ticket.id}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => handleNavigate(`/staff/tickets/${ticket.id}`)}
                        >
                          <div className="font-medium text-gray-900 dark:text-gray-100">#{ticket.id?.slice(0, 8)}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{ticket.category || ticket.description}</div>
                        </button>
                      ))
                    )}

                    <div className="px-3 pt-3 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Conversations</div>
                    {results.conversations.length === 0 ? (
                      <div className="px-3 pb-2 text-xs text-gray-500 dark:text-gray-400">No conversations</div>
                    ) : (
                      results.conversations.map((conversation) => (
                        <button
                          key={conversation.id}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => handleNavigate(`/staff/conversations/${conversation.id}`)}
                        >
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {conversation.guest_identity_id || conversation.id?.slice(0, 8)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Status: {conversation.status}
                          </div>
                        </button>
                      ))
                    )}

                    <div className="px-3 pt-3 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Rooms</div>
                    {results.rooms.length === 0 ? (
                      <div className="px-3 pb-3 text-xs text-gray-500 dark:text-gray-400">No rooms</div>
                    ) : (
                      results.rooms.map((room) => (
                        <div key={room.id} className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                          Room {room.room_number || room.number}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>

        {/* User menu */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
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
