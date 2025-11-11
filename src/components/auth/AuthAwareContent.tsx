"use client";

import { ServerUser } from "@/lib/auth-server";
import { useHybridAuth } from "@/hooks/useHybridAuth";

interface AuthAwareContentProps {
  initialAuth?: boolean;
  initialUser?: ServerUser | null;
}

/**
 * Client component that uses hybrid auth for interactive features
 *
 * This component handles interactive elements that need client-side functionality
 * while maintaining the server-side auth state for perfect SSR.
 */
export function AuthAwareContent({
  initialAuth,
  initialUser,
}: AuthAwareContentProps) {
  const auth = useHybridAuth(initialAuth, initialUser);

  // Only render interactive content after hydration
  if (!auth.isHydrated) {
    return null; // Server-side content is handled by server components
  }

  return (
    <div className="mt-8">
      {auth.isAuthenticated && auth.user ? (
        <AuthenticatedInteractiveContent user={auth.user as ServerUser} />
      ) : (
        <PublicInteractiveContent />
      )}
    </div>
  );
}

/**
 * Interactive content for authenticated users
 */
function AuthenticatedInteractiveContent({
  user: _user,
}: {
  user: ServerUser;
}) {
  const handleQuickAction = async () => {
    // Client-side interactive functionality
    // Quick action executed for user
  };

  return (
    <div className="bg-card p-4 rounded-lg">
      <h3 className="font-semibold mb-2">Quick Actions</h3>
      <div className="flex gap-2">
        <button
          onClick={handleQuickAction}
          className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
        >
          Quick Action
        </button>
        <button className="px-3 py-1 border rounded text-sm hover:bg-accent">
          Another Action
        </button>
      </div>
    </div>
  );
}

/**
 * Interactive content for public users
 */
function PublicInteractiveContent() {
  const handleSignUp = () => {
    window.location.href = "/register";
  };

  return (
    <div className="bg-card p-4 rounded-lg text-center">
      <h3 className="font-semibold mb-2">Ready to get started?</h3>
      <button
        onClick={handleSignUp}
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        Sign Up Now
      </button>
    </div>
  );
}
