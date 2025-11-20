import React from "react";
import { LandingLayout } from "@/components/layout";

export default function LandingLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LandingLayout>{children}</LandingLayout>;
}
