
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rag-production-44a1.up.railway.app/api/v1';
const API_KEY = import.meta.env.VITE_API_KEY;
console.log('VITE_API_KEY at runtime:', API_KEY);

export const api = axios.create({
	baseURL: BASE_URL,
	headers: {
		'Content-Type': 'application/json',
		...(API_KEY ? { 'X-API-KEY': API_KEY } : {}),
	},
});

// Ensure X-API-KEY is always sent, even if headers are overridden elsewhere
api.interceptors.request.use((config) => {
	config.headers = config.headers || {};
	config.headers['X-API-KEY'] = API_KEY;
	return config;
});

// --- Types ---
export interface SessionResponse {
	session_id: string;
	user_id: string;
}

export interface SessionState {
	session_id: string;
	mode: 'conversational' | 'guided';
	current_flow: string | null;
	current_step: number;
	step_name: string;
	steps_total?: number;
	collected_keys: string[];
}

export interface ChatMessagePayload {
	user_id: string;
	session_id: string;
	message?: string;
	form_data?: Record<string, unknown>;
}

// --- API Functions ---
export async function createSession(user_id: string) {
	const { data } = await api.post<SessionResponse>('/session', { user_id });
	return data;
}

export async function getSessionState(session_id: string) {
	const { data } = await api.get<SessionState>(`/session/${session_id}`);
	return data;
}

export async function sendChatMessage(payload: ChatMessagePayload) {
	const { data } = await api.post('/chat/message', payload);
	return data;
}

// --- Product Discovery Types ---
export interface Category {
	id: string;
	name: string;
}

export interface Subcategory {
	id: string;
	name: string;
}

export interface Product {
	id: string;
	name: string;
	description?: string;
}

export interface ProductDetails {
	id: string;
	name: string;
	overview: string;
	benefits: string[];
	eligibility?: string;
	coverage?: string;
	faq?: Array<{ question: string; answer: string }>;
}

// --- Product Discovery API Functions ---
export async function getCategories() {
	const { data } = await api.get<Category[]>('/products/categories');
	return data;
}

export async function getSubcategoriesOrProducts(category: string) {
	const { data } = await api.get<Subcategory[] | Product[]>(`/products/${category}`);
	return data;
}

export async function getProductsBySubcategory(category: string, subcategory: string) {
	const { data } = await api.get<Product[]>(`/products/${category}/${subcategory}`);
	return data;
}

export async function getProductDetails(product_id: string) {
	const { data } = await api.get<ProductDetails>(`/products/by-id/${product_id}`);
	return data;
}

// --- Guided Quote Flow ---
export interface StartGuidedQuotePayload {
	user_id: string;
	flow_name: string;
	initial_data: {
		product_id: string;
		[key: string]: unknown;
	};
}

export async function startGuidedQuote(payload: StartGuidedQuotePayload) {
	const { data } = await api.post('/chat/start-guided', payload);
	return data;
}
// --- Purchase Flow ---
export interface InitiatePurchasePayload {
	user_id: string;
	session_id: string;
	product: string;
	channel: string;
}

export interface InitiatePurchaseResponse {
	success: boolean;
	message?: string;
	transaction_id?: string;
}

export async function initiatePurchase(payload: InitiatePurchasePayload) {
	try {
		const { data } = await api.post<InitiatePurchaseResponse>('/purchase/initiate', payload);
		return data;
	} catch (error) {
		console.warn('Purchase endpoint not available, simulating success:', error);
		// Mock-friendly fallback: simulate success after 1.2s
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({ success: true, message: 'Payment initiated', transaction_id: `TXN-${Date.now()}` });
			}, 1200);
		});
	}
}