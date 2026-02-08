import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types/store';

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    addItem: (product: Product, quantity?: number, customLogoDataUrl?: string) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    totalItems: number;
    totalPrice: number;
}

/**
 * Zustand store for cart state management with localStorage persistence
 * Provides optimized actions for cart operations
 */
export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (product, quantity = 1, customLogoDataUrl) => {
                set((state) => {
                    const existingItem = state.items.find(
                        (item) => item.product.id === product.id,
                    );

                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item.product.id === product.id
                                    ? {
                                          ...item,
                                          quantity: item.quantity + quantity,
                                          customLogoDataUrl: customLogoDataUrl || item.customLogoDataUrl,
                                      }
                                    : item,
                            ),
                            isOpen: true,
                        };
                    }

                    return {
                        items: [
                            ...state.items,
                            {
                                product,
                                quantity: quantity,
                                customLogoDataUrl,
                            },
                        ],
                        isOpen: true,
                    };
                });
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter(
                        (item) => item.product.id !== productId,
                    ),
                }));
            },

            updateQuantity: (productId, quantity) => {
                set((state) => {
                    if (quantity <= 0) {
                        return {
                            items: state.items.filter(
                                (item) => item.product.id !== productId,
                            ),
                        };
                    }

                    return {
                        items: state.items.map((item) =>
                            item.product.id === productId
                                ? {
                                      ...item,
                                      quantity: quantity,
                                  }
                                : item,
                        ),
                    };
                });
            },

            clearCart: () => {
                set({ items: [], isOpen: false });
            },

            openCart: () => {
                set({ isOpen: true });
            },

            closeCart: () => {
                set({ isOpen: false });
            },

            toggleCart: () => {
                set((state) => ({ isOpen: !state.isOpen }));
            },

            totalItems: 0,
            totalPrice: 0,
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({ items: state.items }),
        },
    ),
);

// Subscribe to items changes to update totals
let previousItems: CartItem[] = [];
useCartStore.subscribe((state) => {
    // Only update totals if items actually changed
    if (state.items !== previousItems) {
        previousItems = state.items;

        const totalItems = state.items.reduce(
            (sum, item) => sum + item.quantity,
            0,
        );
        const totalPrice = state.items.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0,
        );

        // Only update if totals changed to avoid infinite loops
        if (
            state.totalItems !== totalItems ||
            state.totalPrice !== totalPrice
        ) {
            useCartStore.setState({ totalItems, totalPrice });
        }
    }
});
