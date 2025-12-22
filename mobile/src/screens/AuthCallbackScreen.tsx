import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStatus } from '../client/auth';

export default function AuthCallbackScreen() {
  const navigation = useNavigation();
  const { isAuthenticated, isLoading } = useAuthStatus();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        
        // Redirect to main app after a short delay
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' as never }],
          });
        }, 1500);
      } else {
        setStatus('error');
        setMessage('Authentication failed');
      }
    }
  }, [isAuthenticated, isLoading, navigation]);

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-50 p-4">
      <View className="bg-white rounded-lg p-8 shadow-lg max-w-sm w-full">
        <View className="items-center gap-4">
          <Text className="text-4xl">{getStatusIcon()}</Text>
          
          {status === 'loading' && (
            <ActivityIndicator size="large" color="#2563eb" />
          )}
          
          <Text className="text-lg font-semibold text-center text-gray-900">
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Authentication Failed'}
          </Text>
          
          <Text className={`text-center ${getStatusColor()}`}>
            {message}
          </Text>
          
          {status === 'error' && (
            <View className="mt-4">
              <Text
                className="text-blue-600 text-center underline"
                onPress={() => navigation.navigate('Login' as never)}
              >
                Return to Login
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
