import { ServerAuth, ServerUser } from "@/lib/auth-server";
import { AuthAwareContent } from "./AuthAwareContent";
import Link from "next/link";

/**
 * Homepage component with server-side authentication detection
 *
 * Renders different content for authenticated vs public users,
 * determined on the server for perfect SSR.
 */
export async function AuthAwareHomepage() {
  // Get auth state on server - no client-side flickering!
  const authState = await ServerAuth.getAuthState();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Conditional content based on auth status */}
        {authState.isAuthenticated && authState.user ? (
          <AuthenticatedHomepage user={authState.user} />
        ) : (
          <PublicHomepage />
        )}

        {/* Mixed content that both user types see */}
        <CommonContent />

        {/* Pass auth state to client components if needed */}
        <AuthAwareContent
          initialAuth={authState.isAuthenticated}
          initialUser={authState.user}
        />
      </div>
    </main>
  );
}

/**
 * Homepage content for authenticated users
 */
function AuthenticatedHomepage({ user }: { user: ServerUser }) {
  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name || user?.email}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s your personalized dashboard
        </p>
      </div>

      {/* Authenticated user features */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <QuickActionCard
          title="Dashboard"
          href="/dashboard"
          description="View your analytics and data"
        />
        <QuickActionCard
          title="Profile"
          href="/profile"
          description="Manage your account settings"
        />
        <QuickActionCard
          title="Company"
          href="/company"
          description="Company management tools"
        />
      </div>
    </div>
  );
}

/**
 * Homepage content for public users
 */
function PublicHomepage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Our Platform</h1>
        <p className="text-xl text-muted-foreground mb-6">
          The best e-commerce solution for your business
        </p>

        {/* Call-to-action for public users */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border rounded-lg hover:bg-accent"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features section for public users */}
      <div className="grid gap-6 md:grid-cols-3">
        <FeatureCard title="Easy Setup" description="Get started in minutes" />
        <FeatureCard
          title="Powerful Tools"
          description="Everything you need to succeed"
        />
        <FeatureCard title="24/7 Support" description="We're here to help" />
      </div>
    </div>
  );
}

/**
 * Content that both user types see
 */
function CommonContent() {
  return (
    <section className="mt-12 py-8 border-t">
      <h2 className="text-2xl font-bold text-center mb-6">Latest Updates</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <NewsCard title="New Feature Release" date="Sep 18, 2025" />
        <NewsCard title="System Maintenance" date="Sep 15, 2025" />
      </div>
    </section>
  );
}

// Helper components
function QuickActionCard({
  title,
  href,
  description,
}: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="block p-4 bg-card border rounded-lg hover:bg-accent transition-colors"
    >
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </a>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6 bg-card rounded-lg">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function NewsCard({ title, date }: { title: string; date: string }) {
  return (
    <div className="p-4 bg-card border rounded-lg">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{date}</p>
    </div>
  );
}
