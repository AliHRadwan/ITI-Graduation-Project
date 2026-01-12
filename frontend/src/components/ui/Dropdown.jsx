import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function Dropdown({
  trigger,
  children,
  align = 'right',
  className = '',
}) {
  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
  };

  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      <Menu.Button as="div">{trigger}</Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute ${alignClasses[align]} mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-gray-800 rounded-md bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10`}
        >
          <div className="px-1 py-1">{children}</div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export function DropdownItem({ children, onClick, icon: Icon, className = '' }) {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          onClick={onClick}
          className={`${
            active
              ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100'
              : 'text-gray-900 dark:text-gray-100'
          } group flex w-full items-center rounded-md px-2 py-2 text-sm ${className}`}
        >
          {Icon && <Icon className="mr-2 h-5 w-5" aria-hidden="true" />}
          {children}
        </button>
      )}
    </Menu.Item>
  );
}
