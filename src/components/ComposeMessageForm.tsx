import React, { useState, useEffect } from 'react';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { ChevronsUpDown, Check } from 'lucide-react';
import axios from '../config/axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ComposeMessageFormProps {
  initialRecipient?: { id?: string; name: string; role?: string } | null;
  onMessageSent?: () => void;
  currentUserRole: 'admin' | 'developer';
}

interface Store {
  _id: string;
  name: string;
  // Add other relevant store fields if needed for display or logic
}

const ComposeMessageForm: React.FC<ComposeMessageFormProps> = ({ initialRecipient, onMessageSent, currentUserRole }) => {
  const [recipientDetails, setRecipientDetails] = useState<{ id?: string; name: string; role?: string } | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // For developer store selection
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  useEffect(() => {
    if (initialRecipient) {
      setRecipientDetails(initialRecipient);
      setSelectedStore(null); // Clear store selection if it's a reply
    } else if (currentUserRole === 'admin') {
      setRecipientDetails({ name: 'Developer Team', role: 'developer' });
    } else if (currentUserRole === 'developer') {
      // For new messages by developers, recipient is set via store selection
      setRecipientDetails(null);
      // Fetch stores
      const fetchStores = async () => {
        setIsLoadingStores(true);
        try {
          const response = await axios.get<Store[]>('/stores');
          setStores(response.data);
        } catch (error) {
          console.error('Error fetching stores:', error);
          toast({
            title: 'Failed to load stores',
            description: 'Could not fetch the list of stores. Please try again later.',
            variant: 'destructive',
          });
          setStores([]); // Ensure stores is an empty array on error
        }
        setIsLoadingStores(false);
      };
      fetchStores();
    }
  }, [initialRecipient, currentUserRole]);

  // Effect to update recipientDetails when a store is selected by a developer
  useEffect(() => {
    if (currentUserRole === 'developer' && selectedStore && !initialRecipient) {
      setRecipientDetails({
        id: selectedStore._id,
        name: selectedStore.name,
        role: 'store',
      });
    }
  }, [selectedStore, currentUserRole, initialRecipient]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setSending(true);
    try {
      // Get authentication data from localStorage
      const storedUser = localStorage.getItem('printShopUser');
      
      if (storedUser) {
        // const userData = JSON.parse(storedUser); // userData is not used
      } else {
        throw new Error('Authentication required to send messages');
      }
      
      await axios.post(
        '/messages', 
        { content: message, recipient: recipientDetails }, 
      );
      
      setMessage('');
      toast({
        title: "Message sent",
        description: `Your message has been sent to ${recipientDetails?.name || 'the recipient'}.`,
      });
      onMessageSent?.(); // Call the callback
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
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-700">To: </span>
          {initialRecipient || currentUserRole === 'admin' ? (
            <span className="text-sm text-gray-900">{recipientDetails?.name || (currentUserRole === 'admin' && !initialRecipient ? 'Developer Team' : 'Loading...')}</span>
          ) : (
            // Developer sending a new message - Store Selector Combobox
            <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isComboboxOpen}
                  className="w-[200px] justify-between truncate"
                  disabled={isLoadingStores}
                >
                  {selectedStore
                    ? stores.find((store) => store._id === selectedStore._id)?.name
                    : isLoadingStores ? "Loading stores..." : "Select store..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search store..." />
                  <CommandList>
                    <CommandEmpty>{isLoadingStores ? "Loading..." : stores.length === 0 ? "No stores found." : "No store found."}</CommandEmpty>
                    <CommandGroup>
                      {stores.map((store) => (
                        <CommandItem
                          key={store._id}
                          value={store.name} // Use store.name for search filtering
                          onSelect={(currentValue) => {
                            // Find the store object by name (currentValue)
                            const newSelectedStore = stores.find(s => s.name.toLowerCase() === currentValue.toLowerCase());
                            setSelectedStore(newSelectedStore || null);
                            setIsComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${selectedStore?._id === store._id ? "opacity-100" : "opacity-0"}`}
                          />
                          {store.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
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
            disabled={!message.trim() || sending || (currentUserRole === 'developer' && !initialRecipient && !selectedStore)}
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
