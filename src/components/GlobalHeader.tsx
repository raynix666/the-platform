"use client";

import { HamburgerMenu } from "@/components/HamburgerMenu";

export function GlobalHeader() {
  return (
    <>
      {/* اللوقو – الزاوية العلوية اليسرى */}
      <div className="fixed top-2 start-2 z-50 flex items-center gap-2">
        <img
          src="/logo.png"
          alt="شعار المنصة"
          className="w-40 h-40 object-contain hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* الهامبرغر – الزاوية العلوية اليمنى */}
      <div className="fixed top-5 end-5 z-50">
        <HamburgerMenu />
      </div>
    </>
  );
}
