import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MessagePanel from '@/components/MessagePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Bell, Info, Send } from 'lucide-react';
import ComposeMessageForm from '@/components/ComposeMessageForm';

const Messages = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Developer Communications</h1>
            <p className="text-gray-600">Communicate with system developers and receive important updates</p>
          </div>
          
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-200">
            <Info className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">Messages are monitored during business hours (9 AM - 5 PM)</p>
          </div>
        </div>

        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="messages" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages">
            <div className="grid gap-6 md:grid-cols-12">
              {/* Message Inbox */}
              <Card className="md:col-span-8">
                <CardHeader className="pb-3">
                  <CardTitle>Message Inbox</CardTitle>
                  <CardDescription>View messages from the development team</CardDescription>
                </CardHeader>
                <CardContent>
                  <MessagePanel role="admin" />
                </CardContent>
              </Card>
              
              {/* Compose Message Section */}
              <Card className="md:col-span-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Send className="h-5 w-5 mr-2" />
                    Compose Message
                  </CardTitle>
                  <CardDescription>Send a new message to the development team</CardDescription>
                </CardHeader>
                <CardContent>
                  <ComposeMessageForm />
                </CardContent>
              </Card>
            </div>
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