import { AuthProvider } from "@/contexts/AuthContext";
import { getServerAuthState } from "@/lib/auth-server";

// Prevent static generation for this layout - render dynamically on request
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get server-side authentication state
  const authState = await getServerAuthState();

  // Note: User data is fetched on-demand by client components if needed
  // The AuthProvider passes initial auth state to the client

  return (
    <AuthProvider
      initialAuthState={authState.isAuthenticated}
      initialUser={authState.user}
    >
      {children}
    </AuthProvider>
  );
}
