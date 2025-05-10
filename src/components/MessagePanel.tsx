import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { messages, addMessage, markMessageAsRead, type Message } from '@/services/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface MessagePanelProps {
  role: 'admin' | 'developer';
}

const MessagePanel = ({ role }: MessagePanelProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Update messages and mark received messages as read
    setLocalMessages(messages);
    messages.forEach(msg => {
      if (!msg.read && msg.senderRole !== role) {
        markMessageAsRead(msg.id);
      }
    });
  }, [role]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message = addMessage({
      senderId: user.id,
      senderName: user.name,
      senderRole: role,
      content: newMessage.trim(),
      read: false
    });

    setLocalMessages([message, ...localMessages]);
    setNewMessage('');
    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>
          Communication between admins and developers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {localMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col p-3 rounded-lg ${
                  msg.senderRole === role
                    ? 'bg-primary/10 ml-auto'
                    : 'bg-muted'
                } max-w-[80%] ${
                  msg.senderRole === role ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">{msg.senderName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{msg.content}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagePanel; 