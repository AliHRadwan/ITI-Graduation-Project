import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { conversationsAPI } from '@/api';
import { Badge, Spinner, EmptyState, Tabs, TabList, TabButton, TabPanels, TabPanel } from '@/components/ui';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const statusColors = {
  open: 'success',
  handoff: 'warning',
  closed: 'default',
};

export default function ConversationList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const statuses = ['open', 'handoff', 'closed'];
  const status = statuses[activeTab];

  const { data, isLoading } = useQuery({
    queryKey: ['conversations', status],
    queryFn: () => conversationsAPI.getConversations({ status }),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const conversations = Array.isArray(data) ? data : data?.data || [];

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
          description={`No ${status} conversations at the moment`}
        />
      );
    }

    return (
      <div className="divide-y divide-gray-200">
        {conversationList.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => navigate(`/admin/conversations/${conversation.id}`)}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">
                    {conversation.guest_identity?.metadata?.first_name ||
                      conversation.guest_identity?.metadata?.username ||
                      'Guest'}
                  </h3>
                  <Badge variant={statusColors[conversation.status]} size="sm">
                    {conversation.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Room: {conversation.room?.room_number || 'Not assigned'}
                </p>
                {conversation.last_message && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {conversation.last_message.content}
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Tabs onChange={setActiveTab}>
          <TabList>
            <TabButton>Active ({conversations?.length || 0})</TabButton>
            <TabButton>Handoff</TabButton>
            <TabButton>Closed</TabButton>
          </TabList>
          <TabPanels>
            <TabPanel>{renderConversations(conversations)}</TabPanel>
            <TabPanel>{renderConversations(conversations)}</TabPanel>
            <TabPanel>{renderConversations(conversations)}</TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
}

