import { ReactNode } from "react";

type UserLike = {
  displayName?: string | null;
  email?: string | null;
  companyName?: string | null;
  picture?: string | null;
  role?: string | null;
  accountRole?: string | null;
  lastLogin?: string | null;
};

export type AvatarCardProps = {
  user: UserLike | null;
  onLogout: () => void;
  isLoggingOut?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  trigger: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  menuClassName?: string;
};
