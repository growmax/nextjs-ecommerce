"use client";
import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ProfilePageClient = dynamic(
  () => import("./components/ProfilePageClient"),
  {
    ssr: false,
    loading: () => <PageLoader message="Loading Profile..." />,
  }
);

export default function ProfilePage() {
  return (
    <Suspense fallback={<PageLoader message="Loading Profile..." />}>
      <ProfilePageClient />
    </Suspense>
  );
}
