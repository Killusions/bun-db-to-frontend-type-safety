import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authClient } from '../client/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { validatePassword } from '../lib/utils';

type ResetPasswordRouteParams = {
  token?: string;
};

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = (route.params as ResetPasswordRouteParams) || {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset token');
    }
  }, [token]);

  const handleSubmit = async () => {
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const { error: authError } = await authClient.resetPassword({
        token,
        newPassword: password,
      });

      if (authError) {
        setError(authError.message || 'Failed to reset password. Please try again.');
      } else {
        setSuccess('Password reset successfully! You can now login with your new password.');
        setTimeout(() => {
          navigation.navigate('Login' as never);
        }, 2000);
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="max-w-md w-full mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Set new password</CardTitle>
              <CardDescription className="text-center">
                Enter your new password below
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert className="mb-4">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* New Password Field */}
              <Input
                className="mb-4"
                label="New Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your new password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading && !success}
              />

              {/* Confirm Password Field */}
              <Input
                className="mb-4"
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your new password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading && !success}
              />

              {/* Reset Button */}
              <Button
                onPress={handleSubmit}
                disabled={isLoading || !!success || !token}
                loading={isLoading}
                className="w-full"
              >
                {isLoading ? 'Resetting...' : 'Reset password'}
              </Button>
            </CardContent>

            <CardFooter>
              <View className="text-center w-full">
                <Button
                  variant="link"
                  onPress={handleBackToLogin}
                  disabled={isLoading}
                  className="p-0"
                >
                  Back to login
                </Button>
              </View>
            </CardFooter>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
