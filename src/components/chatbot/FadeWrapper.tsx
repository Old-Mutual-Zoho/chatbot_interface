import type { ReactNode } from "react";

type FadeWrapperProps = {
  // Used for simple screen-to-screen transitions within the widget.
  // We keep hidden screens mounted, but disable interactions while invisible.
  isVisible: boolean;
  children: ReactNode;
};

export default function FadeWrapper({ isVisible, children }: FadeWrapperProps) {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {children}
    </div>
  );
}
