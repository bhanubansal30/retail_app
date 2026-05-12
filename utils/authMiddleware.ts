import { useRootNavigationState, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useAuth } from './authContext';

/**
 * Authentication middleware hook
 * Handles route redirects based on authentication status
 */
export function useAuthMiddleware() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const { isLoading, isAuthenticated, user } = useAuth();
  const hasCheckedAuthRef = useRef(false);

  console.log('🎯 MIDDLEWARE CALLED - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
  console.log('  rootNavigationState ready:', !!rootNavigationState?.key);

  useEffect(() => {
    console.log('📊 MIDDLEWARE EFFECT TRIGGERED');
    console.log('  Root state ready:', !!rootNavigationState?.key);
    console.log('  Auth loading:', isLoading);
    console.log('  Authenticated:', isAuthenticated);
    console.log('  Has checked auth:', hasCheckedAuthRef.current);

    // Don't check if auth is still loading
    if (isLoading) {
      console.log('⏳ Auth still loading');
      return;
    }

    // Get current route - handle both initial state and after navigation
    const currentRoute = rootNavigationState?.routes[rootNavigationState?.index]?.name;
    console.log('📍 CURRENT ROUTE:', currentRoute);
    console.log('  Total routes:', rootNavigationState?.routes.length);

    // Check auth status and redirect if needed
    // This runs on initial load and on every auth state change
    if (!isAuthenticated) {
      console.log('🔐 User NOT authenticated');
      
      // If not on login/signup, redirect to login
      if (currentRoute !== 'login' && currentRoute !== 'signup') {
        console.log(`📤 NOT AUTHENTICATED - Redirecting to login from: ${currentRoute}`);
        router.replace('/login');
      } else {
        console.log('✅ Already on login/signup page');
      }
    } else {
      console.log('✅ User AUTHENTICATED');
      
      // If on login/signup, redirect to appropriate dashboard
      if (currentRoute === 'login' || currentRoute === 'signup') {
        const isAdmin = user?.role === 'ADMIN';
        const targetRoute = isAdmin ? '/admin-dashboard' : '/dashboard';
        console.log(`📤 AUTHENTICATED - Redirecting to ${targetRoute}`);
        router.replace(targetRoute);
      } else {
        console.log('✅ Already on correct page:', currentRoute);
      }
    }
    
    hasCheckedAuthRef.current = true;
  }, [isLoading, isAuthenticated, user?.role, rootNavigationState?.index, router]);
}
