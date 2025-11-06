import React from "react";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="landing-page flex flex-col">{children}</div>;
};

export default LandingLayout;
