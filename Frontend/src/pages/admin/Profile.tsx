import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAdminStoreProfile } from '@/api';
import { Loader2, Store } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';

interface StoreProfile {
  id: string;
  name: string;
  location: string;
  email: string;
  status: string;
}

const AdminProfile: React.FC = () => {
  const [storeProfile, setStoreProfile] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStoreProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminStoreProfile();
        console.log(data)
        setStoreProfile(data);


        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load store profile');
        console.error('Error loading store profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStoreProfile();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Store Profile</h1>
          <p className="text-muted-foreground">
            View your store's information
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                <p>{error}</p>
                <p className="mt-2">Please try again later</p>
              </div>
            </CardContent>
          </Card>
        ) : storeProfile ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                {storeProfile.name}
              </CardTitle>
              <CardDescription>
                Store details and information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Store Name</h3>
                    <p className="text-foreground">{storeProfile.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Email Address</h3>
                    <p className="text-foreground">{storeProfile.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Location</h3>
                    <p className="text-foreground">{storeProfile.location}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Status</h3>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      storeProfile.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {storeProfile.status.charAt(0).toUpperCase() + storeProfile.status.slice(1)}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    This information is read-only. Contact support if you need to update your store details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p>No store profile information available</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
