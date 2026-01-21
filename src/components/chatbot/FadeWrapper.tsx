import { ReactNode } from "react";

interface FadeWrapperProps {
  isVisible: boolean;
  children: ReactNode;
}

export default function FadeWrapper({ isVisible, children }: FadeWrapperProps) {
  return (
    <div
      className={`transition-opacity duration-300 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {children}
    </div>
  );
}
