import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { trpc } from '../client/client';
import { useAuthStatus, useSessionLoaded } from '../client/auth';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Avatar, AvatarFallback } from '../components/ui/Avatar';
import { formatDate, getInitials } from '../lib/utils';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { isAuthenticated, user } = useAuthStatus();
  const sessionLoaded = useSessionLoaded();
  const [users, setUsers] = useState(new Map<string, any>());
  const [refreshing, setRefreshing] = useState(false);

  // Use tRPC queries based on authentication status
  const postsQuery = trpc.posts[isAuthenticated ? 'getPosts' : 'getPublicPosts'].useQuery(
    undefined,
    {
      enabled: sessionLoaded,
      refetchOnWindowFocus: false,
    }
  );

  const posts = postsQuery.data || [];
  const isLoading = postsQuery.isLoading;
  const error = postsQuery.error?.message || '';

  // Fetch user info for posts
  React.useEffect(() => {
    if (posts.length > 0) {
      posts.forEach(async (post) => {
        if (!users.has(post.ownerId)) {
          try {
            // Note: This should ideally be done with tRPC as well
            // For now keeping the manual approach for user fetching
          } catch {
            // Handle error
          }
        }
      });
    }
  }, [posts]);

  const onRefresh = () => {
    setRefreshing(true);
    postsQuery.refetch().finally(() => setRefreshing(false));
  };

  const getUserName = (userId: string): string => {
    return users.get(userId)?.name || 'Unknown User';
  };

  if (!sessionLoaded || isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#1f2937" />
        <Text className="mt-4 text-gray-600">Loading posts...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Banner */}
      <View className="p-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-6">
              Welcome to Simple Server
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              {user ? (
                <Text>Hello, {user.name || 'User'}! View your posts below or create a new one.</Text>
              ) : (
                <Text>This is a simple blog platform. Sign in to see more posts and create your own.</Text>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View className="flex-row justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Button
                    onPress={() => navigation.navigate('Login' as never)}
                    className="flex-1 mr-2"
                  >
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    onPress={() => navigation.navigate('Register' as never)}
                    className="flex-1 ml-2"
                  >
                    Register
                  </Button>
                </>
              ) : (
                <Button
                  onPress={() => navigation.navigate('Profile' as never)}
                  className="flex-1"
                >
                  My Profile
                </Button>
              )}
            </View>
          </CardContent>
        </Card>
      </View>

      {/* Error Message */}
      {error && (
        <View className="px-4 mb-4">
          <View className="bg-red-50 border border-red-200 rounded-lg p-4">
            <Text className="text-red-800">{error}</Text>
          </View>
        </View>
      )}

      {/* Posts Section */}
      <View className="px-4">
        <Text className="text-2xl font-semibold text-gray-900 mb-6">Recent Posts</Text>

        {posts.length === 0 ? (
          <View className="py-12">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6 text-center">
                <Text className="text-6xl text-gray-300 mb-4">📝</Text>
                <Text className="text-lg font-medium text-gray-900 mb-2">No posts available</Text>
                <Text className="text-gray-600 mb-4">
                  {!isAuthenticated
                    ? 'Login to see more posts and create your own.'
                    : 'Be the first to create a post!'
                  }
                </Text>
                {!isAuthenticated && (
                  <Button onPress={() => navigation.navigate('Login' as never)}>
                    Get Started
                  </Button>
                )}
              </CardContent>
            </Card>
          </View>
        ) : (
          <View className="pb-8">
            {posts.map((post) => (
              <Card key={post.id} className="shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">
                    {post.title}
                  </CardTitle>
                  <View className="flex-row items-center gap-3 mt-3">
                    <Avatar size="sm">
                      <AvatarFallback>
                        <Text className="text-xs">
                          {getInitials(getUserName(post.ownerId))}
                        </Text>
                      </AvatarFallback>
                    </Avatar>
                    <View>
                      <Text className="text-sm font-medium text-gray-900">
                        {getUserName(post.ownerId)}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {formatDate(post.createdAt)}
                      </Text>
                    </View>
                  </View>
                </CardHeader>

                <CardContent>
                  <Text className="text-gray-700 leading-relaxed">
                    {post.body}
                  </Text>
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
