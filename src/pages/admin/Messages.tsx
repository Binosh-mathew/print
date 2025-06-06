import { useState } from 'react'; // Removed React, useEffect
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MessagePanel from '@/components/MessagePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'; // Removed DialogTrigger
import { Bell, Send, Edit, Inbox, SendHorizontal } from 'lucide-react'; // Removed MessageSquare, Info; Corrected SendHorizIcon
import ComposeMessageForm from '@/components/ComposeMessageForm';
import { useAuth } from '@/contexts/AuthContext'; 

const Messages = () => {
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [replyToRecipient, setReplyToRecipient] = useState<{ id?: string; name: string; role?: string } | null>(null);
  const { user } = useAuth(); 
  const adminId = user?.id; // Assuming user object has 'id'. Verify this from AuthContext. 

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Developer Communications</h1>
            <p className="text-gray-600">Communicate with system developers and receive important updates</p>
          </div>
          
          <Button onClick={() => {
            setReplyToRecipient(null); // Ensure it's a new message, not a reply
            setIsComposeModalOpen(true);
          }}>
            <Edit className="h-4 w-4 mr-2" />
            Compose New Message
          </Button>
        </div>

        {/* Compose Message Modal Dialog */}
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
                {replyToRecipient ? `Reply to ${replyToRecipient.name}` : 'Compose Message'}
              </DialogTitle>
              <DialogDescription>
                {replyToRecipient ? `Your message will be sent to ${replyToRecipient.name}.` : 'Fill in the form below to send a message.'}
              </DialogDescription>
            </DialogHeader>
            <ComposeMessageForm 
              currentUserRole="admin"
              initialRecipient={replyToRecipient} 
              onMessageSent={() => {
              setIsComposeModalOpen(false);
              setReplyToRecipient(null);
            }} />
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
                <CardDescription>Messages received from the development team and others.</CardDescription>
              </CardHeader>
              <CardContent>
                <MessagePanel 
                  viewType="inbox" 
                  userId={adminId} 
                  userRole={user?.role as 'developer' | 'admin' | 'store'}
                  onReply={(recipient) => {
                    setReplyToRecipient(recipient);
                    setIsComposeModalOpen(true);
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
                {/* TODO: Ensure MessagePanel can filter for sent messages using adminId */}
                <MessagePanel viewType="sent" userId={adminId} userRole={user?.role as 'developer' | 'admin' | 'store'} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>System Notifications</CardTitle>
                <CardDescription>Important updates and announcements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-amber-50 p-4 border border-amber-200 text-amber-800">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Bell className="h-5 w-5 text-amber-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium">Attention</h3>
                      <div className="mt-2 text-sm">
                        <p>
                          This feature is coming soon. You'll be able to receive system notifications and announcements here.
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
    </AdminLayout>
  );
};

export default Messages;