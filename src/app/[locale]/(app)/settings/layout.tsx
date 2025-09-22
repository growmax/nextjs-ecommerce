import React from "react";
import SettingsSidebar from "@/components/settings-sidebar";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] bg-background overflow-x-hidden">
      <SettingsSidebar />

      <div className="flex-1 flex flex-col min-h-[calc(100vh-theme(spacing.16))] overflow-x-hidden">
        {children}
      </div>
    </div>
  );
};

export default SettingsLayout;
