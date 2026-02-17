"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function ScrollToTop() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      window.scrollTo(0, 0);
      prevPathname.current = pathname;
    }
  }, [pathname]);

  return null;
}
