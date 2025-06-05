import React, { useState } from 'react';
import axios from '../config/axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ComposeMessageForm: React.FC = () => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setSending(true);
    try {
      // Get authentication data from localStorage
      const storedUser = localStorage.getItem('printShopUser');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
      } else {
        throw new Error('Authentication required to send messages');
      }
      
      await axios.post(
        '/messages', 
        { content: message },
      );
      
      setMessage('');
      toast({
        title: "Message sent",
        description: "Your message has been sent to the development team.",
      });
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

  return (
    <div className="space-y-4">
      <form onSubmit={handleSend} className="space-y-4">
        <Textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="resize-none min-h-[150px]"
          disabled={sending}
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!message.trim() || sending}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </form>
      
      <div className="text-sm text-gray-500 mt-4">
        <p className="mb-2">Tips:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Be specific about your issue or question</li>
          <li>Include relevant details like order numbers if applicable</li>
          <li>Responses may take up to 24 hours during business days</li>
        </ul>
      </div>
    </div>
  );
};

export default ComposeMessageForm;
