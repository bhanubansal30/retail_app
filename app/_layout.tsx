import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/utils/authContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2B5D45" />
        </View>
      </ThemeProvider>
    );
  }

  const isAdmin = user?.role === 'ADMIN';
  const initialRouteName = !isAuthenticated 
    ? 'login' 
    : isAdmin 
    ? 'admin-dashboard' 
    : 'dashboard';

  console.log('🔄 Layout render - isAuthenticated:', isAuthenticated, '- isAdmin:', isAdmin, '- initialRouteName:', initialRouteName);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack 
        initialRouteName={initialRouteName}
        screenOptions={{ animationEnabled: false }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="category-items" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ title: 'Admin Panel' }} />
        <Stack.Screen name="admin-dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="admin-categories" options={{ headerShown: false }} />
        <Stack.Screen name="admin-add-category" options={{ headerShown: false }} />
        <Stack.Screen name="admin-products" options={{ headerShown: false }} />
        <Stack.Screen name="admin-add-product" options={{ headerShown: false }} />
        <Stack.Screen name="admin-orders" options={{ headerShown: false }} />
        <Stack.Screen name="admin-users" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
