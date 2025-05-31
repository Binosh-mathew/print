import React, { useState, useEffect, useRef } from 'react';
import axios from '../config/axios';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, MessageSquare, User, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface Message {
  _id: string;
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  read: boolean;
}

interface MessagePanelProps {
  role?: string;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ role = 'user' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userData, setUserData] = useState<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('printShopUser');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
    
    fetchMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Get authentication data from localStorage
      const storedUser = localStorage.getItem('printShopUser');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
      }
      
      const response = await axios.get('/messages');
      // Sort messages by date (newest at the bottom)
      const sortedMessages = await response.data.sort((a: Message, b: Message) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error loading messages",
        description: "There was a problem loading your messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      // Get authentication data from localStorage
      const storedUser = localStorage.getItem('printShopUser');
      let headers = {};
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        headers = {
          'Authorization': `Bearer ${userData.token}`,
          'X-User-ID': userData.id,
          'X-User-Role': userData.role
        };
      } else {
        throw new Error('Authentication required to send messages');
      }
      
      const response = await axios.post(
        'http://localhost:5000/api/messages', 
        { content: newMessage },
        { headers }
      );
      
      // Add the new message to the end of the list
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please make sure you are logged in and try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const formatMessageDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Unknown date';
    }
  };

  const isCurrentUser = (senderId: string) => {
    return userData && userData.id === senderId;
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-primary" />
          <h2 className="text-lg font-semibold">Inbox</h2>
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
          <div className="space-y-4">
            {messages.map((msg) => {
              const isUser = isCurrentUser(msg.sender?.id);
              return (
                <div 
                  key={msg._id || msg.id} 
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[80%]`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className={isUser ? 'bg-primary text-white' : 'bg-gray-200'}>
                        {isUser ? userData?.name?.charAt(0) || 'U' : msg.sender?.role?.charAt(0) || 'D'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div 
                        className={`rounded-lg p-3 ${isUser 
                          ? 'bg-primary text-white' 
                          : 'bg-white border border-gray-200'}`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                        <span className="font-medium mr-1">
                          {isUser ? 'You' : msg.sender?.name || (msg.sender?.role === 'developer' ? 'Developer' : 'Admin')}
                        </span>
                        • {formatMessageDate(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagePanel; 