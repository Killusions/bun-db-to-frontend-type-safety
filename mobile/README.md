# Simple Server Mobile

React Native mobile application for Simple Server, built with Expo, Better Auth, tRPC, and NativeWind.

## Features

- **Cross-platform**: iOS, Android, and Web support
- **Full-stack TypeScript**: End-to-end type safety
- **Authentication**: Better Auth integration with Expo
- **API**: tRPC with React Query for type-safe API calls
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **UI Components**: Custom shadcn/ui-style components
- **React Compiler**: Optimized performance
- **Local Builds**: Build and sign apps without EAS

## Project Structure

```
mobile/
├── src/
│   ├── client/           # API and auth clients
│   │   ├── auth.ts       # Better Auth client
│   │   ├── client.ts     # tRPC client
│   │   └── TRPCProvider.tsx
│   ├── components/
│   │   └── ui/           # Reusable UI components
│   ├── lib/
│   │   └── utils.ts      # Utility functions
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   └── screens/          # App screens
│       ├── HomeScreen.tsx
│       ├── LoginScreen.tsx
│       ├── RegisterScreen.tsx
│       ├── ProfileScreen.tsx
│       ├── ForgotPasswordScreen.tsx
│       ├── ResetPasswordScreen.tsx
│       └── AuthCallbackScreen.tsx
├── dev/                  # Development scripts
│   ├── build.ts          # Build script
│   ├── server.ts         # Dev server
│   └── prebuild.ts       # Prebuild script
├── App.tsx
├── app.json
├── babel.config.js
├── tailwind.config.js
├── metro.config.js
├── global.css
└── tsconfig.json
```

## Quick Start

### Prerequisites

- **Node.js 18+** and **Bun**
- **Android Studio** (for Android builds)
- **Xcode** (for iOS builds, macOS only)
- **Expo CLI**: `npm install -g @expo/cli`

### Development

1. **Start the full-stack development server:**

   ```bash
   # From root directory
   bun run dev
   ```

   This starts both the backend (port 3000) and mobile dev server (port 8081).

2. **Or start mobile dev server only:**

   ```bash
   bun run mobile:dev
   ```

3. **Platform-specific development:**

   ```bash
   # Web only
   bun run mobile:dev --web

   # Android
   bun run mobile:dev --android

   # iOS
   bun run mobile:dev --ios
   ```

### Building

1. **Prebuild native directories:**

   ```bash
   bun run mobile:prebuild
   ```

2. **Build for specific platforms:**

   ```bash
   # Android
   bun run mobile:build android

   # iOS (macOS only)
   bun run mobile:build ios

   # Web
   bun run mobile:build web

   # All platforms
   bun run mobile:build all
   ```

3. **Production builds:**
   ```bash
   bun run mobile:build android --release
   bun run mobile:build ios --release
   ```

## Configuration

### Environment Variables

Set these in the root `.env` file:

```env
# Development
EXPO_PUBLIC_DEV_HOST=localhost
EXPO_PUBLIC_PORT=3000
EXPO_PUBLIC_PROTOCOL=http

# Production
EXPO_PUBLIC_API_URL=https://your-api.com
EXPO_PUBLIC_APP_SCHEME=simpleserver
```

### App Configuration

Key settings in `app.json`:

- **Bundle ID**: `com.simpleserver.mobile`
- **Scheme**: `simpleserver://`
- **Platforms**: iOS, Android, Web
- **New Architecture**: Enabled

## Authentication

Uses Better Auth with Expo integration:

- **Email/Password**: Sign up, login, password reset
- **Social Login**: Configurable (GitHub, Google)
- **Secure Storage**: Expo SecureStore for tokens
- **Deep Linking**: Custom URL scheme support

### Auth Flow

1. User signs in/up
2. Better Auth handles authentication
3. Tokens stored securely with Expo SecureStore
4. Auto-redirect via custom URL scheme
5. Session persists across app launches

## API Integration

### tRPC with React Query

```typescript
// Using tRPC hooks
const { data: posts, isLoading } = trpc.posts.getPosts.useQuery();

// Mutations
const createPost = trpc.posts.createPost.useMutation({
  onSuccess: () => {
    // Invalidate and refetch
    trpc.posts.getPosts.invalidate();
  },
});
```

### Available Endpoints

