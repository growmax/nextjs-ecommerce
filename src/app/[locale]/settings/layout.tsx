import React from "react";
import SettingsSidebar from "@/components/settings-sidebar";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-background">
      <SettingsSidebar />

      <div className="flex-1 flex flex-col h-screen">{children}</div>
    </div>
  );
};

export default SettingsLayout;
