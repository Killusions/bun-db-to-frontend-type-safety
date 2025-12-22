import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';
import { cn } from '../../lib/utils';

interface AvatarProps {
  source?: ImageSourcePropType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

interface AvatarFallbackProps {
  children: React.ReactNode;
  className?: string;
}

interface AvatarImageProps {
  source: ImageSourcePropType;
  alt?: string;
  className?: string;
}

const avatarSizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const fallbackSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

export function Avatar({ children, size = 'md', className }: { children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  return (
    <View
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full',
        avatarSizes[size],
        className
      )}
    >
      {children}
    </View>
  );
}

export function AvatarImage({ source, alt, className }: AvatarImageProps) {
  return (
    <Image
      source={source}
      className={cn('aspect-square h-full w-full', className)}
      accessibilityLabel={alt}
      resizeMode="cover"
    />
  );
}

export function AvatarFallback({ children, className }: AvatarFallbackProps) {
  return (
    <View
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted',
        className
      )}
    >
      <Text className={cn('font-medium text-muted-foreground', className)}>
        {children}
      </Text>
    </View>
  );
}
