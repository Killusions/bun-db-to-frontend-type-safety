import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { cn } from '../../lib/utils';

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const buttonVariants = {
  default: 'bg-gray-900',
  destructive: 'bg-red-600',
  outline: 'border border-gray-300 bg-white',
  secondary: 'bg-gray-100',
  ghost: 'bg-transparent',
  link: 'bg-transparent',
};

const buttonSizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3',
  lg: 'h-11 px-8',
  icon: 'h-10 w-10',
};

const textVariants = {
  default: 'text-white font-medium',
  destructive: 'text-white font-medium',
  outline: 'text-gray-900 font-medium',
  secondary: 'text-gray-900 font-medium',
  ghost: 'text-gray-900 font-medium',
  link: 'text-gray-900 underline font-medium',
};

export function Button({
  onPress,
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  className,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        buttonVariants[variant],
        buttonSizes[size],
        isDisabled && 'opacity-50',
        className
      )}
    >
      <View className="flex-row items-center justify-center">
        {loading && (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'ghost' ? '#000' : '#fff'}
            className="mr-2"
          />
        )}
        <Text className={cn(textVariants[variant], isDisabled && 'opacity-50')}>
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
