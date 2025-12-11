/**
 * Domain Configuration
 * Simple domain resolution for development and production
 */

// Change this for your development domain
const DEVELOPMENT_DOMAIN = "growmax.myapptino.com";

export function getDomain(host: string): string {
  // For localhost development, use your preferred domain
  if (host === "localhost:3000") {
    return process.env.DEFAULT_DOMAIN || DEVELOPMENT_DOMAIN;
  }

  // For production, use actual host
  return host.replace("www.", "");
}
