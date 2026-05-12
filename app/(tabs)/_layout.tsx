import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { UserGuard } from '@/components/UserGuard';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <UserGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
      </Tabs>
    </UserGuard>
  );
}
