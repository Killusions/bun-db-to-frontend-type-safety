import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '../../lib/utils';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
  className?: string;
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const alertVariants = {
  default: 'bg-background text-foreground border border-border',
  destructive: 'border-destructive/50 text-destructive',
};

export function Alert({ children, variant = 'default', className }: AlertProps) {
  return (
    <View
      className={cn(
        'relative w-full rounded-lg border p-4',
        alertVariants[variant],
        className
      )}
    >
      {children}
    </View>
  );
}

export function AlertDescription({ children, className }: AlertDescriptionProps) {
  return (
    <Text className={cn('text-sm', className)}>
      {children}
    </Text>
  );
}
