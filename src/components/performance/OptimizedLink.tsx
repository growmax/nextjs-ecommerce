"use client";

import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { AnchorHTMLAttributes, forwardRef } from "react";

/**
 * OptimizedLink - A wrapper around Next.js Link with prefetching
 *
 * This component uses Next.js default prefetching for instant navigation.
 * Use this for critical navigation links.
 *
 * Features:
 * - Prefetch enabled by default (Next.js native prefetching)
 * - Maintains all Next.js Link functionality
 *
 * Usage:
 *   <OptimizedLink href="/dashboard">Dashboard</OptimizedLink>
 */

interface OptimizedLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps>,
    NextLinkProps {
  children: React.ReactNode;
}

export const OptimizedLink = forwardRef<HTMLAnchorElement, OptimizedLinkProps>(
  ({ href, prefetch = true, ...props }, ref) => {
    return <NextLink ref={ref} href={href} prefetch={prefetch} {...props} />;
  }
);

OptimizedLink.displayName = "OptimizedLink";
