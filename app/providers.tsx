"use client";

import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import React from "react";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SessionProvider>
      <AnimatePresence mode="wait" initial={false}>
        <div key={pathname}>{children}</div>
      </AnimatePresence>
    </SessionProvider>
  );
} 