'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className={`transition-wrapper ${isAnimating ? 'page-enter' : 'page-enter-active'}`}>
      {children}
    </div>
  );
}
