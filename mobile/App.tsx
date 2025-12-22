import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { TRPCProvider } from './src/client/TRPCProvider';
import './global.css';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TRPCProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </TRPCProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
