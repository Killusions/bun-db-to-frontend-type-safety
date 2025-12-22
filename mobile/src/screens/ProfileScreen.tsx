import React, { useState } from 'react';
import { View, Text, ScrollView, Alert as RNAlert } from 'react-native';
import { useAuthStatus, signOut, useIsAdmin } from '../client/auth';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { Avatar, AvatarFallback } from '../components/ui/Avatar';
import { formatDateTime, getInitials } from '../lib/utils';

export default function ProfileScreen() {
  const { user, session } = useAuthStatus();
  const isAdmin = useIsAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    RNAlert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            setError('');

            try {
              const { error: authError } = await signOut();
              if (authError) {
                setError(authError.message || 'Logout failed. Please try again.');
              }
              // Navigation will be handled automatically by the auth state change
            } catch (err) {
              setError('Logout failed. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">No user data available</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <View className="flex-row items-center gap-4">
              <Avatar size="xl">
                <AvatarFallback>
                  <Text className="text-lg">{getInitials(user.name || 'User')}</Text>
                </AvatarFallback>
              </Avatar>
              <View className="flex-1">
                <Text className="text-2xl font-bold">{user.name || 'User'}</Text>
                <Text className="text-lg text-gray-600">{user.email}</Text>
                <View className="flex-row flex-wrap mt-2 gap-2">
                  {isAdmin && (
                    <View className="bg-yellow-100 px-2 py-1 rounded">
                      <Text className="text-yellow-800 text-xs font-medium">Admin</Text>
                    </View>
                  )}
                  {session?.roles?.map((role: string) => (
                    role !== 'admin' && (
                      <View key={role} className="bg-gray-100 px-2 py-1 rounded">
                        <Text className="text-gray-800 text-xs font-medium">{role}</Text>
                      </View>
                    )
                  ))}
                </View>
              </View>
            </View>
          </CardHeader>
        </Card>

        {/* Account Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your account details and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* User Details */}
            <View>
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-500">Full Name</Text>
                <Text className="text-sm">{user.name || 'Not provided'}</Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-500">Email Address</Text>
                <Text className="text-sm">{user.email || 'Not provided'}</Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-500">Account Created</Text>
                <Text className="text-sm">{formatDateTime(user.createdAt)}</Text>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-500">Account Status</Text>
                <View className="bg-green-100 px-2 py-1 rounded self-start">
                  <Text className="text-green-800 text-xs font-medium">Active</Text>
                </View>
              </View>
            </View>

            {/* Divider */}
            <View className="border-t border-gray-200" />

            {/* Roles Section */}
            <View className="mb-6">
              <Text className="text-lg font-medium">Roles & Permissions</Text>
              <View className="flex-row flex-wrap gap-2">
                {isAdmin && (
                  <View className="bg-yellow-100 px-3 py-2 rounded">
                    <Text className="text-yellow-800 text-sm font-medium">Administrator</Text>
                  </View>
                )}
                {session?.roles?.map((role: string) => (
                  role !== 'admin' && (
                    <View key={role} className="bg-gray-100 px-3 py-2 rounded">
                      <Text className="text-gray-800 text-sm font-medium">{role}</Text>
                    </View>
                  )
                ))}
                {(!session?.roles?.length && !isAdmin) && (
                  <View className="bg-blue-100 px-3 py-2 rounded">
                    <Text className="text-blue-800 text-sm font-medium">Standard User</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Divider */}
            <View className="border-t border-gray-200" />

            {/* Actions */}
            <View>
              <Text className="text-lg font-medium">Account Actions</Text>
              <Button
                variant="destructive"
                onPress={handleLogout}
                disabled={isLoading}
                loading={isLoading}
                className="w-full"
              >
                {isLoading ? 'Signing out...' : 'Sign Out'}
              </Button>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