- `posts.getPosts` - Get user's posts
- `posts.getPublicPosts` - Get public posts
- `posts.createPost` - Create new post
- `posts.updatePost` - Update existing post
- `posts.deletePost` - Delete post
- `getUserInfo` - Get user information

## Styling

### NativeWind (Tailwind CSS)

```typescript
// Component styling
<View className="flex-1 bg-gray-50 p-4">
  <Text className="text-2xl font-bold text-gray-900">
    Welcome
  </Text>
</View>
```

### Custom Theme

Extends Tailwind with app-specific colors:

- `background`, `foreground`
- `primary`, `secondary`
- `destructive`, `muted`
- `accent`, `card`
- `border`, `input`

## UI Components

### Available Components

- **Button**: Multiple variants and sizes
- **Card**: Content containers with header/footer
- **Input**: Form inputs with labels and validation
- **Avatar**: User profile pictures
- **Alert**: Success/error messages

### Usage Example

```typescript
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Welcome</CardTitle>
  </CardHeader>
  <CardContent>
    <Button onPress={handlePress}>
      Get Started
    </Button>
  </CardContent>
</Card>
```

## Local Building & Signing

### Android

1. **Generate keystore:**

   ```bash
   # Creates android-release-key.keystore
   keytool -genkeypair -v -keystore signing/android-release-key.keystore -alias simple-server-mobile -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Build signed APK:**

   ```bash
   bun run mobile:build android --release
   ```

3. **Install on device:**
   ```bash
   adb install builds/simple-server-mobile-release.apk
   ```

### iOS

1. **Configure signing in Xcode:**
   - Open `ios/SimpleServerMobile.xcworkspace`
   - Select target → Signing & Capabilities
   - Choose development team

2. **Build archive:**

   ```bash
   bun run mobile:build ios --release
   ```

3. **Export IPA:**
   - Archive created in `builds/SimpleServerMobile.xcarchive`
   - Export via Xcode or command line

## Testing

### Development Testing

- **Expo Go**: Scan QR code for quick testing
- **Device/Simulator**: Full native testing
- **Web**: Browser testing on localhost:8081

### Production Testing

- **Android**: Install APK on test devices
- **iOS**: TestFlight or direct IPA installation
- **Web**: Deploy to static hosting

## Deployment

### Without EAS

**Android:**

- Build APK locally
- Sign with release keystore
- Distribute via Google Play or direct download

**iOS:**

- Build archive locally
- Export IPA with distribution certificate
- Upload to App Store Connect or distribute via TestFlight

**Web:**

- Export static files
- Deploy to any static hosting (Vercel, Netlify, etc.)

### Distribution

1. **Build all platforms:**

   ```bash
   bun run mobile:build all --release
   ```

2. **Create distribution package:**
   ```bash
   # Outputs in builds/ directory
   ls builds/
   # simple-server-mobile-release.apk
   # SimpleServerMobile.ipa
   # simple-server-mobile-web-release.tar.gz
   ```

## Troubleshooting

### Common Issues

**Metro bundler errors:**

```bash
bun run mobile:dev --clear
```

**Native dependency issues:**

```bash
bun run mobile:prebuild --clean
```

**Android build failures:**

- Check Android SDK installation
- Verify ANDROID_HOME environment variable
- Update Gradle/AGP versions

**iOS build failures:**

- Update Xcode and command line tools
- Run `pod install` in ios/ directory
- Check provisioning profiles

### Performance

- **React Compiler**: Enabled for optimizations
- **Hermes**: JavaScript engine for better performance
- **New Architecture**: Enabled for latest React Native features

## Scripts Reference

| Script            | Description                 |
| ----------------- | --------------------------- |
| `mobile:dev`      | Start development server    |
| `mobile:prebuild` | Generate native directories |
| `mobile:build`    | Build for platforms         |
| `mobile:android`  | Start Android development   |
| `mobile:ios`      | Start iOS development       |
| `mobile:web`      | Start web development       |

## Contributing

1. Follow TypeScript strict mode
2. Use Prettier for formatting
3. Follow React Native best practices
4. Test on multiple platforms
5. Update documentation for new features

## Tech Stack

- **Framework**: Expo with React Native
- **Language**: TypeScript
- **Authentication**: Better Auth
- **API**: tRPC + React Query
- **Styling**: NativeWind (Tailwind CSS)
- **Navigation**: React Navigation
- **Storage**: Expo SecureStore
- **Build**: Expo CLI + native toolchains
- **Performance**: React Compiler + Hermes
