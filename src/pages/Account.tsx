
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Account() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('You have been signed out successfully');
    window.location.href = '/';
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Your Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{user?.user_metadata?.name || 'User'}</h3>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="mt-6">
                  <Button variant="outline">Update Profile</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
                <CardDescription>Overview of your account and usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Reports</p>
                    <p className="text-2xl font-semibold">12</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Shared Reports</p>
                    <p className="text-2xl font-semibold">3</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Storage Used</p>
                    <p className="text-2xl font-semibold">4.2 MB</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Reports This Month</p>
                    <p className="text-2xl font-semibold">5</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Recent Activity</h3>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-md">
                      <p className="text-sm font-medium">Report Created: "Research Paper Final Draft"</p>
                      <p className="text-xs text-muted-foreground">Today at 10:23 AM</p>
                    </div>
                    <div className="p-3 border rounded-md">
                      <p className="text-sm font-medium">Report Shared with john.doe@example.com</p>
                      <p className="text-xs text-muted-foreground">Yesterday at 3:45 PM</p>
                    </div>
                    <div className="p-3 border rounded-md">
                      <p className="text-sm font-medium">Account Settings Updated</p>
                      <p className="text-xs text-muted-foreground">May 10, 2025 at 2:30 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Download Account Data</Button>
                <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
