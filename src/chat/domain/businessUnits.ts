import type { ChatMessage } from "../types/message";

export type BusinessUnit = "insurance" | "investments" | "business";

export function unitToBotMessage(unit: BusinessUnit): ChatMessage {
  const textByUnit: Record<BusinessUnit, string> = {
    insurance:
      "Great — let's start with Insurance and Personal. What do you need help with?",
    investments:
      "Sure — Saving and Investment. What would you like to know or do?",
    business:
      "Okay — Business Solutions. Tell me a bit about what you're looking for.",
  };

  return {
    id: `b-${Date.now()}`,
    sender: "bot",
    text: textByUnit[unit],
  };
}
