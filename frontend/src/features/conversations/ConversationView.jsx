import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { conversationsAPI } from '@/api';
import { Card, Button, Textarea, Badge, Spinner } from '@/components/ui';
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const roleColors = {
  guest: 'primary',
  assistant: 'info',
  staff: 'success',
};

export default function ConversationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const [messageText, setMessageText] = useState('');

  const { data: conversation, isLoading } = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => conversationsAPI.getConversation(id),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: messagesData } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => conversationsAPI.getMessages(id),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const messages = Array.isArray(messagesData) ? messagesData : messagesData?.data || [];

  const sendMessageMutation = useMutation({
    mutationFn: (data) => conversationsAPI.sendMessage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', id]);
      setMessageText('');
      toast.success('Message sent');
    },
    onError: () => toast.error('Failed to send message'),
  });

  const handoffMutation = useMutation({
    mutationFn: (data) => conversationsAPI.handoff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversation', id]);
      toast.success('Conversation handed off to staff');
    },
    onError: () => toast.error('Failed to handoff conversation'),
  });

  const closeConversationMutation = useMutation({
    mutationFn: () => conversationsAPI.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversation', id]);
      toast.success('Conversation closed');
    },
    onError: () => toast.error('Failed to close conversation'),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    sendMessageMutation.mutate({
      role: 'staff',
      content: messageText,
    });
  };

  const handleHandoff = () => {
    handoffMutation.mutate({
      reason: 'Staff manually requested handoff',
      priority: 'medium',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!conversation) {
    return <div>Conversation not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {conversation.guest_identity?.metadata?.first_name ||
                conversation.guest_identity?.metadata?.username ||
                'Guest Conversation'}
            </h1>
            <p className="text-gray-600">
              Room: {conversation.room?.room_number || 'Not assigned'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={conversation.status === 'open' ? 'success' : 'warning'}>
            {conversation.status}
          </Badge>
          {conversation.status === 'open' && (
            <Button size="sm" variant="secondary" onClick={handleHandoff}>
              Request Handoff
            </Button>
          )}
          {conversation.status !== 'closed' && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => closeConversationMutation.mutate()}
            >
              Close
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Messages */}
        <div className="lg:col-span-3">
          <Card padding={false}>
            <div className="h-[600px] flex flex-col">
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'guest' ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        message.role === 'guest'
                          ? 'bg-gray-100'
                          : message.role === 'staff'
                          ? 'bg-blue-600 text-white'
                          : 'bg-green-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={roleColors[message.role]} size="sm">
                          {message.role}
                        </Badge>
                        <span className="text-xs opacity-70">
                          {message.created_at ? format(new Date(message.created_at), 'HH:mm') : 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {conversation.status !== 'closed' && (
                <div className="border-t border-gray-200 p-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      rows={2}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendMessageMutation.isLoading}
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold mb-4">Guest Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-600">Name</label>
                <p className="font-medium">
                  {conversation.guest_identity?.metadata?.first_name}{' '}
                  {conversation.guest_identity?.metadata?.last_name}
                </p>
              </div>
              <div>
                <label className="text-gray-600">Username</label>
                <p className="font-medium">
                  {conversation.guest_identity?.metadata?.username || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-gray-600">Channel</label>
                <p className="font-medium capitalize">
                  {conversation.guest_identity?.channel_type}
                </p>
              </div>
              <div>
                <label className="text-gray-600">Language</label>
                <p className="font-medium">
                  {conversation.guest_identity?.preferred_language || 'en'}
                </p>
              </div>
            </div>
          </Card>

          {conversation.room && (
            <Card>
              <h3 className="font-semibold mb-4">Room Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-gray-600">Room Number</label>
                  <p className="font-medium">{conversation.room.room_number}</p>
                </div>
                <div>
                  <label className="text-gray-600">Type</label>
                  <p className="font-medium">{conversation.room.room_type}</p>
                </div>
                <div>
                  <label className="text-gray-600">Floor</label>
                  <p className="font-medium">{conversation.room.floor}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

