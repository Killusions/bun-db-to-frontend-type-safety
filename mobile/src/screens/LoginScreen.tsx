import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signIn } from '../client/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { validateEmail } from '../lib/utils';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { error: authError } = await signIn.email({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(authError.message || 'Login failed. Please try again.');
      }
      // Navigation will be handled automatically by the auth state change
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword' as never);
  };

  const handleRegister = () => {
    navigation.navigate('Register' as never);
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
              <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
              <CardDescription className="text-center">
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
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

              {/* Password Field */}
              <Input
                className="mb-4"
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />

              {/* Forgot Password Link */}
              <View className="items-end mb-4">
                <Button
                  variant="link"
                  onPress={handleForgotPassword}
                  disabled={isLoading}
                  className="p-0"
                >
                  Forgot your password?
                </Button>
              </View>

              {/* Login Button */}
              <Button
                onPress={handleSubmit}
                disabled={isLoading}
                loading={isLoading}
                className="w-full"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </CardContent>

            <CardFooter>
              <View className="text-center w-full">
                <Text className="text-sm text-gray-600">
                  Don't have an account?{' '}
                </Text>
                <Button
                  variant="link"
                  onPress={handleRegister}
                  disabled={isLoading}
                  className="p-0"
                >
                  Create an account
                </Button>
              </View>
            </CardFooter>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
