import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    ChevronRight,
    CreditCard,
    Mail,
    MapPin,
    Package,
    Phone,
    ShoppingBag,
    Truck,
    User,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface Category {
    id: number;
    name: string;
    description?: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
    description?: string;
    image?: string;
    stock: 'in stock' | 'out of stock' | 'low stock';
    foot_numbers?: string;
    color?: string;
    gender?: 'male' | 'female' | 'unisex';
    category?: Category;
    category_id?: number;
    created_at?: string;
    updated_at?: string;
    sizeStocks?: {
        [size: string]: {
            quantity: number;
            stock_status: string;
        };
    };
}

interface CheckoutPageProps {
    product: Product;
}

interface CustomerInfo {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: 'albania' | 'kosovo' | 'macedonia' | '';
}

export default function Checkout({ product }: CheckoutPageProps) {
    const formatPrice = (price: number | string): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };

    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string>('');

    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
    });

    // Reset form when modal opens
    useEffect(() => {
        if (showModal) {
            setCurrentStep(1);
            setSelectedSize('');
            setCustomerInfo({
                full_name: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                country: '',
            });
        }
    }, [showModal]);

    // Determine available sizes based on sizeStocks or foot_numbers
    const availableSizes = product.sizeStocks
        ? Object.keys(product.sizeStocks).sort(
              (a, b) => parseFloat(a) - parseFloat(b),
          )
        : product.foot_numbers
          ? product.foot_numbers.split(',').map((size) => size.trim())
          : ['38', '39', '40', '41', '42', '43', '44', '45'];

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
        if (currentStep === 2 && product.sizeStocks && !selectedSize) {
            toast.error('Please select a size');
            return;
        }
        setCurrentStep(currentStep + 1);
    };

    const handlePrevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmitOrder = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    customer_full_name: customerInfo.full_name,
                    customer_email: customerInfo.email,
                    customer_phone: customerInfo.phone,
                    customer_address: customerInfo.address,
                    customer_city: customerInfo.city,
                    customer_country: customerInfo.country,
                    product_id: product.id,
                    product_price: product.price,
                    product_size:
                        selectedSize ||
                        product.foot_numbers?.split(',')[0]?.trim() ||
                        'Standard',
                    product_color: product.color || 'As Shown',
                    quantity: 1,
                    notes: '',
                }),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success('Order placed successfully!');
                setShowModal(false);
                router.visit(`/order/success?order_id=${data.order.unique_id}`);
            } else {
                const data = await response.json();
                const errorMessage = data.message || 'Failed to place order';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Network error occurred while placing the order');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head title={`Checkout - ${product.name}`} />

            {/* Header matching welcome page */}
            <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <button
                            onClick={() => router.visit('/')}
                            className="flex items-center gap-2 text-gray-700 transition-colors hover:text-gray-900"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium">Back to Shop</span>
                        </button>
                        <div className="flex items-center space-x-3">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-full"
                                style={{ backgroundColor: '#771f48' }}
                            >
                                <span className="text-sm font-bold text-white">
                                    AS
                                </span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                AndShoes
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {/* Product Card */}
                    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
                        <div className="grid gap-8 p-8 md:grid-cols-2">
                            {/* Product Image */}
                            <div className="relative">
                                <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <Package className="h-24 w-24 text-gray-300" />
                                        </div>
                                    )}
                                </div>
                                {product.stock === 'in stock' && (
                                    <div className="absolute top-4 left-4">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                                            <Check className="h-4 w-4" />
                                            In Stock
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="flex flex-col justify-center">
                                <div className="mb-4">
                                    {product.category && (
                                        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                            {product.category.name}
                                        </span>
                                    )}
                                </div>
                                <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                                    {product.name}
                                </h1>
                                {product.description && (
                                    <p className="mb-6 leading-relaxed text-gray-600">
                                        {product.description}
                                    </p>
                                )}
                                <div className="mb-8">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-bold text-gray-900">
                                            ${formatPrice(product.price)}
                                        </span>
                                        <span className="text-lg text-gray-500">
                                            per pair
                                        </span>
                                    </div>
                                </div>

                                {/* Product Features */}
                                <div className="mb-8 grid grid-cols-2 gap-4">
                                    {product.gender && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User className="h-4 w-4" />
                                            <span className="capitalize">
                                                {product.gender}
                                            </span>
                                        </div>
                                    )}
                                    {product.color && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Package className="h-4 w-4" />
                                            <span>{product.color}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Checkout Button */}
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="flex w-full items-center justify-center gap-3 rounded-full px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:outline-none"
                                    style={{
                                        backgroundColor: '#771f48',
                                        boxShadow:
                                            '0 4px 14px 0 rgba(119, 31, 72, 0.39)',
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            '#5a1737')
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            '#771f48')
                                    }
                                >
                                    <ShoppingBag className="h-6 w-6" />
                                    Proceed to Checkout
                                </button>

                                {/* Free Shipping Badge */}
                                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
                                    <Truck className="h-5 w-5 text-green-600" />
                                    <span className="font-medium">
                                        Free Shipping on All Orders
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkout Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div
                            className="sticky top-0 z-10 border-b border-gray-200 px-8 py-6"
                            style={{ backgroundColor: '#771f48' }}
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">
                                    Complete Your Order
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Progress Steps */}
                            <div className="mt-6 flex items-center justify-between">
                                {[1, 2, 3].map((step, index) => (
                                    <div
                                        key={step}
                                        className="flex flex-1 items-center"
                                    >
                                        <div className="flex flex-1 flex-col items-center">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                                                    currentStep >= step
                                                        ? 'border-white bg-white'
                                                        : 'border-white/40 bg-transparent text-white/60'
                                                }`}
                                                style={
                                                    currentStep >= step
                                                        ? { color: '#771f48' }
                                                        : {}
                                                }
                                            >
                                                {currentStep > step ? (
                                                    <Check className="h-5 w-5" />
                                                ) : (
                                                    <span className="font-bold">
                                                        {step}
                                                    </span>
                                                )}
                                            </div>
                                            <span
                                                className={`mt-2 text-xs font-medium ${
                                                    currentStep >= step
                                                        ? 'text-white'
                                                        : 'text-white/60'
                                                }`}
                                            >
                                                {step === 1 && 'Customer Info'}
                                                {step === 2 && 'Product Info'}
                                                {step === 3 && 'Confirmation'}
                                            </span>
                                        </div>
                                        {index < 2 && (
                                            <div
                                                className={`h-0.5 flex-1 transition-all ${
                                                    currentStep > step
                                                        ? 'bg-white'
                                                        : 'bg-white/30'
                                                }`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8">
                            {/* Step 1: Customer Information */}
                            {currentStep === 1 && (
                                <div className="animate-in space-y-6 duration-300 fade-in slide-in-from-right-4">
                                    <div>
                                        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                                            <User
                                                className="h-6 w-6"
                                                style={{ color: '#771f48' }}
                                            />
                                            Customer Information
                                        </h3>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                                            placeholder="Enter your full name"
                                            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all focus:bg-white focus:ring-4 focus:outline-none"
                                            style={
                                                {
                                                    '--tw-ring-color':
                                                        'rgba(119, 31, 72, 0.1)',
                                                } as React.CSSProperties
                                            }
                                            onFocus={(e) =>
                                                (e.currentTarget.style.borderColor =
                                                    '#771f48')
                                            }
                                            onBlur={(e) =>
                                                (e.currentTarget.style.borderColor =
                                                    '#e5e7eb')
                                            }
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={customerInfo.email}
                                                    onChange={(e) =>
                                                        setCustomerInfo({
                                                            ...customerInfo,
                                                            email: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder="your@email.com"
                                                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pr-4 pl-12 text-gray-900 transition-all focus:bg-white focus:ring-4 focus:outline-none"
                                                    style={
                                                        {
                                                            '--tw-ring-color':
                                                                'rgba(119, 31, 72, 0.1)',
                                                        } as React.CSSProperties
                                                    }
                                                    onFocus={(e) =>
                                                        (e.currentTarget.style.borderColor =
                                                            '#771f48')
                                                    }
                                                    onBlur={(e) =>
                                                        (e.currentTarget.style.borderColor =
                                                            '#e5e7eb')
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                Phone Number *
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    value={customerInfo.phone}
                                                    onChange={(e) =>
                                                        setCustomerInfo({
                                                            ...customerInfo,
                                                            phone: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder="+355 69 123 4567"
                                                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pr-4 pl-12 text-gray-900 transition-all focus:bg-white focus:ring-4 focus:outline-none"
                                                    style={
                                                        {
                                                            '--tw-ring-color':
                                                                'rgba(119, 31, 72, 0.1)',
                                                        } as React.CSSProperties
                                                    }
                                                    onFocus={(e) =>
                                                        (e.currentTarget.style.borderColor =
                                                            '#771f48')
                                                    }
                                                    onBlur={(e) =>
                                                        (e.currentTarget.style.borderColor =
                                                            '#e5e7eb')
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Street Address *
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute top-4 left-4 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={customerInfo.address}
                                                onChange={(e) =>
                                                    setCustomerInfo({
                                                        ...customerInfo,
                                                        address: e.target.value,
                                                    })
                                                }
                                                placeholder="Street address"
                                                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pr-4 pl-12 text-gray-900 transition-all focus:bg-white focus:ring-4 focus:outline-none"
                                                style={
                                                    {
                                                        '--tw-ring-color':
                                                            'rgba(119, 31, 72, 0.1)',
                                                    } as React.CSSProperties
                                                }
                                                onFocus={(e) =>
                                                    (e.currentTarget.style.borderColor =
                                                        '#771f48')
                                                }
                                                onBlur={(e) =>
                                                    (e.currentTarget.style.borderColor =
                                                        '#e5e7eb')
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                                                placeholder="Enter city"
                                                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all focus:bg-white focus:ring-4 focus:outline-none"
                                                style={
                                                    {
                                                        '--tw-ring-color':
                                                            'rgba(119, 31, 72, 0.1)',
                                                    } as React.CSSProperties
                                                }
                                                onFocus={(e) =>
                                                    (e.currentTarget.style.borderColor =
                                                        '#771f48')
                                                }
                                                onBlur={(e) =>
                                                    (e.currentTarget.style.borderColor =
                                                        '#e5e7eb')
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                Country *
                                            </label>
                                            <select
                                                value={customerInfo.country}
                                                onChange={(e) =>
                                                    setCustomerInfo({
                                                        ...customerInfo,
                                                        country: e.target
                                                            .value as
                                                            | 'albania'
                                                            | 'kosovo'
                                                            | 'macedonia',
                                                    })
                                                }
                                                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all focus:bg-white focus:ring-4 focus:outline-none"
                                                style={
                                                    {
                                                        '--tw-ring-color':
                                                            'rgba(119, 31, 72, 0.1)',
                                                    } as React.CSSProperties
                                                }
                                                onFocus={(e) =>
                                                    (e.currentTarget.style.borderColor =
                                                        '#771f48')
                                                }
                                                onBlur={(e) =>
                                                    (e.currentTarget.style.borderColor =
                                                        '#e5e7eb')
                                                }
                                            >
                                                <option value="">
                                                    Select country
                                                </option>
                                                <option value="albania">
                                                    Albania
                                                </option>
                                                <option value="kosovo">
                                                    Kosovo
                                                </option>
                                                <option value="macedonia">
                                                    Macedonia
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Product Information */}
                            {currentStep === 2 && (
                                <div className="animate-in space-y-6 duration-300 fade-in slide-in-from-right-4">
                                    <div>
                                        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                                            <Package
                                                className="h-6 w-6"
                                                style={{ color: '#771f48' }}
                                            />
                                            Product Information
                                        </h3>
                                    </div>

                                    {/* Product Image & Name */}
                                    <div className="overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-lg">
                                        {product.image && (
                                            <div className="aspect-square w-full overflow-hidden bg-gray-100">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <h4 className="mb-2 text-2xl font-bold text-gray-900">
                                                {product.name}
                                            </h4>
                                            {product.description && (
                                                <p className="mb-4 leading-relaxed text-gray-600">
                                                    {product.description}
                                                </p>
                                            )}
                                            <div className="flex items-baseline gap-2">
                                                <span
                                                    className="text-3xl font-bold"
                                                    style={{ color: '#771f48' }}
                                                >
                                                    $
                                                    {formatPrice(product.price)}
                                                </span>
                                                <span className="text-gray-500">
                                                    per pair
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Specifications */}
                                    <div className="space-y-4 rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6">
                                        <h5 className="mb-4 text-lg font-bold text-gray-900">
                                            Specifications
                                        </h5>

                                        <div className="grid grid-cols-2 gap-4">
                                            {product.category && (
                                                <div className="rounded-xl bg-white p-4 shadow-sm">
                                                    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                        Category
                                                    </p>
                                                    <p className="mt-1 text-lg font-bold text-gray-900">
                                                        {product.category.name}
                                                    </p>
                                                </div>
                                            )}

                                            {product.gender && (
                                                <div className="rounded-xl bg-white p-4 shadow-sm">
                                                    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                        Gender
                                                    </p>
                                                    <p className="mt-1 text-lg font-bold text-gray-900 capitalize">
                                                        {product.gender}
                                                    </p>
                                                </div>
                                            )}

                                            {product.color && (
                                                <div className="rounded-xl bg-white p-4 shadow-sm">
                                                    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                        Color
                                                    </p>
                                                    <p className="mt-1 text-lg font-bold text-gray-900 capitalize">
                                                        {product.color}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="rounded-xl bg-white p-4 shadow-sm">
                                                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                    Stock Status
                                                </p>
                                                <p
                                                    className={`mt-1 text-lg font-bold capitalize ${
                                                        product.stock ===
                                                        'in stock'
                                                            ? 'text-green-600'
                                                            : product.stock ===
                                                                'low stock'
                                                              ? 'text-orange-600'
                                                              : 'text-red-600'
                                                    }`}
                                                >
                                                    {product.stock}
                                                </p>
                                            </div>
                                        </div>

                                        {(product.foot_numbers ||
                                            product.sizeStocks) && (
                                            <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
                                                <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                    {product.sizeStocks
                                                        ? 'Select Size'
                                                        : 'Available Sizes'}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {availableSizes.map(
                                                        (size) => {
                                                            const sizeStock =
                                                                product
                                                                    .sizeStocks?.[
                                                                    size
                                                                ];
                                                            const isAvailable =
                                                                sizeStock
                                                                    ? sizeStock.quantity >
                                                                      0
                                                                    : true;
                                                            const isSelected =
                                                                selectedSize ===
                                                                size;
                                                            const stockQty =
                                                                sizeStock?.quantity;

                                                            return (
                                                                <button
                                                                    key={size}
                                                                    onClick={() =>
                                                                        product.sizeStocks &&
                                                                        isAvailable &&
                                                                        setSelectedSize(
                                                                            size,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        product.sizeStocks &&
                                                                        !isAvailable
                                                                    }
                                                                    className={`inline-flex items-center justify-center rounded-lg border-2 px-3 py-1.5 text-sm font-bold transition-all ${
                                                                        product.sizeStocks
                                                                            ? isSelected
                                                                                ? 'border-[#771f48] bg-[#771f48] text-white'
                                                                                : isAvailable
                                                                                  ? 'border-[#771f48] text-[#771f48] hover:bg-[#771f48] hover:text-white'
                                                                                  : 'cursor-not-allowed border-gray-300 text-gray-400'
                                                                            : 'border-[#771f48] text-[#771f48]'
                                                                    }`}
                                                                    style={
                                                                        !product.sizeStocks
                                                                            ? {
                                                                                  borderColor:
                                                                                      '#771f48',
                                                                                  color: '#771f48',
                                                                              }
                                                                            : undefined
                                                                    }
                                                                >
                                                                    <span>
                                                                        {size}
                                                                    </span>
                                                                    {product.sizeStocks &&
                                                                        stockQty !==
                                                                            undefined && (
                                                                            <span
                                                                                className={`ml-2 text-xs ${isSelected ? 'text-white' : isAvailable ? 'text-gray-500' : 'text-gray-400'}`}
                                                                            >
                                                                                (
                                                                                {
                                                                                    stockQty
                                                                                }

                                                                                )
                                                                            </span>
                                                                        )}
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                                {product.sizeStocks &&
                                                    selectedSize && (
                                                        <p className="mt-3 text-sm font-medium text-green-600">
                                                            ✓ Size{' '}
                                                            {selectedSize}{' '}
                                                            selected
                                                        </p>
                                                    )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Additional Info */}
                                    <div
                                        className="rounded-2xl border-2 p-6"
                                        style={{
                                            borderColor: '#771f48',
                                            backgroundColor:
                                                'rgba(119, 31, 72, 0.03)',
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="rounded-full p-2"
                                                style={{
                                                    backgroundColor: '#771f48',
                                                }}
                                            >
                                                <Truck className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h6 className="font-bold text-gray-900">
                                                    Free Shipping
                                                </h6>
                                                <p className="text-sm text-gray-600">
                                                    We offer free delivery on
                                                    all orders. Your product
                                                    will be carefully packaged
                                                    and shipped to your address.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Confirmation */}
                            {currentStep === 3 && (
                                <div className="animate-in space-y-6 duration-300 fade-in slide-in-from-right-4">
                                    <div>
                                        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                                            <Check className="h-6 w-6 text-green-600" />
                                            Review Your Order
                                        </h3>
                                    </div>

                                    {/* Customer Info Summary */}
                                    <div
                                        className="rounded-2xl border-2 border-gray-100 p-6"
                                        style={{
                                            background:
                                                'linear-gradient(to bottom right, rgba(119, 31, 72, 0.05), rgba(119, 31, 72, 0.1))',
                                        }}
                                    >
                                        <h4 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                                            <User
                                                className="h-5 w-5"
                                                style={{ color: '#771f48' }}
                                            />
                                            Delivery Information
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <p>
                                                <span className="font-semibold">
                                                    Name:
                                                </span>{' '}
                                                {customerInfo.full_name}
                                            </p>
                                            <p>
                                                <span className="font-semibold">
                                                    Email:
                                                </span>{' '}
                                                {customerInfo.email}
                                            </p>
                                            <p>
                                                <span className="font-semibold">
                                                    Phone:
                                                </span>{' '}
                                                {customerInfo.phone}
                                            </p>
                                            <p>
                                                <span className="font-semibold">
                                                    Address:
                                                </span>{' '}
                                                {customerInfo.address},{' '}
                                                {customerInfo.city},{' '}
                                                {customerInfo.country
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    customerInfo.country.slice(
                                                        1,
                                                    )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Product Summary */}
                                    <div
                                        className="rounded-2xl border-2 border-gray-100 p-6"
                                        style={{
                                            background:
                                                'linear-gradient(to bottom right, rgba(119, 31, 72, 0.05), rgba(119, 31, 72, 0.15))',
                                        }}
                                    >
                                        <h4 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                                            <Package
                                                className="h-5 w-5"
                                                style={{ color: '#771f48' }}
                                            />
                                            Order Summary
                                        </h4>
                                        <div className="mb-4 flex items-center gap-4">
                                            {product.image && (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="h-16 w-16 rounded-lg object-cover"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <h5 className="font-bold text-gray-900">
                                                    {product.name}
                                                </h5>
                                                <p className="text-sm text-gray-600">
                                                    {product.category &&
                                                        `${product.category.name} • `}
                                                    {product.gender &&
                                                        `${product.gender.charAt(0).toUpperCase() + product.gender.slice(1)}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 border-t border-gray-200 pt-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    Price:
                                                </span>
                                                <span className="font-semibold">
                                                    $
                                                    {formatPrice(product.price)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    Shipping:
                                                </span>
                                                <span className="font-semibold text-green-600">
                                                    FREE
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-t border-gray-200 pt-2">
                                                <span className="font-bold text-gray-900">
                                                    Total:
                                                </span>
                                                <span
                                                    className="text-2xl font-bold"
                                                    style={{ color: '#771f48' }}
                                                >
                                                    $
                                                    {formatPrice(product.price)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-6">
                                        <h4 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
                                            <CreditCard className="h-5 w-5 text-amber-600" />
                                            Payment Method
                                        </h4>
                                        <p className="text-sm text-amber-800">
                                            💰 <strong>Cash on Delivery</strong>{' '}
                                            - Payment will be collected when
                                            your order is delivered to your
                                            address.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-8 py-6">
                            <div className="flex items-center justify-between gap-4">
                                {currentStep > 1 && (
                                    <button
                                        onClick={handlePrevStep}
                                        className="flex items-center gap-2 rounded-full border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                )}

                                {currentStep < 3 ? (
                                    <button
                                        onClick={handleNextStep}
                                        className="ml-auto flex items-center gap-2 rounded-full px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                                        style={{ backgroundColor: '#771f48' }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.backgroundColor =
                                                '#5a1737')
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.backgroundColor =
                                                '#771f48')
                                        }
                                    >
                                        Next Step
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmitOrder}
                                        disabled={isLoading}
                                        className="ml-auto flex items-center gap-2 rounded-full px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                                        style={{
                                            backgroundColor: isLoading
                                                ? '#771f48'
                                                : '#16a34a',
                                        }}
                                        onMouseEnter={(e) =>
                                            !isLoading &&
                                            (e.currentTarget.style.backgroundColor =
                                                '#15803d')
                                        }
                                        onMouseLeave={(e) =>
                                            !isLoading &&
                                            (e.currentTarget.style.backgroundColor =
                                                '#16a34a')
                                        }
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-5 w-5" />
                                                Place Order
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
