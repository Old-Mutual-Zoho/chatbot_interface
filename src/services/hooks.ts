import { useMutation, useQuery } from '@tanstack/react-query';
import { createSession, getSessionState, sendChatMessage } from './api';
import { getCategories, getSubcategoriesOrProducts, getProductsBySubcategory, getProductDetails } from './api';
import { startGuidedQuote } from './api';
import type { SessionResponse, SessionState, ChatMessagePayload, Category, Subcategory, Product, ProductDetails, StartGuidedQuotePayload } from './api';

// 1. Create session hook
export function useCreateSession() {
  return useMutation<SessionResponse, Error, string>({
    mutationFn: createSession,
  });
}

// 2. Get session state hook
export function useSessionState(session_id: string, enabled = true) {
  return useQuery<SessionState, Error>({
    queryKey: ['session', session_id],
    queryFn: () => getSessionState(session_id),
    enabled: !!session_id && enabled,
    refetchOnWindowFocus: false,
  });
}

// 3. Send chat message or form data hook
export function useSendChatMessage() {
  return useMutation<unknown, Error, ChatMessagePayload>({
    mutationFn: sendChatMessage,
  });
}

// 4. Get all categories
export function useCategories() {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: getCategories,
    refetchOnWindowFocus: false,
  });
}

// 5. Get subcategories or products for a category
export function useSubcategoriesOrProducts(category: string, enabled = true) {
  return useQuery<Subcategory[] | Product[], Error>({
    queryKey: ['subcategoriesOrProducts', category],
    queryFn: () => getSubcategoriesOrProducts(category),
    enabled: !!category && enabled,
    refetchOnWindowFocus: false,
  });
}

// 6. Get products by subcategory
export function useProductsBySubcategory(category: string, subcategory: string, enabled = true) {
  return useQuery<Product[], Error>({
    queryKey: ['productsBySubcategory', category, subcategory],
    queryFn: () => getProductsBySubcategory(category, subcategory),
    enabled: !!category && !!subcategory && enabled,
    refetchOnWindowFocus: false,
  });
}

// 7. Get product details by product_id
export function useProductDetails(product_id: string, enabled = true) {
  return useQuery<ProductDetails, Error>({
    queryKey: ['productDetails', product_id],
    queryFn: () => getProductDetails(product_id),
    enabled: !!product_id && enabled,
    refetchOnWindowFocus: false,
  });
}

// 8. Start guided quote flow
export function useStartGuidedQuote() {
  return useMutation<unknown, Error, StartGuidedQuotePayload>({
    mutationFn: startGuidedQuote,
  });
}
