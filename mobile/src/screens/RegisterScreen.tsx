import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signUp } from '../client/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { validateEmail, validatePassword } from '../lib/utils';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
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
      const { error: authError } = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(authError.message || 'Registration failed. Please try again.');
      } else {
        setSuccess('Registration successful! Please check your email for verification.');
        // Clear form
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
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
              <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
              <CardDescription className="text-center">
                Enter your information to create your account
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

              {/* Name Field */}
              <Input
                className="mb-4"
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
              />

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

              {/* Confirm Password Field */}
              <Input
                className="mb-4"
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />

              {/* Register Button */}
              <Button
                onPress={handleSubmit}
                disabled={isLoading}
                loading={isLoading}
                className="w-full"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </CardContent>

            <CardFooter>
              <View className="text-center w-full">
                <Text className="text-sm text-gray-600">
                  Already have an account?{' '}
                </Text>
                <Button
                  variant="link"
                  onPress={handleLogin}
                  disabled={isLoading}
                  className="p-0"
                >
                  Sign in
                </Button>
              </View>
            </CardFooter>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
