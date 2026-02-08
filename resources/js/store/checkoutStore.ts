import { create } from 'zustand';
import type { Product } from '../types/store';

interface Order {
    id: number;
    unique_id: string;
    customer_full_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    customer_city: string;
    customer_country: 'albania' | 'kosovo' | 'macedonia';
    product_name: string;
    product_price: number;
    product_image?: string;
    product_size?: string;
    product_color?: string;
    quantity: number;
    total_amount: number;
    payment_method: 'cash';
    status: string;
    created_at?: string;
}

export interface CheckoutItem {
    product: Product;
    selectedSize: string | null;
    quantity: number;
    customLogoDataUrl?: string; // Base64 data URL of uploaded logo
}

interface CheckoutState {
    isOpen: boolean;
    items: CheckoutItem[];
    isSuccessOpen: boolean;
    successOrder: Order | null;
    isMultiSuccessOpen: boolean;
    successOrders: Order[];
    totalAmount: number;
    openCheckout: (items: CheckoutItem[]) => void;
    closeCheckout: () => void;
    openSuccess: (order: Order) => void;
    closeSuccess: () => void;
    openMultiSuccess: (orders: Order[], totalAmount: number) => void;
    closeMultiSuccess: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
    isOpen: false,
    items: [],
    isSuccessOpen: false,
    successOrder: null,
    isMultiSuccessOpen: false,
    successOrders: [],
    totalAmount: 0,
    openCheckout: (items) =>
        set({
            isOpen: true,
            items,
        }),
    closeCheckout: () => set({ isOpen: false, items: [] }),
    openSuccess: (order) => set({ isSuccessOpen: true, successOrder: order }),
    closeSuccess: () => set({ isSuccessOpen: false, successOrder: null }),
    openMultiSuccess: (orders, totalAmount) =>
        set({ isMultiSuccessOpen: true, successOrders: orders, totalAmount }),
    closeMultiSuccess: () =>
        set({ isMultiSuccessOpen: false, successOrders: [], totalAmount: 0 }),
}));
