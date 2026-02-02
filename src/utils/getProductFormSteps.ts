// Loader for product-specific form steps

import { personalAccidentFormSteps } from '../components/chatbot/data/specificProductForms/PersonalAccident';
import { travelPlusFormSteps } from '../components/chatbot/data/specificProductForms/TravelPlus';

export function getProductFormSteps(product: string) {
  switch (product) {
    case 'Personal Accident':
      return personalAccidentFormSteps;
    case 'Travel Sure Plus':
      return travelPlusFormSteps;
    // Add more cases for other products
    default:
      return [];
  }
}
