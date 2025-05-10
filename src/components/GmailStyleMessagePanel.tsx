import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { messages, addMessage, markMessageAsRead, type Message, stores } from '@/services/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { MessageSquare, Send, Circle, CheckCircle2 } from 'lucide-react';

interface GmailStyleMessagePanelProps {
  role: 'admin' | 'developer';
}

const GmailStyleMessagePanel = ({ role }: GmailStyleMessagePanelProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    setLocalMessages(messages);
    messages.forEach(msg => {
      if (!msg.read && msg.senderRole !== role) {
        markMessageAsRead(msg.id);
      }
    });
  }, [role]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;
    if (role === 'developer' && !selectedStore) return;

    const selectedStoreData = role === 'developer' ? stores.find(s => s.id === selectedStore) : undefined;

    const message = addMessage({
      senderId: user.id,
      senderName: user.name,
      senderRole: role,
      content: newMessage.trim(),
      read: false,
      storeId: selectedStoreData?.id,
      storeName: selectedStoreData?.name
    });

    setLocalMessages([message, ...localMessages]);
    setNewMessage('');
    setSelectedMessage(message);
    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully.",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Message List */}
      <Card className="w-1/3">
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Messages</h2>
          </div>
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="divide-y">
              {localMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedMessage?.id === msg.id ? 'bg-gray-100' : ''
                  } ${!msg.read && msg.senderRole !== role ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedMessage(msg)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {!msg.read && msg.senderRole !== role ? (
                        <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                      ) : (
                        <CheckCircle2 className="h-2 w-2 text-gray-400" />
                      )}
                      <span className="font-semibold">{msg.senderName}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(msg.timestamp)}
                    </span>
                  </div>
                  {msg.storeName && (
                    <div className="mt-1 text-xs text-gray-500">
                      Store: {msg.storeName}
                    </div>
                  )}
                  <p className="mt-1 text-sm text-gray-600 truncate">
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message View/Compose */}
      <Card className="flex-1">
        <CardContent className="p-0 h-full flex flex-col">
          {selectedMessage ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Message from {selectedMessage.senderName}
                    </h2>
                    {selectedMessage.storeName && (
                      <p className="text-sm text-gray-500">
                        Store: {selectedMessage.storeName}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedMessage.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select a message to view</p>
              </div>
            </div>
          )}
          
          <div className="p-4 border-t mt-auto">
            <div className="flex flex-col gap-4">
              {role === 'developer' && (
                <Select
                  value={selectedStore}
                  onValueChange={setSelectedStore}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select store to message" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[100px]"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || (role === 'developer' && !selectedStore)}
                className="self-end"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GmailStyleMessagePanel; 