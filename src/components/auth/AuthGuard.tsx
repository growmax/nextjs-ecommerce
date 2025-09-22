"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean; // Default: true (show children only when authenticated)
  showWhenAuthenticated?: boolean; // More explicit prop name
  showWhenUnauthenticated?: boolean; // Show only when not authenticated
}

/**
 * AuthGuard component for conditional rendering based on authentication state
 *
 * Usage examples:
 *
 * // Show only when authenticated (default behavior)
 * <AuthGuard>
 *   <DashboardButton />
 * </AuthGuard>
 *
 * // Show only when unauthenticated
 * <AuthGuard showWhenUnauthenticated>
 *   <LoginButton />
 * </AuthGuard>
 *
 * // Show with custom fallback
 * <AuthGuard fallback={<LoginPrompt />}>
 *   <UserProfile />
 * </AuthGuard>
 */
export function AuthGuard({
  children,
  fallback = null,
  requireAuth = true,
  showWhenAuthenticated,
  showWhenUnauthenticated = false,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Don't render anything while loading authentication state
  if (isLoading) {
    return null;
  }

  // Determine the condition based on props
  let shouldShow = false;

  if (showWhenAuthenticated !== undefined) {
    // Use explicit showWhenAuthenticated prop
    shouldShow = showWhenAuthenticated === isAuthenticated;
  } else if (showWhenUnauthenticated) {
    // Show only when unauthenticated
    shouldShow = !isAuthenticated;
  } else if (requireAuth) {
    // Default: show only when authenticated
    shouldShow = isAuthenticated;
  } else {
    // requireAuth = false: show only when not authenticated
    shouldShow = !isAuthenticated;
  }

  return shouldShow ? <>{children}</> : <>{fallback}</>;
}

// Convenience components for common use cases
export function AuthenticatedOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <AuthGuard showWhenAuthenticated={true} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

export function UnauthenticatedOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <AuthGuard showWhenUnauthenticated={true} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

// Higher-order component for wrapping components
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean;
    fallback?: ReactNode;
    showWhenAuthenticated?: boolean;
    showWhenUnauthenticated?: boolean;
  } = {}
) {
  const WrappedComponent = (props: P) => (
    <AuthGuard {...options}>
      <Component {...props} />
    </AuthGuard>
  );

  WrappedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
