import { Check, Package, X } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useCheckoutStore } from '../store/checkoutStore';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CustomerInfo {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: 'albania' | 'kosovo' | 'macedonia' | '';
}

export const CheckoutModal = memo(({ isOpen, onClose }: CheckoutModalProps) => {
    const { items, openSuccess, openMultiSuccess } = useCheckoutStore();
    const { clearCart } = useCartStore();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [orderProgress, setOrderProgress] = useState({
        current: 0,
        total: 0,
    });

    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
    });

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setCustomerInfo({
                full_name: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                country: '',
            });
            setOrderProgress({ current: 0, total: 0 });
        }
    }, [isOpen]);

    const formatPrice = (price: number): string => {
        return price.toFixed(2);
    };

    // Calculate shipping fee based on country
    const calculateShipping = (country: string, subtotal: number): number => {
        if (country === 'kosovo') {
            return 2.4; // COD Postman fee for Kosovo
        } else if (country === 'albania' || country === 'macedonia') {
            return 4; // Fixed 4€ shipping fee
        }
        return 0;
    };

    // Calculate totals for all items
    const subtotal = items.reduce((total, item) => {
        return total + item.product.price * item.quantity;
    }, 0);

    const shippingFee = calculateShipping(customerInfo.country, subtotal);
    const totalAmount = subtotal + shippingFee;

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (
                !customerInfo.full_name ||
                !customerInfo.email ||
                !customerInfo.phone ||
                !customerInfo.address ||
                !customerInfo.city ||
                !customerInfo.country
            ) {
                toast.error('Please fill in all customer information fields');
                return;
            }
        }
        setCurrentStep(currentStep + 1);
    };

    const handlePrevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmitOrder = async () => {
        setIsLoading(true);
        setOrderProgress({ current: 0, total: items.length });

        try {
            console.log('=== SUBMITTING MULTIPLE ORDERS ===');
            console.log('Customer Info:', customerInfo);
            console.log('Items:', items);
            console.log('Subtotal:', subtotal);
            console.log('Shipping Fee:', shippingFee);
            console.log('Total Amount:', totalAmount);

            // Generate batch_id for multi-orders
            const batchId =
                items.length > 1
                    ? `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                    : null;

            console.log('Batch ID:', batchId);

            // Create order promises for parallel execution
            const orderPromises = items.map(async (item) => {
                const productSize = item.selectedSize || 'Standard';

                // Calculate individual item total (proportional shipping)
                const itemSubtotal = item.product.price * item.quantity;
                const itemShippingProportion =
                    shippingFee * (itemSubtotal / subtotal);
                const itemTotal = itemSubtotal + itemShippingProportion;

                const csrfToken =
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '';

                // Use FormData if item has a custom logo
                if (item.customLogoDataUrl) {
                    const formData = new FormData();
                    formData.append('batch_id', batchId || '');
                    formData.append(
                        'customer_full_name',
                        customerInfo.full_name,
                    );
                    formData.append('customer_email', customerInfo.email);
                    formData.append('customer_phone', customerInfo.phone);
                    formData.append('customer_address', customerInfo.address);
                    formData.append('customer_city', customerInfo.city);
                    formData.append('customer_country', customerInfo.country);
                    formData.append('product_id', item.product.id.toString());
                    formData.append(
                        'product_price',
                        Number(item.product.price).toString(),
                    );
                    formData.append('product_size', productSize);
                    formData.append(
                        'product_color',
                        item.product.color || 'As Shown',
                    );
                    formData.append(
                        'quantity',
                        Number(item.quantity).toString(),
                    );
                    formData.append(
                        'total_amount',
                        Number(itemTotal.toFixed(2)).toString(),
                    );
                    formData.append(
                        'shipping_fee',
                        Number(itemShippingProportion.toFixed(2)).toString(),
                    );
                    formData.append(
                        'notes',
                        batchId ? `Part of ${items.length} item order` : '',
                    );

                    // Convert base64 data URL to File
                    const res = await fetch(item.customLogoDataUrl);
                    const blob = await res.blob();
                    const logoFile = new File([blob], 'custom-logo.png', {
                        type: 'image/png',
                    });
                    formData.append('custom_logo', logoFile);

                    const response = await fetch('/api/orders', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRF-TOKEN': csrfToken,
                        },
                        body: formData,
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        if (data.errors) {
                            const errorMessages = Object.entries(data.errors)
                                .map(
                                    ([field, messages]: [string, any]) =>
                                        `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`,
                                )
                                .join('\n');
                            throw new Error(
                                `Validation errors for ${item.product.name}:\n${errorMessages}`,
                            );
                        }
                        throw new Error(
                            `Error for ${item.product.name}: ${data.message || 'Failed to place order'}`,
                        );
                    }

                    return { item, order: data.order };
                }

                // Use JSON when no file upload
                const orderData = {
                    batch_id: batchId,
                    customer_full_name: customerInfo.full_name,
                    customer_email: customerInfo.email,
                    customer_phone: customerInfo.phone,
                    customer_address: customerInfo.address,
                    customer_city: customerInfo.city,
                    customer_country: customerInfo.country,
                    product_id: item.product.id,
                    product_price: Number(item.product.price),
                    product_size: productSize,
                    product_color: item.product.color || 'As Shown',
                    quantity: Number(item.quantity),
                    total_amount: Number(itemTotal.toFixed(2)),
                    shipping_fee: Number(itemShippingProportion.toFixed(2)),
                    notes: batchId
                        ? `Part of ${items.length} item order`
                        : null,
                };

                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify(orderData),
                });

                const data = await response.json();

                if (!response.ok) {
                    if (data.errors) {
                        const errorMessages = Object.entries(data.errors)
                            .map(
                                ([field, messages]: [string, any]) =>
                                    `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`,
                            )
                            .join('\n');
                        throw new Error(
                            `Validation errors for ${item.product.name}:\n${errorMessages}`,
                        );
                    } else {
                        const errorMessage =
                            data.message || 'Failed to place order';
                        throw new Error(
                            `Error for ${item.product.name}: ${errorMessage}`,
                        );
                    }
                }

                return { item, order: data.order };
            });

            // Execute all orders in parallel
            const orderResults = await Promise.all(orderPromises);
            const orders = orderResults.map((result) => result.order);

            // If all orders were successful
            if (orders.length === items.length) {
                toast.success(
                    `Successfully placed ${orders.length} ${orders.length === 1 ? 'order' : 'orders'}!`,
                );
                clearCart();
                onClose();

                // Open appropriate success modal
                if (orders.length > 1) {
                    // Multiple orders - use multi-order success modal
                    openMultiSuccess(orders, totalAmount);
                } else if (orders.length === 1) {
                    // Single order - use single order success modal
                    openSuccess(orders[0]);
                }
            }
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Network error occurred while placing the order');
        } finally {
            setIsLoading(false);
            setOrderProgress({ current: 0, total: 0 });
        }
    };

    const handleClose = () => {
        setCurrentStep(1);
        setOrderProgress({ current: 0, total: 0 });
        setCustomerInfo({
            full_name: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            country: '',
        });
        onClose();
    };

    if (!isOpen || items.length === 0) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-all duration-500" />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="shadow-premium transition-noir relative w-full max-w-3xl bg-white">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white px-6 py-4">
                        <h2 className="font-sans text-xl font-bold tracking-wide text-black uppercase">
                            Checkout ({items.length}{' '}
                            {items.length === 1 ? 'item' : 'items'})
                        </h2>
                        <button
                            onClick={handleClose}
                            className="transition-noir p-2 text-black hover:bg-black hover:text-white"
                        >
                            <X className="h-5 w-5" strokeWidth={2} />
                        </button>
                    </div>

                    {/* Steps Indicator */}
                    <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
                        <div className="flex items-center justify-between">
                            {[
                                { num: 1, label: 'Info' },
                                { num: 2, label: 'Review' },
                                { num: 3, label: 'Confirm' },
                            ].map((step, index) => (
                                <div
                                    key={step.num}
                                    className="flex flex-1 items-center"
                                >
                                    <div className="flex flex-1 flex-col items-center">
                                        <div
                                            className={`transition-noir flex h-10 w-10 items-center justify-center border-2 font-sans text-sm font-bold ${
                                                currentStep >= step.num
                                                    ? 'shadow-soft border-black bg-black text-white'
                                                    : 'border-gray-300 bg-white text-gray-400'
                                            }`}
                                        >
                                            {currentStep > step.num ? (
                                                <Check
                                                    className="h-4 w-4"
                                                    strokeWidth={3}
                                                />
                                            ) : (
                                                step.num
                                            )}
                                        </div>
                                        <span className="mt-2 font-sans text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                            {step.label}
                                        </span>
                                    </div>
                                    {index < 2 && (
                                        <div
                                            className={`transition-noir flex-1 border-t-2 ${
                                                currentStep > step.num
                                                    ? 'border-black'
                                                    : 'border-gray-300'
                                            }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Step 1: Customer Information */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <h3 className="font-sans text-base font-bold tracking-wide text-black uppercase">
                                    Customer Information
                                </h3>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block font-sans text-xs font-bold tracking-wider text-gray-600 uppercase">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={customerInfo.full_name}
                                            onChange={(e) =>
                                                setCustomerInfo({
                                                    ...customerInfo,
                                                    full_name: e.target.value,
                                                })
                                            }
                                            className="shadow-soft transition-noir mt-2 block w-full border border-gray-300 bg-white px-4 py-3 font-sans text-sm focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-sans text-xs font-bold tracking-wider text-gray-600 uppercase">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={customerInfo.email}
                                            onChange={(e) =>
                                                setCustomerInfo({
                                                    ...customerInfo,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="shadow-soft transition-noir mt-2 block w-full border border-gray-300 bg-white px-4 py-3 font-sans text-sm focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                            placeholder="Enter your email"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-sans text-xs font-bold tracking-wider text-gray-600 uppercase">
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            value={customerInfo.phone}
                                            onChange={(e) =>
                                                setCustomerInfo({
                                                    ...customerInfo,
                                                    phone: e.target.value,
                                                })
                                            }
                                            className="shadow-soft transition-noir mt-2 block w-full border border-gray-300 bg-white px-4 py-3 font-sans text-sm focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-sans text-xs font-bold tracking-wider text-gray-600 uppercase">
                                            Country *
                                        </label>
                                        <select
                                            value={customerInfo.country}
                                            onChange={(e) =>
                                                setCustomerInfo({
                                                    ...customerInfo,
                                                    country: e.target
                                                        .value as any,
                                                })
                                            }
                                            className="shadow-soft transition-noir mt-2 block w-full border border-gray-300 bg-white px-4 py-3 font-sans text-sm focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                        >
                                            <option value="">
                                                Select country
                                            </option>
                                            <option value="kosovo">
                                                Kosovo (Free Shipping)
                                            </option>
                                            <option value="albania">
                                                Albania (+4€ shipping)
                                            </option>
                                            <option value="macedonia">
                                                Macedonia (+4€ shipping)
                                            </option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block font-sans text-xs font-bold tracking-wider text-gray-600 uppercase">
                                            Address *
                                        </label>
                                        <input
                                            type="text"
                                            value={customerInfo.address}
                                            onChange={(e) =>
                                                setCustomerInfo({
                                                    ...customerInfo,
                                                    address: e.target.value,
                                                })
                                            }
                                            className="shadow-soft transition-noir mt-2 block w-full border border-gray-300 bg-white px-4 py-3 font-sans text-sm focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                            placeholder="Enter your address"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-sans text-xs font-bold tracking-wider text-gray-600 uppercase">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            value={customerInfo.city}
                                            onChange={(e) =>
                                                setCustomerInfo({
                                                    ...customerInfo,
                                                    city: e.target.value,
                                                })
                                            }
                                            className="shadow-soft transition-noir mt-2 block w-full border border-gray-300 bg-white px-4 py-3 font-sans text-sm focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                            placeholder="Enter your city"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Order Review */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <h3 className="font-sans text-base font-bold tracking-wide text-black uppercase">
                                    Review Your Order ({items.length}{' '}
                                    {items.length === 1 ? 'item' : 'items'})
                                </h3>

                                {/* Items List */}
                                <div className="space-y-4">
                                    {items.map((item, index) => (
                                        <div
                                            key={`${item.product.id}-${index}`}
                                            className="shadow-soft transition-noir hover:shadow-elevated border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5"
                                        >
                                            <div className="flex gap-4">
                                                {item.product.image && (
                                                    <div className="shadow-soft h-20 w-20 flex-shrink-0 overflow-hidden bg-gray-100">
                                                        <img
                                                            src={
                                                                item.product
                                                                    .image
                                                            }
                                                            alt={
                                                                item.product
                                                                    .name
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-sans text-base font-bold tracking-wide text-black uppercase">
                                                        {item.product.name}
                                                    </h4>
                                                    <div className="mt-2 font-sans text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                                        {item.selectedSize && (
                                                            <span>
                                                                Size:{' '}
                                                                {
                                                                    item.selectedSize
                                                                }
                                                            </span>
                                                        )}
                                                        {item.product.color && (
                                                            <span className="ml-3">
                                                                Color:{' '}
                                                                {
                                                                    item.product
                                                                        .color
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-3 flex items-center justify-between">
                                                        <span className="font-sans text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                                            €
                                                            {formatPrice(
                                                                item.product
                                                                    .price,
                                                            )}{' '}
                                                            × {item.quantity}
                                                        </span>
                                                        <span className="font-sans text-xl font-bold text-black">
                                                            €
                                                            {formatPrice(
                                                                item.product
                                                                    .price *
                                                                    item.quantity,
                                                            )}
                                                        </span>
                                                    </div>
                                                    {/* Custom Logo Preview */}
                                                    {item.customLogoDataUrl && (
                                                        <div className="mt-3 flex items-center gap-3 border-t border-gray-200 pt-3">
                                                            <div className="h-12 w-12 flex-shrink-0 border border-gray-200 bg-gray-50 p-1">
                                                                <img
                                                                    src={
                                                                        item.customLogoDataUrl
                                                                    }
                                                                    alt="Custom logo"
                                                                    className="h-full w-full object-contain"
                                                                />
                                                            </div>
                                                            <span className="font-sans text-xs font-semibold text-green-700">
                                                                ✓ Custom logo
                                                                attached
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Summary */}
                                <div className="shadow-soft border-2 border-black bg-gradient-to-br from-gray-50 to-white p-6">
                                    <h4 className="mb-5 font-sans text-base font-bold tracking-wide text-black uppercase">
                                        Order Summary
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="font-sans text-sm font-semibold tracking-wider text-gray-600 uppercase">
                                                Subtotal:
                                            </span>
                                            <span className="font-sans text-base font-bold text-black">
                                                €{formatPrice(subtotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-sans text-sm font-semibold tracking-wider text-gray-600 uppercase">
                                                {customerInfo.country ===
                                                'kosovo'
                                                    ? 'COD Postman Fee:'
                                                    : 'Shipping:'}
                                            </span>
                                            <span
                                                className={`font-sans text-base font-bold ${
                                                    shippingFee === 0
                                                        ? 'text-green-700'
                                                        : 'text-black'
                                                }`}
                                            >
                                                {shippingFee === 0
                                                    ? 'Free'
                                                    : `€${formatPrice(shippingFee)}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t-2 border-black pt-4">
                                            <span className="font-sans text-base font-bold tracking-wider text-black uppercase">
                                                Total:
                                            </span>
                                            <span className="font-sans text-2xl font-bold text-black">
                                                €{formatPrice(totalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirmation */}
                        {currentStep === 3 && (
                            <div className="space-y-4 text-center">
                                <div className="flex justify-center">
                                    <div className="shadow-elevated flex h-16 w-16 items-center justify-center border-2 border-black bg-black">
                                        <Package
                                            className="h-8 w-8 text-white"
                                            strokeWidth={2}
                                        />
                                    </div>
                                </div>
                                <h3 className="font-sans text-base font-bold tracking-wide text-black uppercase">
                                    Ready to Place Order
                                </h3>
                                <p className="text-gray-700">
                                    Please confirm your order to proceed with
                                    checkout.
                                </p>
                                <div className="shadow-soft border-2 border-black bg-gradient-to-br from-gray-50 to-white p-6 text-left">
                                    <p className="font-sans text-xs font-bold tracking-wider text-gray-700 uppercase">
                                        Payment Method:
                                    </p>
                                    <p className="mt-2 font-sans text-base font-bold text-black">
                                        Cash on Delivery (COD)
                                    </p>
                                    <p className="mt-3 text-sm text-gray-600">
                                        You will pay when you receive your
                                        order.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="shadow-elevated border-t border-gray-200 bg-gradient-to-t from-gray-50 to-white px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                {currentStep > 1 && (
                                    <button
                                        onClick={handlePrevStep}
                                        className="transition-noir border border-gray-300 bg-white px-6 py-3 font-sans text-xs font-semibold tracking-widest uppercase hover:border-black hover:bg-black hover:text-white"
                                    >
                                        ← Previous
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-5">
                                <div className="font-sans text-lg font-bold text-black">
                                    Total: €{formatPrice(totalAmount)}
                                </div>

                                {currentStep < 3 ? (
                                    <button
                                        onClick={handleNextStep}
                                        className="shadow-soft transition-noir hover:shadow-elevated bg-black px-8 py-3 font-sans text-xs font-semibold tracking-widest text-white uppercase hover:-translate-y-0.5"
                                    >
                                        Next →
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmitOrder}
                                        disabled={isLoading}
                                        className="shadow-soft transition-noir hover:shadow-elevated bg-black px-8 py-3 font-sans text-xs font-semibold tracking-widest text-white uppercase hover:-translate-y-0.5 disabled:opacity-50"
                                    >
                                        {isLoading
                                            ? `Placing Orders... (${orderProgress.total} items)`
                                            : 'Place Order'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
});

CheckoutModal.displayName = 'CheckoutModal';
