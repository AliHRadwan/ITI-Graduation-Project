import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { conversationsAPI } from '@/api';
import { Card, Button, Textarea, Badge, Spinner } from '@/components/ui';
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const roleColors = {
  user: 'primary',
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

  const { data: messagesData, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => conversationsAPI.getMessages(id),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const messages = Array.isArray(messagesData) ? messagesData : [];
  const normalizedStatus = conversation?.status ? conversation.status.toUpperCase() : '';

  const sendMessageMutation = useMutation({
    mutationFn: (data) => conversationsAPI.sendMessage(id, data),
    onSuccess: (response) => {
      const newMessage = response?.data || response;
      queryClient.setQueryData(['messages', id], (old) => {
        const existing = Array.isArray(old) ? old : [];
        if (newMessage && newMessage.id) {
          return [...existing, newMessage];
        }
        return existing;
      });
      setMessageText('');
      toast.success('Message sent');
    },
    onError: () => toast.error('Failed to send message'),
  });

  const statusMutation = useMutation({
    mutationFn: (status) => conversationsAPI.updateStatus(id, status),
    onSuccess: (response) => {
      const updated = response?.data || response;
      if (updated) {
        queryClient.setQueryData(['conversation', id], updated);
      } else {
        queryClient.invalidateQueries(['conversation', id]);
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      console.debug('Conversation status updated', response);
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
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
              {conversation.participant?.name || 'Guest Conversation'}
            </h1>
            <p className="text-gray-600">
              Room: {conversation.room?.room_number || 'Not assigned'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={
              normalizedStatus === 'OPEN'
                ? 'success'
                : normalizedStatus === 'HANDOFF'
                ? 'warning'
                : 'default'
            }
          >
            {normalizedStatus || 'N/A'}
          </Badge>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => statusMutation.mutate('OPEN')}
            disabled={normalizedStatus === 'OPEN'}
          >
            Open
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => statusMutation.mutate('HANDOFF')}
            disabled={normalizedStatus === 'HANDOFF'}
          >
            Handoff
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => statusMutation.mutate('CLOSED')}
            disabled={normalizedStatus === 'CLOSED'}
          >
            Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Messages */}
        <div className="lg:col-span-3">
          <Card padding={false}>
            <div className="h-[600px] flex flex-col">
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isMessagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  messages?.map((message) => {
                    const senderType = message.sender_type || message.role;
                    const isUser = senderType === 'user' || senderType === 'guest';
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-4 ${
                            isUser ? 'bg-gray-100' : 'bg-blue-600 text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={roleColors[senderType] || 'info'} size="sm">
                              {senderType}
                            </Badge>
                            <span className="text-xs opacity-70">
                              {message.created_at ? format(new Date(message.created_at), 'HH:mm') : 'N/A'}
                            </span>
                          </div>
                          <p className="text-sm">{message.body || message.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {normalizedStatus !== 'CLOSED' && (
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
                  {conversation.participant?.name || 'Guest'}
                </p>
              </div>
              <div>
                <label className="text-gray-600">Guest ID</label>
                <p className="font-medium">{conversation.guest?.channel_user_id || 'N/A'}</p>
              </div>
              <div>
                <label className="text-gray-600">Channel</label>
                <p className="font-medium capitalize">
                  {conversation.guest?.channel_type || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-gray-600">Language</label>
                <p className="font-medium">
                  {conversation.guest?.preferred_language || 'en'}
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
                  <label className="text-gray-600">Status</label>
                  <p className="font-medium">{conversation.room.status || 'N/A'}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
