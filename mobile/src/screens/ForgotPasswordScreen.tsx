import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authClient } from '../client/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { validateEmail } from '../lib/utils';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const { error: authError } = await authClient.forgetPassword({
        email: email.trim(),
        redirectTo: 'simpleserver://reset-password',
      });

      if (authError) {
        setError(authError.message || 'Failed to send reset email. Please try again.');
      } else {
        setSuccess('Password reset email sent! Please check your inbox.');
        setEmail('');
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
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
              <CardTitle className="text-2xl font-bold text-center">Reset your password</CardTitle>
              <CardDescription className="text-center">
                Enter your email address and we'll send you a link to reset your password
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

              {/* Email Field */}
              <Input
                className="mb-4"
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />

              {/* Reset Button */}
              <Button
                onPress={handleSubmit}
                disabled={isLoading || !!success}
                loading={isLoading}
                className="w-full"
              >
                {isLoading ? 'Sending...' : 'Send reset email'}
              </Button>
            </CardContent>

            <CardFooter>
              <View className="text-center w-full">
                <Text className="text-sm text-gray-600">
                  Remember your password?{' '}
                </Text>
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
