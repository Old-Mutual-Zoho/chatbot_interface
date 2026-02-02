// Loader for product-specific form steps

import { personalAccidentFormSteps } from '../components/chatbot/data/specificProductForms/PersonalAccident';
import { travelPlusFormSteps } from '../components/chatbot/data/specificProductForms/TravelPlus';
import { serenicareFormSteps } from '../components/chatbot/data/specificProductForms/serenicareForm';

export function getProductFormSteps(product: string) {
  switch (product) {
    case 'Personal Accident':
      return personalAccidentFormSteps;
    case 'Travel Sure Plus':
      return travelPlusFormSteps;
    case 'Serenicare':
      return serenicareFormSteps;
    // Add more cases for other products
    default:
      return [];
  }
}
