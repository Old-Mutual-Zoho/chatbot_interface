// Loader for product-specific form steps

import { personalAccidentFormSteps } from '../components/chatbot/data/specificProductForms/PersonalAccident';

export function getProductFormSteps(product: string) {
  switch (product) {
    case 'Personal Accident':
      return personalAccidentFormSteps;
    // Add more cases for other products
    default:
      return [];
  }
}
