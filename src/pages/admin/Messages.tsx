import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MessagePanel from '@/components/MessagePanel';

const Messages = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Developer Communications</h1>
          <p className="text-gray-600">Communicate with system developers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Message Center</CardTitle>
            <CardDescription>Send and receive messages from the development team</CardDescription>
          </CardHeader>
          <CardContent>
            <MessagePanel role="admin" />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Messages; 