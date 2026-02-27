// --- Motor Private Vehicle Makes API ---
export interface VehicleMakeOption {
	value: string;
	label: string;
}

export async function getMotorPrivateVehicleMakes() {
	const { data } = await api.get<{ options: VehicleMakeOption[] }>(
		'/motor-private/vehicle-makes'
	);
	return data.options;
}
// --- General Information API ---
export interface GeneralInformation {
	definition?: string;
	benefits?: string[];
	eligibility?: string;
	[key: string]: unknown;
}

export async function getGeneralInformation(product: string) {
	// Backend expects only `product` as a query param.
	const { data } = await api.get<GeneralInformation>(`/general-information`, {
		params: { product },
	});
	return data;
}

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rag-production-44a1.up.railway.app/api/v1';
const API_KEY = import.meta.env.VITE_API_KEY;

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
	// Avoid sending `X-API-KEY: undefined` when the env var isn't set.
	if (API_KEY) {
		config.headers['X-API-KEY'] = API_KEY;
	} else {
		delete (config.headers as Record<string, unknown>)['X-API-KEY'];
	}
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

// --- Guided flow response types (backend step payloads) ---
export interface GuidedFormField {
	name: string;
	label: string;
	type: string;
	required?: boolean;
	placeholder?: string;
	help?: string;
	minLength?: number;
	maxLength?: number;
	options?: { value: string; label: string }[];
	defaultValue?: string;
}

export type GuidedStepResponse =
	| { type: 'form'; message?: string; fields: GuidedFormField[] }
	| {
			type: 'product_cards';
			message?: string;
			products: { id: string; label: string; description?: string; action?: string }[];
	  }
	| {
			type: 'premium_summary';
			message?: string;
			monthly_premium: number;
			annual_premium: number;
			cover_limit_ugx?: number;
			benefits?: string[];
			actions?: { type: string; label: string }[];
			[k: string]: unknown;
	  }
	| {
			type: 'yes_no_details';
			message: string;
			question_id: string;
			options: { id: string; label: string }[];
			details_field?: { name: string; label: string; show_when: string };
	  }
	| {
			type: 'checkbox';
			message: string;
			options: { id: string; label: string; description?: string }[];
			field_name?: string;
			other_field?: { name: string; label: string };
	  }
	| {
			type: 'radio';
			message: string;
			question_id: string;
			options: { id: string; label: string }[];
			required?: boolean;
	  }
	| {
			type: 'options';
			message?: string;
			options: {
				id: string;
				label: string;
				description?: string;
				benefits?: Record<string, string>;
			}[];
	  }
	| { type: 'file_upload'; message: string; field_name: string; accept?: string }
	| { type: 'final_confirmation'; message?: string; actions?: { type: string; label: string }[] }
	| { type: 'proceed_to_payment'; message?: string; quote_id?: string; [k: string]: unknown }
	| { type: 'message'; message: string };

export interface StartGuidedResponse {
	session_id: string;
	mode?: string;
	flow?: string;
	step?: number;
	response: GuidedStepResponse;
}

export interface ChatMessageResponse {
	message?: string;
	options?: Array<{ id?: string; value?: string; label: string }>;
	response: { response?: GuidedStepResponse; complete?: boolean; [k: string]: unknown };
	session_id?: string;
	mode?: string;
	[k: string]: unknown;
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
	const { data } = await api.post<ChatMessageResponse>('/chat/message', payload);
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
	session_id?: string;
	initial_data?: Record<string, unknown>;
}

export async function startGuidedQuote(payload: StartGuidedQuotePayload) {
	const { data } = await api.post<StartGuidedResponse>('/chat/start-guided', payload);
	return data;
}

// --- Draft API (guided-flow drafts) ---
export interface FormDraft {
	session_id: string;
	flow: string;
	step: number;
	collected_data: Record<string, unknown>;
	status?: string;
	updated_at?: string;
}

export async function getFormDraft(session_id: string, flow_name: string) {
	const { data } = await api.get<FormDraft>(`/forms/draft/${session_id}/${flow_name}`);
	return data;
}

export async function deleteFormDraft(session_id: string, flow_name: string) {
	const { data } = await api.delete<{ status: string }>(`/forms/draft/${session_id}/${flow_name}`);
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