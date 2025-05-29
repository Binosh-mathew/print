import DeveloperLayout from '@/components/layouts/DeveloperLayout';
import GmailStyleMessagePanel from '@/components/GmailStyleMessagePanel';

const Messages = () => {
  return (
    <DeveloperLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-gray-600">Communication center for developer-admin messages</p>
        </div>

        <GmailStyleMessagePanel  />
      </div>
    </DeveloperLayout>
  );
};

export default Messages; 