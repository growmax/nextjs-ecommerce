"use client";
import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import dynamic from "next/dynamic";

const ProfilePageClient = dynamic(
  () => import("./components/ProfilePageClient"),
  {
    ssr: false,
    loading: () => <PageLoader message="Loading Profile..." />,
  }
);

export default ProfilePageClient;
