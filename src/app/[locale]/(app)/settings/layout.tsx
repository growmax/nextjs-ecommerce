import React from "react";
import SettingsSidebar from "@/components/settings-sidebar";
import MobileNav from "@/components/mobile-settings-nav";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-background">
      {/* Hide sidebar on mobile (< 768px), show on tablet and desktop */}
      <div className="hidden md:block">
        <SettingsSidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen">
        {/* Mobile navigation - show only on mobile */}
        <div className="block md:hidden">
          <MobileNav />
        </div>

        {children}
      </div>
    </div>
  );
};

export default SettingsLayout;
