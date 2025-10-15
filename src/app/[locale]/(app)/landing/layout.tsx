import React from "react";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="landing-page h-[calc(100vh-69px)] overflow-hidden flex flex-col">
      {children}
    </div>
  );
};

export default LandingLayout;
