import { Minus, Plus, Trash2, X } from 'lucide-react';
import { memo } from 'react';
import { toast } from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useCheckoutStore } from '../store/checkoutStore';

/**
 * Sliding cart drawer with item management
 * Accessible with keyboard navigation and screen reader support
 */
export const CartDrawer = memo(() => {
    const {
        items,
        isOpen,
        closeCart,
        updateQuantity,
        removeItem,
        totalPrice,
        clearCart,
    } = useCartStore();

    const { openCheckout } = useCheckoutStore();

    const handleCheckout = () => {
        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        // Convert cart items to checkout items
        const checkoutItems = items.map((item) => ({
            product: item.product,
            selectedSize: item.product.selectedSize || null,
            quantity: item.quantity,
        }));

        // Close the cart drawer
        closeCart();

        // Open checkout modal with all cart items
        openCheckout(checkoutItems);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all duration-500 fade-in"
                onClick={closeCart}
                aria-hidden="true"
            />

            {/* Drawer */}
            <aside
                className="shadow-premium transition-noir fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-md animate-in flex-col bg-white slide-in-from-right"
                role="dialog"
                aria-label="Shopping cart"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white px-8 py-6">
                    <h2 className="font-sans text-2xl font-bold tracking-wide text-black uppercase">
                        Shopping Cart
                    </h2>
                    <button
                        onClick={closeCart}
                        className="transition-noir rounded-lg p-2 text-black hover:bg-black hover:text-white focus:ring-2 focus:ring-black focus:outline-none"
                        aria-label="Close cart"
                    >
                        <X size={22} strokeWidth={2} />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    {items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                                <svg
                                    className="h-16 w-16 text-gray-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                    />
                                </svg>
                            </div>
                            <p className="text-xl font-semibold text-gray-800">
                                Your cart is empty
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                Add some products to get started!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {items.map((item) => (
                                <div
                                    key={item.product.id}
                                    className="group shadow-soft transition-noir hover:shadow-elevated flex gap-4 overflow-hidden border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 transition-all hover:-translate-y-1"
                                >
                                    {/* Product Image */}
                                    <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="shadow-soft transition-noir group-hover:shadow-elevated h-24 w-24 flex-shrink-0 object-cover group-hover:grayscale-0"
                                        style={{ filter: 'grayscale(20%)' }}
                                    />

                                    {/* Product Info */}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate font-sans text-base font-bold tracking-wide text-black uppercase">
                                            {item.product.name}
                                        </h3>
                                        <p className="mt-2 font-sans text-xl font-bold text-black">
                                            €
                                            {(item.product.price || 0).toFixed(
                                                2,
                                            )}
                                        </p>

                                        {/* Quantity Controls */}
                                        <div className="mt-3 flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.product.id,
                                                        item.quantity - 1,
                                                    )
                                                }
                                                className="transition-noir flex h-8 w-8 items-center justify-center border border-gray-300 bg-white hover:border-black hover:bg-black hover:text-white focus:ring-2 focus:ring-black focus:outline-none"
                                                aria-label={`Decrease quantity of ${item.product.name}`}
                                            >
                                                <Minus
                                                    size={14}
                                                    strokeWidth={2.5}
                                                />
                                            </button>
                                            <span
                                                className="min-w-[2rem] text-center font-mono text-sm font-bold text-black"
                                                aria-live="polite"
                                            >
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.product.id,
                                                        item.quantity + 1,
                                                    )
                                                }
                                                disabled={
                                                    item.product.stock ===
                                                    'out of stock'
                                                }
                                                className="transition-noir flex h-8 w-8 items-center justify-center border border-gray-300 bg-white hover:border-black hover:bg-black hover:text-white focus:ring-2 focus:ring-black focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                                                aria-label={`Increase quantity of ${item.product.name}`}
                                            >
                                                <Plus
                                                    size={14}
                                                    strokeWidth={2.5}
                                                />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    removeItem(item.product.id)
                                                }
                                                className="transition-noir ml-auto flex h-8 w-8 items-center justify-center border border-red-200 bg-white text-red-600 hover:border-red-600 hover:bg-red-600 hover:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                                                aria-label={`Remove ${item.product.name} from cart`}
                                            >
                                                <Trash2
                                                    size={14}
                                                    strokeWidth={2.5}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="shadow-elevated space-y-6 border-t border-gray-200 bg-gradient-to-t from-gray-50 to-white px-8 py-6">
                        {/* Total */}
                        <div className="flex items-center justify-between">
                            <span className="font-sans text-sm font-semibold tracking-wider text-gray-600 uppercase">
                                Total:
                            </span>
                            <span className="font-sans text-3xl font-bold text-black">
                                €{totalPrice.toFixed(2)}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={handleCheckout}
                                className="shadow-soft transition-noir hover:shadow-elevated w-full bg-black py-4 font-sans text-sm font-bold tracking-widest text-white uppercase hover:-translate-y-0.5 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none active:translate-y-0"
                                aria-label="Proceed to checkout"
                            >
                                Proceed to Checkout
                            </button>
                            <button
                                onClick={clearCart}
                                className="transition-noir w-full border border-gray-300 bg-white py-3 font-sans text-xs font-semibold tracking-wider text-gray-700 uppercase hover:border-black hover:bg-black hover:text-white focus:ring-2 focus:ring-black focus:outline-none"
                                aria-label="Clear all items from cart"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
});

CartDrawer.displayName = 'CartDrawer';
