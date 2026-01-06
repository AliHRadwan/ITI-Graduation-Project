import { Tab } from '@headlessui/react';

export default function Tabs({ children, className = '' }) {
  return <Tab.Group className={className}>{children}</Tab.Group>;
}

export function TabList({ children, className = '' }) {
  return (
    <Tab.List className={`flex space-x-1 border-b border-gray-200 ${className}`}>
      {children}
    </Tab.List>
  );
}

export function TabButton({ children }) {
  return (
    <Tab
      className={({ selected }) =>
        `px-4 py-2 text-sm font-medium focus:outline-none ${
          selected
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`
      }
    >
      {children}
    </Tab>
  );
}

export function TabPanels({ children, className = '' }) {
  return <Tab.Panels className={`mt-4 ${className}`}>{children}</Tab.Panels>;
}

export function TabPanel({ children, className = '' }) {
  return <Tab.Panel className={className}>{children}</Tab.Panel>;
}

