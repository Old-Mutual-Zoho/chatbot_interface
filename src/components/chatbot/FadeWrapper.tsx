import type { ReactNode } from "react";

type FadeWrapperProps = {
  isVisible: boolean;
  children: ReactNode;
};

export default function FadeWrapper({ isVisible, children }: FadeWrapperProps) {
  // Fades screens in/out and blocks clicks when hidden.
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
