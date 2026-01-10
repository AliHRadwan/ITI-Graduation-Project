import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { conversationsAPI } from '@/api';
import { Badge, Spinner, EmptyState, Tabs, TabList, TabButton, TabPanels, TabPanel, Pagination, Input } from '@/components/ui';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const statusColors = {
  OPEN: 'success',
  HANDOFF: 'warning',
  CLOSED: 'default',
};

export default function ConversationList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 3;
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const statuses = [null, 'OPEN', 'HANDOFF', 'CLOSED'];
  const status = statuses[activeTab];
  const statusLabel = status || 'ALL';

  const { data, isLoading } = useQuery({
    queryKey: ['conversations', statusLabel, page, debouncedSearch],
    queryFn: () =>
      conversationsAPI.getConversations(
        status
          ? { status, page, per_page: perPage, q: debouncedSearch || undefined }
          : { page, per_page: perPage, q: debouncedSearch || undefined }
      ),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const conversations = data?.items || [];
  const pagination = data?.pagination || null;

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const aTime = new Date(a.updated_at || a.created_at || a.last_seen_at || a.started_at || 0).getTime();
      const bTime = new Date(b.updated_at || b.created_at || b.last_seen_at || b.started_at || 0).getTime();
      return bTime - aTime;
    });
  }, [conversations]);

  const renderConversations = (convos) => {
    if (isLoading) {
      return (
        <div className="p-12">
          <Spinner size="lg" />
        </div>
      );
    }

    // Ensure convos is an array
    const conversationList = Array.isArray(convos) ? convos : [];

    if (conversationList.length === 0) {
      return (
        <EmptyState
          icon={ChatBubbleLeftRightIcon}
          title="No conversations"
          description={
            debouncedSearch
              ? 'No results found'
              : `No ${statusLabel} conversations at the moment`
          }
        />
      );
    }

    const basePath = location.pathname.startsWith('/staff') ? '/staff' : '/admin';

    return (
      <div className="divide-y divide-gray-200">
        {conversationList.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => navigate(`${basePath}/conversations/${conversation.id}`)}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">
                    {conversation.participant?.name || 'Guest'}
                  </h3>
                  {(() => {
                    const normalizedStatus = conversation.status?.toUpperCase();
                    return (
                      <Badge variant={statusColors[normalizedStatus]} size="sm">
                        {normalizedStatus || 'N/A'}
                      </Badge>
                    );
                  })()}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Room: {conversation.room?.room_number || 'Not assigned'}
                </p>
                {conversation.last_message?.body && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {conversation.last_message.body}
                  </p>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {conversation.updated_at || conversation.last_seen_at
                  ? format(new Date(conversation.updated_at || conversation.last_seen_at), 'MMM d, HH:mm')
                  : 'N/A'}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
        <p className="text-gray-600">Manage guest conversations</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <Tabs selectedIndex={activeTab} onChange={setActiveTab}>
          <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <TabList className="border-b-0">
              <TabButton>All ({conversations?.length || 0})</TabButton>
              <TabButton>Open</TabButton>
              <TabButton>Handoff</TabButton>
              <TabButton>Closed</TabButton>
            </TabList>
            <div className="w-full sm:max-w-xs">
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <TabPanels>
            <TabPanel>{renderConversations(sortedConversations)}</TabPanel>
            <TabPanel>{renderConversations(sortedConversations)}</TabPanel>
            <TabPanel>{renderConversations(sortedConversations)}</TabPanel>
            <TabPanel>{renderConversations(sortedConversations)}</TabPanel>
          </TabPanels>
        </Tabs>
      </div>

      {pagination?.last_page > 1 && (
        <Pagination
          currentPage={pagination.current_page || 1}
          totalPages={pagination.last_page || 1}
          onPageChange={(nextPage) => {
            if (nextPage < 1 || nextPage > (pagination.last_page || 1)) return;
            setPage(nextPage);
          }}
        />
      )}
    </div>
  );
}
