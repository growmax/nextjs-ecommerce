import { ServerAuth } from "@/lib/auth-server";
import { AuthAwareNav } from "./AuthAwareNav";

/**
 * Header component that detects authentication on server-side
 *
 * This component renders the correct navigation state immediately during SSR,
 * eliminating UI flickering and improving SEO.
 */
export async function AuthAwareHeader() {
  // Get auth state on server
  const authState = await ServerAuth.getAuthState();

  return (
    <header className="border-b bg-background px-3 py-2 sm:px-4 sm:py-3">
      <div className="flex items-center justify-between">
        {/* Logo - always visible */}
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-xl">Your App</h1>
        </div>

        {/* Auth-aware navigation */}
        <AuthAwareNav
          isAuthenticated={authState.isAuthenticated}
          user={authState.user}
        />
      </div>
    </header>
  );
}

/**
 * Alternative: Server component that passes auth state to client component
 */
export async function AuthAwareHeaderWithClient() {
  const authState = await ServerAuth.getAuthState();

  return (
    <header className="border-b bg-background px-3 py-2 sm:px-4 sm:py-3">
      <AuthAwareNav
        initialAuth={authState.isAuthenticated}
        initialUser={authState.user}
      />
    </header>
  );
}
