// Loader for product form steps.
// As we migrate products to own their full step list (personal/contact/address + product-specific),
// legacy products were temporarily composed here by prefixing shared steps.
import { personalAccidentFormSteps } from "../components/chatbot/data/specificProductForms/PersonalAccident";
// import { motorPrivateQuoteFormSteps } from "../components/chatbot/data/specificProductForms/MotorPrivate";
import { travelPlusQuoteFormSteps } from "../components/chatbot/data/specificProductForms/TravelPlus";
import { serenicareFormSteps } from "../components/chatbot/data/specificProductForms/serenicareForm";

export function getProductFormSteps(product: string) {
  switch (product) {
    case "Personal Accident":
      return personalAccidentFormSteps;

    case "Travel Sure Plus":
      return travelPlusQuoteFormSteps;

    case "Serenicare":
      return serenicareFormSteps;

    case "Motor Private Insurance":
      // Now backend-driven, do not return static steps
      return [];

    default:
      return [];
  }
}
