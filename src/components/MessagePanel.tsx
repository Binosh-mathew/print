import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { messages, addMessage, markMessageAsRead, type Message } from '@/services/mockData';

const MessagePanel = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
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
        }
        
        const response = await axios.get('http://localhost:5000/api/messages', { headers });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
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
      setMessages([response.data, ...messages]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please make sure you are logged in.');
    }
  };

  return (
    <div>
      <h2>Messages</h2>
      <form onSubmit={handleSend} style={{ marginBottom: 16 }}>
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
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

export default MessagePanel; 