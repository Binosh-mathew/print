import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from '../config/axios';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';

import { Loader2, MessageSquare, RefreshCw, Reply } from 'lucide-react'; // Removed Send, User
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface Message {
  _id: string;
  id: string; // This might be the same as _id, depending on backend response
  content: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  recipient: { // Added recipient field
    id?: string; // For direct user-to-user or user-to-admin messages
    name: string; // e.g., "Developer Team", or an admin's name if sent directly
    role?: string; // Role of the recipient or recipient group
  };
  createdAt: string;
  status: 'read' | 'unread'; // Changed from read: boolean
}

interface MessagePanelProps {
  viewType?: 'inbox' | 'sent' | 'all';
  userId?: string; // ID of the current user viewing the panel
  userRole?: 'admin' | 'developer' | 'store'; // Role of the current user
  onReply?: (recipient: { id?: string; name: string; role?: string }) => void;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ viewType = 'all', userId, userRole, onReply }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  // Convert fetchMessages to useCallback to properly handle dependencies
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/messages');
      
      // Extract messages array from response, handling different possible structures
      let fetchedMessages: Message[] = [];
      
      if (Array.isArray(response.data)) {
        // If response.data is already an array
        fetchedMessages = response.data;
      } else if (response.data.messages && Array.isArray(response.data.messages)) {
        // If messages are in a "messages" property
        fetchedMessages = response.data.messages;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // If messages are in a "data" property (common pattern)
        fetchedMessages = response.data.data;
      }
      
      // Apply filtering based on viewType and userId
      if (userId && viewType === 'inbox') {
        fetchedMessages = fetchedMessages.filter(msg => {
          if (msg.recipient?.id) {
            return msg.recipient.id === userId; // Direct message to user
          } else if (msg.recipient?.role && userRole) {
            return msg.recipient.role === userRole; // Message to user's role group
          }
          return false;
        });
      } else if (userId && viewType === 'sent') {
        fetchedMessages = fetchedMessages.filter(msg => msg.sender?.id === userId);
      }

      // Sort messages by date (newest at the top for list/email style)
      const sortedMessages = fetchedMessages.sort((a: Message, b: Message) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setMessages(sortedMessages);
    } catch (error) {
      toast({
        title: "Error loading messages",
        description: "There was a problem loading your messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, userRole, viewType]); // Include all dependencies
  // Try to fix the issue where messages don't load on first mount by using an immediate loading effect
  useEffect(() => {
    // First load indicator
    setLoading(true);
  }, []);

  useEffect(() => {
    // Always attempt to fetch messages on initial mount, regardless of viewType
    // The fetchMessages function will handle the filtering based on viewType, userId, and userRole
    
    // For inbox/sent views, we still want to check if userId exists since it's needed for filtering
    if ((viewType === 'inbox' || viewType === 'sent') && !userId) {
      // If userId is needed but not available, show empty state
      setMessages([]);
      setLoading(false);
    } else {
      // Otherwise, fetch messages
      fetchMessages();
    }
  }, [fetchMessages, userId, viewType]); // Include userId and viewType to re-run when they change

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    setIsViewModalOpen(true);

    if (viewType === 'inbox' && message.status === 'unread') {      try {
        // Optimistically update UI
        setMessages(prevMessages =>
          prevMessages.map(m =>
            m._id === message._id ? { ...m, status: 'read' as 'read' } : m // Ensure type correctness
          )
        );
        await axios.put(`/messages/${message._id}/read`);
        // No need for toast on success, UI update is enough
      } catch (error) {
        // Handle error by reverting UI update
        // Revert UI update on error
        setMessages(prevMessages =>
          prevMessages.map(m =>
            // Revert to unread, or ideally, store original status if more complex states were possible
            m._id === message._id ? { ...m, status: 'unread' as 'unread' } : m 
          )
        );
        toast({
          title: 'Error',
          description: 'Could not mark message as read. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };


  const formatMessageDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Unknown date';
    }
  };


  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-primary" />
          <h2 className="text-lg font-semibold">
          {viewType === 'inbox' ? 'Inbox' : viewType === 'sent' ? 'Sent Messages' : 'All Messages'}
        </h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchMessages} 
          disabled={loading}
          className="flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="h-[400px] overflow-y-auto bg-gray-50 rounded-md p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="h-12 w-12 mb-2 text-gray-300" />
            <p>No messages found.</p>
            <p className="text-sm">Use the compose section below to start a conversation.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              // const isUser = isCurrentUser(msg.sender?.id); // Not needed for the new list style
              return (
                <div 
                  key={msg._id || msg.id} 
                  className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer ${msg.status === 'unread' && viewType === 'inbox' ? 'border-l-4 border-l-blue-500' : ''}`}
                  onClick={() => handleMessageClick(msg)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      {viewType === 'inbox' 
                        ? `From: ${msg.sender?.name || 'Unknown Sender'}` 
                        : `To: ${msg.recipient?.name || 'Unknown Recipient'}`}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatMessageDate(msg.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                  {viewType === 'inbox' && msg.status === 'unread' && (
                    <div className="mt-2 text-xs text-blue-600 font-medium">
                      New Message
                    </div>
                  )}
                  {viewType === 'inbox' && onReply && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent opening the message view modal
                          if (msg.sender) {
                            onReply(msg.sender);
                          }
                        }}
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {selectedMessage && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {viewType === 'inbox' ? 'Message Received' : 'Message Sent'}
              </DialogTitle>
              <DialogDescription>
                Details of the selected message.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* From/To Section */}
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right text-sm font-medium text-gray-600 col-span-1">
                  {viewType === 'inbox' ? 'From:' : 'To:'}
                </span>
                <span className="col-span-3 text-sm">
                  {viewType === 'inbox' 
                    ? selectedMessage.sender?.name || 'Unknown Sender' 
                    : selectedMessage.recipient?.name || 'Unknown Recipient'}
                </span>
              </div>

              {/* Date Section */}
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right text-sm font-medium text-gray-600 col-span-1">Date:</span>
                <span className="col-span-3 text-sm">
                  {formatMessageDate(selectedMessage.createdAt)}
                </span>
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right text-sm font-medium text-gray-600 col-span-1">Status:</span>
                <span className="col-span-3 text-sm">
                  {selectedMessage.status === 'read' ? 'Read' : 'Unread'}
                </span>
              </div>

              {/* Content Section */}
              <div className="grid grid-cols-1 gap-2 mt-2">
                <span className="text-sm font-medium text-gray-600">Content:</span>
                <div className="col-span-1 text-sm p-3 bg-gray-50 rounded-md border max-h-60 overflow-y-auto whitespace-pre-wrap break-words">
                  {selectedMessage.content}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MessagePanel;