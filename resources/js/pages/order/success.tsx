import PublicLayout from '@/layouts/public-layout';
import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    CreditCard,
    Home,
    Mail,
    Package,
    Phone,
    ShoppingCart,
} from 'lucide-react';

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

interface OrderSuccessPageProps {
    order: Order;
}

export default function OrderSuccess({ order }: OrderSuccessPageProps) {
    const formatPrice = (price: number | string): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
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

    return (
        <PublicLayout>
            <Head title="Order Successful" />

            {/* Main Container */}
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
                <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
                    {/* Success Header */}
                    <div className="mb-10 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 p-6 shadow-2xl">
                                <CheckCircle className="h-16 w-16 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl">
                            Order Placed Successfully!
                        </h1>
                        <p className="mt-4 text-xl text-gray-600">
                            Thank you for your order. We'll be in touch with you
                            soon.
                        </p>
                        <div className="mt-6 rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-100 to-teal-100 p-6">
                            <div className="flex items-center justify-center gap-3">
                                <Package className="h-6 w-6 text-emerald-600" />
                                <span className="text-lg font-semibold text-emerald-900">
                                    Order ID: {order.unique_id}
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-emerald-700">
                                Keep this order ID for your records. You can use
                                it to track your order.
                            </p>
                        </div>
                    </div>

                    {/* Order Details Cards */}
                    <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Customer Information */}
                        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6">
                                <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                    <Home className="h-6 w-6 text-blue-600" />
                                    Delivery Information
                                </h3>
                            </div>
                            <div className="space-y-4 p-8">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <Package className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-700">
                                            Customer Name
                                        </div>
                                        <div className="text-lg font-bold text-gray-900">
                                            {order.customer_full_name}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <Mail className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-700">
                                            Email
                                        </div>
                                        <div className="text-gray-900">
                                            {order.customer_email}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <Phone className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-700">
                                            Phone
                                        </div>
                                        <div className="text-gray-900">
                                            {order.customer_phone}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 rounded-lg bg-gray-100 p-2">
                                        <Home className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-700">
                                            Delivery Address
                                        </div>
                                        <div className="text-gray-900">
                                            {order.customer_address}
                                            <br />
                                            {order.customer_city},{' '}
                                            {getCountryLabel(
                                                order.customer_country,
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Information */}
                        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                            <div className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6">
                                <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                    <ShoppingCart className="h-6 w-6 text-purple-600" />
                                    Order Summary
                                </h3>
                            </div>
                            <div className="p-8">
                                <div className="mb-6 flex items-start gap-4">
                                    {order.product_image ? (
                                        <img
                                            src={order.product_image}
                                            alt={order.product_name}
                                            className="h-20 w-20 rounded-xl object-cover shadow-lg"
                                        />
                                    ) : (
                                        <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100 shadow-lg">
                                            <Package className="h-10 w-10 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h4 className="text-lg font-bold text-gray-900">
                                            {order.product_name}
                                        </h4>
                                        <p className="text-lg font-semibold text-purple-600">
                                            ${formatPrice(order.product_price)}
                                        </p>
                                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                                            {order.product_size && (
                                                <div>
                                                    Size: {order.product_size}
                                                </div>
                                            )}
                                            {order.product_color && (
                                                <div>
                                                    Color: {order.product_color}
                                                </div>
                                            )}
                                            <div>
                                                Quantity: {order.quantity}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 rounded-2xl bg-gray-50 p-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Subtotal:
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            $
                                            {formatPrice(
                                                order.product_price *
                                                    order.quantity,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Delivery:
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            FREE
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-lg font-bold text-gray-900">
                                                Total:
                                            </span>
                                            <span className="text-2xl font-bold text-purple-600">
                                                $
                                                {formatPrice(
                                                    order.total_amount,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-amber-600" />
                                        <span className="font-semibold text-amber-900">
                                            Payment Method
                                        </span>
                                    </div>
                                    <p className="text-sm text-amber-700">
                                        💰 Cash on Delivery - Payment will be
                                        collected when your order arrives
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Status and Next Steps */}
                    <div className="mb-10 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                        <div className="border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-8 py-6">
                            <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                <Calendar className="h-6 w-6 text-emerald-600" />
                                What Happens Next?
                            </h3>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="text-center">
                                    <div className="mb-4 flex justify-center">
                                        <div className="rounded-full bg-blue-100 p-4">
                                            <CheckCircle className="h-8 w-8 text-blue-600" />
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">
                                        Order Confirmed
                                    </h4>
                                    <p className="mt-2 text-sm text-gray-600">
                                        We've received your order and will
                                        process it shortly.
                                    </p>
                                    <div className="mt-2 text-xs font-medium text-blue-600">
                                        {order.created_at &&
                                            formatDate(order.created_at)}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-4 flex justify-center">
                                        <div className="rounded-full bg-yellow-100 p-4">
                                            <Package className="h-8 w-8 text-yellow-600" />
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">
                                        Processing
                                    </h4>
                                    <p className="mt-2 text-sm text-gray-600">
                                        We'll prepare your order and contact you
                                        to confirm delivery details.
                                    </p>
                                    <div className="mt-2 text-xs font-medium text-yellow-600">
                                        Within 24 hours
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-4 flex justify-center">
                                        <div className="rounded-full bg-emerald-100 p-4">
                                            <Home className="h-8 w-8 text-emerald-600" />
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">
                                        Delivery
                                    </h4>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Your order will be delivered to your
                                        address with cash payment.
                                    </p>
                                    <div className="mt-2 text-xs font-medium text-emerald-600">
                                        2-5 business days
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <button
                            onClick={() => router.visit('/')}
                            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 focus:outline-none"
                        >
                            <Home className="h-6 w-6" />
                            Continue Shopping
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 shadow-lg transition-all duration-300 hover:scale-105 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 focus:ring-offset-2 focus:outline-none"
                        >
                            <Package className="h-6 w-6" />
                            Print Order Details
                        </button>
                    </div>

                    {/* Contact Information */}
                    <div className="mt-10 text-center">
                        <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
                            <h4 className="mb-3 text-lg font-bold text-gray-900">
                                Need Help?
                            </h4>
                            <p className="mb-4 text-gray-600">
                                If you have any questions about your order, feel
                                free to contact us.
                            </p>
                            <div className="flex flex-col justify-center gap-4 text-sm sm:flex-row">
                                <div className="flex items-center justify-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-700">
                                        +355 69 123 4567
                                    </span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-700">
                                        info@noirclothes.shop
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
