import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
// import { messages, addMessage, markMessageAsRead, type Message, stores } from '@/services/mockData';

const GmailStyleMessagePanel = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/messages');
        setMessages(response.data);
      } catch (error) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const response = await axios.post('http://localhost:5000/api/messages', { content: newMessage });
      setMessages([response.data, ...messages]);
      setNewMessage('');
    } catch (error) {
      // handle error
    }
  };

  return (
    <div>
      <h2>Gmail Style Messages</h2>
      <form onSubmit={handleSend} style={{ marginBottom: 16,  marginTop:12}}>
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className='p-2 border rounded outline-none focus:ring-2 focus:ring-primary-500'
        />
        <Button className='primary ml-2 '>Send</Button>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : messages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <ul>
          {messages.map((msg) => (
            <li key={msg.id}>{msg.content}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GmailStyleMessagePanel; 