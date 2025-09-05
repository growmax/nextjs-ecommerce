"use client";

import { useEffect, useState } from "react";

interface NoSSRProps {
  children: React.ReactNode;
}

export default function NoSSR({ children }: NoSSRProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <>{children}</> : null;
}
