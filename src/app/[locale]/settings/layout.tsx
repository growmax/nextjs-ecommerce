import React from "react";
import SettingsSidebar from "@/components/settings-sidebar";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-background">
      <SettingsSidebar />

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default SettingsLayout;
