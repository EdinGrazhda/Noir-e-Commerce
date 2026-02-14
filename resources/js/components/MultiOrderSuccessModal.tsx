import {
    Calendar,
    CheckCircle,
    CreditCard,
    Home,
    Mail,
    Package,
    Phone,
    X,
} from 'lucide-react';
import { memo } from 'react';

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

interface MultiOrderSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: Order[];
    totalAmount: number;
}

export const MultiOrderSuccessModal = memo(
    ({ isOpen, onClose, orders, totalAmount }: MultiOrderSuccessModalProps) => {
        if (!isOpen || !orders || orders.length === 0) return null;

        const formatPrice = (price: number | string): string => {
            const numPrice =
                typeof price === 'string' ? parseFloat(price) : price;
            return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
        };

        const getCountryLabel = (country: string) => {
            switch (country) {
                case 'albania':
                    return 'Albania';
                case 'kosovo':
                    return 'Kosovo';
                case 'macedonia':
                    return 'Macedonia';
                default:
                    return country;
            }
        };

        const formatDate = (dateString: string) => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        };

        // Use first order for customer info since all orders have same customer
        const customerOrder = orders[0];
        const totalItems = orders.reduce(
            (sum, order) => sum + order.quantity,
            0,
        );
        const calculatedTotal = orders.reduce(
            (sum, order) => sum + order.total_amount,
            0,
        );

        return (
            <>
                {/* Backdrop */}
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="shadow-premium transition-noir relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden bg-white">
                        {/* Modal Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white px-6 py-4">
                            <h2 className="font-sans text-xl font-bold tracking-wide text-black uppercase">
                                Order Confirmation - {orders.length}{' '}
                                {orders.length === 1 ? 'Item' : 'Items'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="transition-noir p-2 text-black hover:bg-black hover:text-white"
                            >
                                <X className="h-5 w-5" strokeWidth={2} />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Success Header */}
                            <div className="mb-6 text-center">
                                <div className="mb-4 flex justify-center">
                                    <div className="shadow-premium flex h-20 w-20 items-center justify-center bg-black">
                                        <CheckCircle
                                            className="h-10 w-10 text-white"
                                            strokeWidth={2}
                                        />
                                    </div>
                                </div>
                                <h1 className="font-sans text-2xl font-bold tracking-wide text-black uppercase">
                                    {orders.length === 1 ? 'Order' : 'Orders'}{' '}
                                    Placed Successfully!
                                </h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Thank you for your order
                                    {orders.length > 1 ? 's' : ''}. We'll be in
                                    touch with you soon.
                                </p>
                                <div className="shadow-soft mt-4 border-2 border-black bg-gradient-to-br from-gray-50 to-white p-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <Package
                                            className="h-5 w-5 text-black"
                                            strokeWidth={2}
                                        />
                                        <span className="font-sans text-base font-bold tracking-wide text-black uppercase">
                                            {orders.length} Order
                                            {orders.length > 1
                                                ? 's'
                                                : ''} • {totalItems} Item
                                            {totalItems > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <p className="mt-1.5 font-sans text-xs font-medium tracking-wider text-gray-600 uppercase">
                                        Each item has been processed as a
                                        separate order for better tracking.
                                    </p>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="mb-6">
                                <div className="shadow-soft overflow-hidden border border-gray-200 bg-white">
                                    <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-4 py-3">
                                        <h3 className="flex items-center gap-2 font-sans text-base font-bold tracking-wide text-black uppercase">
                                            <Home
                                                className="h-4 w-4"
                                                strokeWidth={2}
                                            />
                                            Delivery Information
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                                        <div className="flex items-start gap-2.5">
                                            <div className="bg-gray-100 p-1.5">
                                                <Package
                                                    className="h-3.5 w-3.5 text-black"
                                                    strokeWidth={2}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-sans text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                                    Customer Name
                                                </div>
                                                <div className="text-sm font-bold text-gray-900">
                                                    {
                                                        customerOrder.customer_full_name
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <div
                                                className="rounded-lg p-1.5"
                                                style={{
                                                    backgroundColor:
                                                        'rgba(119, 31, 72, 0.1)',
                                                }}
                                            >
                                                <Mail
                                                    className="h-3.5 w-3.5"
                                                    style={{ color: '#771f48' }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-semibold text-gray-700">
                                                    Email Address
                                                </div>
                                                <div className="text-sm text-gray-900">
                                                    {
                                                        customerOrder.customer_email
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <div
                                                className="rounded-lg p-1.5"
                                                style={{
                                                    backgroundColor:
                                                        'rgba(119, 31, 72, 0.1)',
                                                }}
                                            >
                                                <Phone
                                                    className="h-3.5 w-3.5"
                                                    style={{ color: '#771f48' }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-semibold text-gray-700">
                                                    Phone Number
                                                </div>
                                                <div className="text-sm text-gray-900">
                                                    {
                                                        customerOrder.customer_phone
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5 md:col-span-3">
                                            <div
                                                className="rounded-lg p-1.5"
                                                style={{
                                                    backgroundColor:
                                                        'rgba(119, 31, 72, 0.1)',
                                                }}
                                            >
                                                <Home
                                                    className="h-3.5 w-3.5"
                                                    style={{ color: '#771f48' }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-semibold text-gray-700">
                                                    Delivery Address
                                                </div>
                                                <div className="text-sm text-gray-900">
                                                    {
                                                        customerOrder.customer_address
                                                    }
                                                    <br />
                                                    {
                                                        customerOrder.customer_city
                                                    }
                                                    ,{' '}
                                                    {getCountryLabel(
                                                        customerOrder.customer_country,
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Orders List */}
                            <div className="mb-6">
                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
                                    <div
                                        className="border-b border-gray-100 px-4 py-3"
                                        style={{
                                            background:
                                                'linear-gradient(to right, rgba(119, 31, 72, 0.05), rgba(119, 31, 72, 0.15))',
                                        }}
                                    >
                                        <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                                            <Package
                                                className="h-4 w-4"
                                                style={{ color: '#771f48' }}
                                            />
                                            Order Details ({orders.length}{' '}
                                            {orders.length === 1
                                                ? 'Item'
                                                : 'Items'}
                                            )
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {orders.map((order, index) => (
                                            <div key={order.id} className="p-4">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <div className="text-xs font-semibold text-gray-600">
                                                        Order #{order.unique_id}
                                                    </div>
                                                    <div
                                                        className="text-sm font-bold"
                                                        style={{
                                                            color: '#771f48',
                                                        }}
                                                    >
                                                        €
                                                        {formatPrice(
                                                            order.total_amount,
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    {order.product_image ? (
                                                        <img
                                                            src={
                                                                order.product_image
                                                            }
                                                            alt={
                                                                order.product_name
                                                            }
                                                            className="h-16 w-16 rounded-lg object-cover shadow-md"
                                                        />
                                                    ) : (
                                                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 shadow-md">
                                                            <Package className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-gray-900">
                                                            {order.product_name}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            €
                                                            {formatPrice(
                                                                order.product_price,
                                                            )}{' '}
                                                            × {order.quantity}
                                                        </p>
                                                        <div className="mt-1 flex gap-4 text-xs text-gray-600">
                                                            {order.product_size && (
                                                                <span>
                                                                    Size:{' '}
                                                                    {
                                                                        order.product_size
                                                                    }
                                                                </span>
                                                            )}
                                                            {order.product_color && (
                                                                <span>
                                                                    Color:{' '}
                                                                    {
                                                                        order.product_color
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="rounded-xl border border-gray-200 bg-white shadow-md">
                                <div
                                    className="border-b border-gray-100 px-4 py-3"
                                    style={{
                                        background:
                                            'linear-gradient(to right, rgba(119, 31, 72, 0.05), rgba(119, 31, 72, 0.1))',
                                    }}
                                >
                                    <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                                        <CreditCard
                                            className="h-4 w-4"
                                            style={{ color: '#771f48' }}
                                        />
                                        Total Summary
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-2 rounded-xl bg-gray-50 p-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                Items ({totalItems}):
                                            </span>
                                            <span className="font-semibold text-gray-900">
                                                €
                                                {formatPrice(
                                                    orders.reduce(
                                                        (sum, order) =>
                                                            sum +
                                                            order.product_price *
                                                                order.quantity,
                                                        0,
                                                    ),
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                Shipping:
                                            </span>
                                            <span className="font-semibold text-gray-900">
                                                €
                                                {formatPrice(
                                                    orders.reduce(
                                                        (sum, order) =>
                                                            sum +
                                                            order.total_amount -
                                                            order.product_price *
                                                                order.quantity,
                                                        0,
                                                    ),
                                                )}
                                            </span>
                                        </div>
                                        <div className="border-t border-gray-300 pt-2">
                                            <div className="flex justify-between text-lg">
                                                <span className="font-bold text-gray-900">
                                                    Total Amount:
                                                </span>
                                                <span
                                                    className="font-bold"
                                                    style={{ color: '#771f48' }}
                                                >
                                                    €
                                                    {formatPrice(
                                                        calculatedTotal,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                                            <CreditCard className="h-4 w-4" />
                                            <span>
                                                Payment Method: Cash on Delivery
                                                (COD)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Next Steps */}
                            <div className="mt-6 rounded-xl bg-blue-50 p-4">
                                <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-900">
                                    <Calendar className="h-4 w-4" />
                                    What's Next?
                                </h4>
                                <ul className="space-y-1 text-xs text-blue-800">
                                    <li>
                                        • We'll contact you within 24 hours to
                                        confirm your order
                                    </li>
                                    <li>
                                        • Your order
                                        {orders.length > 1 ? 's' : ''} will be
                                        prepared and shipped
                                    </li>
                                    <li>
                                        • You'll receive tracking information
                                        via email
                                    </li>
                                    <li>
                                        • Payment will be collected upon
                                        delivery
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="shrink-0 border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <p className="font-sans text-xs font-medium tracking-wider text-gray-600 uppercase">
                                    Need help? Contact us at{' '}
                                    <a
                                        href="mailto:info@noirclothes.shop"
                                        className="font-bold text-black hover:underline"
                                    >
                                        info@noirclothes.shop
                                    </a>
                                </p>
                                <button
                                    onClick={onClose}
                                    className="shadow-premium transition-noir border-2 border-black bg-black px-6 py-2.5 font-sans text-sm font-bold tracking-wider text-white uppercase hover:bg-white hover:text-black"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    },
);

MultiOrderSuccessModal.displayName = 'MultiOrderSuccessModal';
