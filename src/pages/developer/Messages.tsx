import { useState } from 'react';
import DeveloperLayout from '@/components/layouts/DeveloperLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MessagePanel from '@/components/MessagePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Bell, Send, Edit, Inbox, SendHorizontal } from 'lucide-react';
import ComposeMessageForm from '@/components/ComposeMessageForm';
import { useAuth } from '@/contexts/AuthContext';

const Messages = () => {
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [replyToRecipient, setReplyToRecipient] = useState<{ id?: string; name: string; role?: string } | null>(null);
  const { user } = useAuth();
  const developerId = user?.id;

  const handleOpenComposeModal = (recipient: { id?: string; name: string; role?: string } | null = null) => {
    setReplyToRecipient(recipient); // For replies, recipient is set; for new, it's null.
    setIsComposeModalOpen(true);
  };

  return (
    <DeveloperLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Communications Center</h1>
            <p className="text-gray-600">Send messages to and receive messages from the Admin Team.</p>
          </div>
          
          <Button onClick={() => handleOpenComposeModal()}>
            <Edit className="h-4 w-4 mr-2" />
            Compose New Message
          </Button>
        </div>

        <Dialog open={isComposeModalOpen} onOpenChange={(isOpen) => {
          setIsComposeModalOpen(isOpen);
          if (!isOpen) {
            setReplyToRecipient(null); // Clear reply recipient when modal closes
          }
        }}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Send className="h-5 w-5 mr-2" />
                {replyToRecipient && replyToRecipient.id ? `Reply to ${replyToRecipient.name}` : 'Compose Message'}
              </DialogTitle>
              <DialogDescription>
                {replyToRecipient ? `Your message will be sent to ${replyToRecipient.name}.` : 'Fill in the form below to send a message to the Admin Team.'}
              </DialogDescription>
            </DialogHeader>
            <ComposeMessageForm 
              currentUserRole="developer"
              initialRecipient={replyToRecipient} 
              onMessageSent={() => {
                setIsComposeModalOpen(false);
                setReplyToRecipient(null);
              }}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="inbox" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="inbox" className="flex items-center">
              <Inbox className="h-4 w-4 mr-2" />
              Inbox
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center">
              <SendHorizontal className="h-4 w-4 mr-2" />
              Sent Messages
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="inbox">
            <Card>
              <CardHeader>
                <CardTitle>Inbox</CardTitle>
                <CardDescription>Messages received.</CardDescription>
              </CardHeader>
              <CardContent>
                <MessagePanel 
                  viewType="inbox" 
                  userId={developerId} 
                  userRole={user?.role as 'developer' | 'admin' | 'store'}
                  onReply={(recipient) => {
                    handleOpenComposeModal(recipient);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sent">
            <Card>
              <CardHeader>
                <CardTitle>Sent Messages</CardTitle>
                <CardDescription>Messages you have sent.</CardDescription>
              </CardHeader>
              <CardContent>
                <MessagePanel viewType="sent" userId={developerId} userRole={user?.role as 'developer' | 'admin' | 'store'} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>System Notifications</CardTitle>
                <CardDescription>Important updates and announcements.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-amber-50 p-4 border border-amber-200 text-amber-800">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Bell className="h-5 w-5 text-amber-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium">Coming Soon</h3>
                      <div className="mt-2 text-sm">
                        <p>
                          This section will display important system notifications and announcements.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DeveloperLayout>
  );
};

export default Messages;