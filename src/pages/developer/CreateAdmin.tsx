import React from 'react';
import DeveloperLayout from '@/components/layouts/DeveloperLayout';
import AdminStoreCreator from '@/components/developer/AdminStoreCreator';

const CreateAdmin = () => {
  return (
    <DeveloperLayout>
      <div className="max-w-2xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Create New Admin & Store</h1>
        <AdminStoreCreator />
      </div>
    </DeveloperLayout>
  );
};

export default CreateAdmin; 