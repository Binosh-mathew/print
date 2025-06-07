import React, { useState, useEffect } from 'react';
import UserLayout from '@/components/layouts/UserLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useAuthStore from '@/store/authStore';

const Profile = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  // Initialize state with user data
  const [profileData, setProfileData] = useState({
    name: user?.username || user?.username || '',
  });
  
  // Update profile data when user data changes
  useEffect(() => {
    console.log('User data in Profile:', user);
    if (user) {
      setProfileData({
        name: user.username || user.username || ''
      });
    }
  }, [user]);
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();
    // setIsUpdatingProfile(true);
    
    // try {
    //   // Update user profile using the context method - only update name
    //   await updateUserProfile({
    //     name: profileData.name
    //   });
      
    //   toast({
    //     title: "Profile updated",
    //     description: "Your username has been updated successfully.",
    //   });
    // } catch (error) {
    //   console.error('Error updating profile:', error);
    //   toast({
    //     title: "Update failed",
    //     description: "There was a problem updating your profile.",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsUpdatingProfile(false);
    // }
  };

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center mb-6">
              <User className="h-6 w-6 mr-2" />
              <h2 className="text-2xl font-bold">Profile Information</h2>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Username - Editable */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-medium">Username</Label>
                <Input 
                  id="name" 
                  value={profileData.name}
                  onChange={(e) => setProfileData({ name: e.target.value })}
                  className="h-12 text-base"
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              {/* Email - Read-only */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                <div className="flex items-center border rounded-md p-3 bg-gray-50">
                  <Mail className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">{user?.email || 'No email available'}</span>
                </div>
                <p className="text-sm text-gray-500">Email address cannot be changed</p>
              </div>
              
              <Button 
                type="submit" 
                className="bg-purple-500 hover:bg-purple-600 h-12 px-6 text-base"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default Profile;
