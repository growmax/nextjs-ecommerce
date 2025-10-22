import React from "react";

type TypographyProps = {
  children: React.ReactNode;
  className?: string;
};

// 🧩 H3 Typography
export function Title({ children, className = "" }: TypographyProps) {
  return (
    <h3
      className={`scroll-m-20 text-2xl font-semibold tracking-tight ${className}`}
    >
      {children}
    </h3>
  );
}

// 🧩 H4 Typography
export function Subtitle({ children, className = "" }: TypographyProps) {
  return (
    <h4
      className={`scroll-m-20 text-xl font-semibold tracking-tight ${className}`}
    >
      {children}
    </h4>
  );
}

// 🧩 Paragraph Typography (optional common one)
export function Info({ children, className = "" }: TypographyProps) {
  return (
    <p className={`leading-7 [&:not(:first-child)]:mt-6 ${className}`}>
      {children}
    </p>
  );
}
export function TypographyLarge({ children, className = "" }: TypographyProps) {
  return <div className={`text-lg font-semibold ${className}`}>{children}</div>;
}
export function TypographySmall({ children, className = "" }: TypographyProps) {
  return (
    <small className={`text-sm leading-none font-medium ${className}`}>
      {children}
    </small>
  );
}
export function TypographyMuted({ children, className = "" }: TypographyProps) {
  return (
    <p className={`text-muted-foreground text-sm ${className}`}>{children}</p>
  );
}
