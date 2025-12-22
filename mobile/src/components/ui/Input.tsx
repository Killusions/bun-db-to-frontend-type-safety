import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { cn } from '../../lib/utils';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <View className="gap-2">
        {label && (
          <Text className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive',
            className
          )}
          {...props}
        />
        {error && (
          <Text className="text-sm text-destructive">
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";
