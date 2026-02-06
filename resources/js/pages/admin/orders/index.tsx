import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    CreditCard,
    Edit2,
    Eye,
    Filter,
    Hash,
    Package,
    Phone,
    Search,
    ShoppingCart,
    Trash2,
    User,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: '/admin/orders',
    },
];

interface Product {
    id: number;
    name: string;
    price: number;
    image?: string;
}

interface SingleOrder {
    id: number;
    unique_id: string;
    batch_id?: string | null;
    customer_full_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    customer_city: string;
    customer_country: 'albania' | 'kosovo' | 'macedonia';
    product_id: number;
    product_name: string;
    product_price: number;
    product_image?: string;
    product_size?: string;
    product_color?: string;
    quantity: number;
    total_amount: number;
    payment_method: 'cash';
    status:
        | 'pending'
        | 'confirmed'
        | 'processing'
        | 'shipped'
        | 'delivered'
        | 'cancelled';
    notes?: string;
    confirmed_at?: string;
    shipped_at?: string;
    delivered_at?: string;
    created_at?: string;
    updated_at?: string;
    product?: Product;
}

interface Order {
    id: number;
    is_batch: boolean;
    batch_id?: string | null;
    unique_id: string;
    customer_full_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    customer_city: string;
    customer_country: 'albania' | 'kosovo' | 'macedonia';
    product_id?: number;
    product_name?: string;
    product_price?: number;
    product_image?: string;
    product_size?: string;
    product_color?: string;
    quantity?: number;
    total_amount: number;
    payment_method: 'cash';
    status:
        | 'pending'
        | 'confirmed'
        | 'processing'
        | 'shipped'
        | 'delivered'
        | 'cancelled';
    notes?: string;
    created_at?: string;
    updated_at?: string;
    product?: Product;
    orders?: SingleOrder[]; // For batched orders
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface Filters {
    search?: string;
    status?: string;
    country?: string;
    payment_method?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: string;
}

interface OrdersPageProps {
    orders: Order[];
    pagination?: Pagination;
    filters?: Filters;
}

export default function Orders({
    orders = [],
    pagination,
    filters = {},
}: OrdersPageProps) {
    // Debug logging
    console.log('Orders component received:', {
        orders,
        pagination,
        filters,
        ordersLength: orders.length,
        ordersType: typeof orders,
        ordersIsArray: Array.isArray(orders),
    });

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedCountry, setSelectedCountry] = useState(
        filters.country || '',
    );

    // Modal states
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    // Real-time filtering with debounce
    const getCurrentFilters = useCallback(() => {
        const filterParams: any = {};
        if (searchTerm) filterParams.search = searchTerm;
        if (selectedStatus) filterParams.status = selectedStatus;
        if (selectedCountry) filterParams.country = selectedCountry;
        return filterParams;
    }, [searchTerm, selectedStatus, selectedCountry]);

    const applyFilters = useCallback(() => {
        router.get('/admin/orders', getCurrentFilters(), {
            preserveState: true,
            preserveScroll: true,
        });
    }, [getCurrentFilters]);

    // Debounced filtering effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            applyFilters();
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [applyFilters]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSelectedCountry('');
    };

    // CRUD Functions
    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    const handleEditOrder = (order: Order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setShowEditModal(true);
    };

    const handleDeleteOrder = (order: Order) => {
        setSelectedOrder(order);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedOrder) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/orders/${selectedOrder.id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setShowDeleteModal(false);
                setSelectedOrder(null);
                toast.success('Order deleted successfully!');
                router.reload();
            } else {
                const data = await response.json();
                const errorMessage = data.message || 'Failed to delete order';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('Network error occurred while deleting the order');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/orders/${selectedOrder.id}`, {
                method: 'PUT',
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
                    status: newStatus,
                    notes: selectedOrder.notes,
                }),
            });

            if (response.ok) {
                setShowEditModal(false);
                setSelectedOrder(null);
                toast.success('Order status updated successfully!');
                router.reload();
            } else {
                const data = await response.json();
                const errorMessage =
                    data.message || 'Failed to update order status';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Network error occurred while updating the order');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatPrice = (price: number | string): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-gray-100 text-gray-800 border border-gray-300';
            case 'confirmed':
                return 'bg-gray-200 text-gray-900 border border-gray-400';
            case 'processing':
                return 'bg-black text-white border border-gray-900';
            case 'shipped':
                return 'bg-black text-white border border-black';
            case 'delivered':
                return 'bg-black text-white border border-black';
            case 'cancelled':
                return 'bg-white text-black border border-black';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-300';
        }
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />

            {/* Main Container */}
            <div className="min-h-screen bg-white">
                <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="border-2 border-black bg-black p-2">
                                    <ShoppingCart className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black tracking-tighter text-black uppercase lg:text-3xl">
                                        Orders
                                    </h1>
                                    <p className="mt-1 text-sm font-medium text-gray-600">
                                        Manage and track customer orders
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Smart Filters Section */}
                    <div className="mb-6 overflow-hidden border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="border border-black bg-black p-2">
                                        <Filter className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="text-base font-bold tracking-wide text-black uppercase">
                                        Filters
                                    </h3>
                                </div>
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 text-xs font-bold tracking-wide text-black uppercase transition-all duration-200 hover:bg-black hover:text-white"
                                >
                                    <X className="h-3 w-3" />
                                    Clear All
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {/* Search */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold tracking-wide text-black uppercase">
                                        Search Orders
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            placeholder="Order ID, Customer..."
                                            className="w-full border border-gray-300 bg-white py-2.5 pr-3 pl-10 text-sm font-medium transition-all duration-300 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold tracking-wide text-black uppercase">
                                        Order Status
                                    </label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) =>
                                            setSelectedStatus(e.target.value)
                                        }
                                        className="w-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium transition-all duration-300 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">
                                            Confirmed
                                        </option>
                                        <option value="processing">
                                            Processing
                                        </option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">
                                            Delivered
                                        </option>
                                        <option value="cancelled">
                                            Cancelled
                                        </option>
                                    </select>
                                </div>

                                {/* Country Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold tracking-wide text-black uppercase">
                                        Country
                                    </label>
                                    <select
                                        value={selectedCountry}
                                        onChange={(e) =>
                                            setSelectedCountry(e.target.value)
                                        }
                                        className="w-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium transition-all duration-300 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                                    >
                                        <option value="">All Countries</option>
                                        <option value="albania">Albania</option>
                                        <option value="kosovo">Kosovo</option>
                                        <option value="macedonia">
                                            Macedonia
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orders Table Section */}
                    <div className="overflow-hidden border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="border border-black bg-black p-2">
                                        <ShoppingCart className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="text-base font-bold tracking-wide text-black uppercase">
                                        Orders List (
                                        {pagination?.total || orders.length} )
                                    </h3>
                                </div>
                                <div className="text-xs font-medium text-gray-600">
                                    Showing {pagination?.from || 0} to{' '}
                                    {pagination?.to || 0} of{' '}
                                    {pagination?.total || orders.length} orders
                                </div>
                            </div>
                        </div>

                        {orders.length > 0 ? (
                            <>
                                {/* Desktop Table View - Hidden on mobile */}
                                <div className="hidden lg:block">
                                    <table className="w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-black uppercase">
                                                    Order ID
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-black uppercase">
                                                    Customer
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-black uppercase">
                                                    Product
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-black uppercase">
                                                    Total
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-black uppercase">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-black uppercase">
                                                    Date
                                                </th>
                                                <th className="w-48 px-4 py-3 text-center text-xs font-bold tracking-wider text-black uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {orders.map((order, index) => (
                                                <tr
                                                    key={order.id}
                                                    className={`transition-all duration-300 hover:bg-gray-50 ${
                                                        index % 2 === 0
                                                            ? 'bg-white'
                                                            : 'bg-gray-50/30'
                                                    }`}
                                                >
                                                    {/* Order ID */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <div className="border border-black bg-black p-1.5">
                                                                <Hash className="h-3 w-3 text-white" />
                                                            </div>
                                                            <span className="text-xs font-bold text-black">
                                                                {
                                                                    order.unique_id
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Customer */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="border border-gray-300 bg-white p-1.5">
                                                                <User className="h-4 w-4 text-black" />
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-black">
                                                                    {
                                                                        order.customer_full_name
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-gray-600">
                                                                    {
                                                                        order.customer_email
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Product */}
                                                    <td className="px-4 py-3">
                                                        {order.is_batch &&
                                                        order.orders ? (
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex items-center gap-2 border border-gray-300 bg-gray-100 px-2 py-1">
                                                                    <Package className="h-4 w-4 text-black" />
                                                                    <span className="text-xs font-bold text-black">
                                                                        {
                                                                            order
                                                                                .orders
                                                                                .length
                                                                        }{' '}
                                                                        Products
                                                                    </span>
                                                                </div>
                                                                <div className="max-h-20 space-y-1 overflow-y-auto">
                                                                    {order.orders.map(
                                                                        (
                                                                            item,
                                                                            idx,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="flex items-center gap-1.5 text-xs text-gray-600"
                                                                            >
                                                                                <span className="flex h-4 w-4 items-center justify-center border border-gray-300 bg-white text-[10px] font-semibold">
                                                                                    {idx +
                                                                                        1}
                                                                                </span>
                                                                                <span className="max-w-[150px] truncate">
                                                                                    {
                                                                                        item.product_name
                                                                                    }
                                                                                </span>
                                                                                <span className="text-gray-400">
                                                                                    ×
                                                                                    {
                                                                                        item.quantity
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                {order.product_image ? (
                                                                    <img
                                                                        src={
                                                                            order.product_image
                                                                        }
                                                                        alt={
                                                                            order.product_name
                                                                        }
                                                                        className="h-10 w-10 border border-gray-200 object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-10 w-10 items-center justify-center border border-gray-200 bg-gray-100">
                                                                        <Package className="h-5 w-5 text-gray-400" />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div className="text-xs font-semibold text-black">
                                                                        {
                                                                            order.product_name
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        Qty:{' '}
                                                                        {
                                                                            order.quantity
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Total */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="text-base font-bold text-black">
                                                            €
                                                            {formatPrice(
                                                                order.total_amount,
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-1 text-xs font-bold tracking-wide uppercase ${getStatusColor(order.status)}`}
                                                        >
                                                            {order.status
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                order.status.slice(
                                                                    1,
                                                                )}
                                                        </span>
                                                    </td>

                                                    {/* Date */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <Calendar className="h-3 w-3" />
                                                            {order.created_at
                                                                ? formatDate(
                                                                      order.created_at,
                                                                  )
                                                                : 'N/A'}
                                                        </div>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="w-48 px-4 py-3 pr-8">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleViewDetails(
                                                                        order,
                                                                    )
                                                                }
                                                                className="inline-flex w-full items-center justify-center gap-2 border border-gray-300 bg-white px-3 py-2 text-xs font-bold tracking-wide text-black uppercase transition-all duration-200 hover:bg-black hover:text-white focus:outline-none"
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleEditOrder(
                                                                        order,
                                                                    )
                                                                }
                                                                className="inline-flex w-full items-center justify-center gap-2 border border-gray-300 bg-black px-3 py-2 text-xs font-bold tracking-wide text-white uppercase transition-all duration-200 hover:bg-black focus:outline-none"
                                                            >
                                                                <Edit2 className="h-3 w-3" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteOrder(
                                                                        order,
                                                                    )
                                                                }
                                                                className="inline-flex w-full items-center justify-center gap-2 border border-black bg-black px-3 py-2 text-xs font-bold tracking-wide text-white uppercase transition-all duration-200 hover:bg-gray-100 hover:text-black focus:outline-none"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View - Visible on mobile only */}
                                <div className="grid grid-cols-1 gap-6 p-6 lg:hidden">
                                    {orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-sm"
                                        >
                                            {/* Order Header */}
                                            <div className="border-b border-gray-100 bg-black p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-black p-2">
                                                            <Hash className="h-4 w-4 text-black" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                                Order ID
                                                            </p>
                                                            <p className="text-sm font-bold text-gray-900">
                                                                {
                                                                    order.unique_id
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}
                                                    >
                                                        {order.status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            order.status.slice(
                                                                1,
                                                            )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Order Details */}
                                            <div className="space-y-4 p-4">
                                                {/* Customer Info */}
                                                <div className="flex items-start gap-3">
                                                    <div className="border border-gray-300 bg-white p-2">
                                                        <User className="h-5 w-5 text-black" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                            Customer
                                                        </p>
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {
                                                                order.customer_full_name
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {
                                                                order.customer_email
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {
                                                                order.customer_phone
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex items-start gap-3 border-t border-gray-100 pt-4">
                                                    {order.product_image ? (
                                                        <img
                                                            src={
                                                                order.product_image
                                                            }
                                                            alt={
                                                                order.product_name
                                                            }
                                                            className="h-16 w-16 flex-shrink-0 object-cover shadow-md"
                                                        />
                                                    ) : (
                                                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center bg-gray-100">
                                                            <Package className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                            Product
                                                        </p>
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {order.product_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Quantity:{' '}
                                                            {order.quantity}
                                                        </p>
                                                        {order.product_size && (
                                                            <p className="text-xs text-gray-500">
                                                                Size:{' '}
                                                                {
                                                                    order.product_size
                                                                }
                                                            </p>
                                                        )}
                                                        {order.product_color && (
                                                            <p className="text-xs text-gray-500">
                                                                Color:{' '}
                                                                {
                                                                    order.product_color
                                                                }
                                                            </p>
                                                        )}
                                                        {/* Shipping indicator */}
                                                        {order.customer_country !==
                                                            'kosovo' && (
                                                            <div className="mt-1 inline-flex items-center gap-1 bg-gray-200 px-2 py-0.5">
                                                                <span className="text-[10px] font-semibold text-amber-700">
                                                                    +4€ SHIPPING
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Total & Date */}
                                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                                    <div>
                                                        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                            Total Amount
                                                        </p>
                                                        <p className="text-2xl font-bold text-black">
                                                            €
                                                            {formatPrice(
                                                                order.total_amount,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                            Order Date
                                                        </p>
                                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                                            <Calendar className="h-4 w-4" />
                                                            {order.created_at
                                                                ? formatDate(
                                                                      order.created_at,
                                                                  )
                                                                : 'Unknown'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
                                                    <button
                                                        onClick={() =>
                                                            handleViewDetails(
                                                                order,
                                                            )
                                                        }
                                                        className="flex items-center justify-center gap-2 border border-black bg-white px-4 py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-black hover:text-white focus:ring-1 focus:ring-black focus:outline-none"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleEditOrder(
                                                                order,
                                                            )
                                                        }
                                                        className="flex items-center justify-center gap-2 bg-black px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-black focus:ring-1 focus:ring-black focus:outline-none"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteOrder(
                                                                order,
                                                            )
                                                        }
                                                        className="flex items-center justify-center gap-2 bg-black px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-100 hover:text-black focus:ring-1 focus:ring-black focus:outline-none"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 bg-gray-100 p-5">
                                    <ShoppingCart className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-gray-900">
                                    No orders found
                                </h3>
                                <p className="mb-6 max-w-md text-sm text-gray-600">
                                    {Object.keys(filters).length > 0
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'Orders will appear here once customers start making purchases.'}
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination && pagination.last_page > 1 && (
                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-medium text-gray-700">
                                        Showing {pagination.from || 0} to{' '}
                                        {pagination.to || 0} of{' '}
                                        {pagination.total || 0} results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {pagination.current_page > 1 && (
                                            <button
                                                onClick={() =>
                                                    router.get(
                                                        '/admin/orders',
                                                        {
                                                            ...getCurrentFilters(),
                                                            page:
                                                                pagination.current_page -
                                                                1,
                                                        },
                                                        {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                                className="relative inline-flex items-center border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                                            >
                                                Previous
                                            </button>
                                        )}

                                        {Array.from(
                                            { length: pagination.last_page },
                                            (_, i) => i + 1,
                                        ).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() =>
                                                    router.get(
                                                        '/admin/orders',
                                                        {
                                                            ...getCurrentFilters(),
                                                            page,
                                                        },
                                                        {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                                className={`relative inline-flex items-center border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                                                    page ===
                                                    pagination.current_page
                                                        ? 'scale-105 border-gray-300 bg-black text-white shadow-sm'
                                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        {pagination.current_page <
                                            pagination.last_page && (
                                            <button
                                                onClick={() =>
                                                    router.get(
                                                        '/admin/orders',
                                                        {
                                                            ...getCurrentFilters(),
                                                            page:
                                                                pagination.current_page +
                                                                1,
                                                        },
                                                        {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                                className="relative inline-flex items-center border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                                            >
                                                Next
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
                    <div className="w-full max-w-5xl animate-in overflow-hidden border-2 border-black bg-white shadow-sm duration-300 fade-in zoom-in">
                        {/* Header with black background */}
                        <div className="relative overflow-hidden bg-black px-8 py-8">
                            <div className="bg-grid-white/10 absolute inset-0"></div>
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-sm font-medium text-black">
                                        Order Details
                                    </p>
                                    <h3 className="flex items-center gap-2 text-3xl font-bold text-white">
                                        <Hash className="h-7 w-7" />
                                        {selectedOrder.unique_id}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setSelectedOrder(null);
                                    }}
                                    className="bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:rotate-90 hover:bg-gray-100/30"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            {/* Status badge in header */}
                            <div className="relative mt-4">
                                <span
                                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold shadow-sm ${getStatusColor(selectedOrder.status)}`}
                                >
                                    <span className="h-2 w-2 animate-pulse bg-current"></span>
                                    {selectedOrder.status
                                        .charAt(0)
                                        .toUpperCase() +
                                        selectedOrder.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="max-h-[70vh] overflow-y-auto p-8">
                            {/* Product Showcase */}
                            {selectedOrder.is_batch && selectedOrder.orders ? (
                                /* Multi-Product Display */
                                <div className="mb-8 space-y-4">
                                    <div className="flex items-center gap-3 border-2 border-black bg-white px-5 py-4">
                                        <Package className="h-6 w-6 text-black" />
                                        <div>
                                            <span className="text-lg font-bold text-black">
                                                Multi-Product Order
                                            </span>
                                            <p className="text-sm text-black">
                                                {selectedOrder.orders.length}{' '}
                                                products in this order
                                            </p>
                                        </div>
                                    </div>

                                    {/* Products Grid */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {selectedOrder.orders.map(
                                            (item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="overflow-hidden border-2 border-black bg-white shadow-sm transition-all hover:shadow-md"
                                                >
                                                    <div className="bg-black px-4 py-2">
                                                        <span className="text-sm font-bold text-white">
                                                            Product #{idx + 1}
                                                        </span>
                                                    </div>
                                                    <div className="p-4">
                                                        <div className="flex gap-4">
                                                            {item.product_image ? (
                                                                <div className="flex-shrink-0">
                                                                    <img
                                                                        src={
                                                                            item.product_image
                                                                        }
                                                                        alt={
                                                                            item.product_name
                                                                        }
                                                                        className="h-24 w-24 border-2 border-gray-200 object-cover shadow-sm"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center border-2 border-gray-200 bg-gray-100">
                                                                    <Package className="h-10 w-10 text-gray-400" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 space-y-2">
                                                                <h5 className="line-clamp-2 text-base font-bold text-gray-900">
                                                                    {
                                                                        item.product_name
                                                                    }
                                                                </h5>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {item.product_size && (
                                                                        <span className="inline-flex items-center gap-1 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-black">
                                                                            <Package className="h-3 w-3" />
                                                                            {
                                                                                item.product_size
                                                                            }
                                                                        </span>
                                                                    )}
                                                                    {item.product_color && (
                                                                        <span className="inline-flex items-center gap-1 bg-black px-2 py-0.5 text-xs font-semibold text-white">
                                                                            {
                                                                                item.product_color
                                                                            }
                                                                        </span>
                                                                    )}
                                                                    <span className="inline-flex items-center gap-1 bg-gray-200 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                                                        Qty:{' '}
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center justify-between pt-1">
                                                                    <span className="text-xs text-gray-500">
                                                                        Unit: €
                                                                        {formatPrice(
                                                                            item.product_price,
                                                                        )}
                                                                    </span>
                                                                    <span className="text-base font-bold text-black">
                                                                        €
                                                                        {formatPrice(
                                                                            item.total_amount,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    {/* Total Summary for Batch */}
                                    <div className="border-2 border-gray-300 bg-black p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-gray-900">
                                                Total Order Amount:
                                            </span>
                                            <span className="text-3xl font-bold text-black">
                                                €
                                                {formatPrice(
                                                    selectedOrder.total_amount,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Single Product Display */
                                <div className="mb-8 overflow-hidden border border-black bg-white shadow-sm">
                                    <div className="flex flex-col gap-6 p-6 md:flex-row">
                                        {selectedOrder.product_image && (
                                            <div className="flex-shrink-0">
                                                <div className="relative overflow-hidden border-4 border-white shadow-sm">
                                                    <img
                                                        src={
                                                            selectedOrder.product_image
                                                        }
                                                        alt={
                                                            selectedOrder.product_name
                                                        }
                                                        className="h-48 w-48 object-cover"
                                                    />
                                                    <div className="absolute inset-0"></div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                                    Product
                                                </p>
                                                <h4 className="mt-1 text-2xl font-bold text-gray-900">
                                                    {selectedOrder.product_name}
                                                </h4>
                                            </div>

                                            <div className="flex flex-wrap gap-3">
                                                {selectedOrder.product_size && (
                                                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2">
                                                        <Package className="h-4 w-4 text-black" />
                                                        <span className="text-sm font-semibold text-black">
                                                            Size:{' '}
                                                            {
                                                                selectedOrder.product_size
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                {selectedOrder.product_color && (
                                                    <div className="flex items-center gap-2 bg-black px-3 py-2">
                                                        <div
                                                            className="h-4 w-4 border-2 border-gray-300 bg-current"
                                                            style={{
                                                                color: selectedOrder.product_color.toLowerCase(),
                                                            }}
                                                        ></div>
                                                        <span className="text-sm font-semibold text-white">
                                                            {
                                                                selectedOrder.product_color
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 bg-gray-200 px-3 py-2">
                                                    <ShoppingCart className="h-4 w-4 text-amber-600" />
                                                    <span className="text-sm font-semibold text-amber-900">
                                                        Qty:{' '}
                                                        {selectedOrder.quantity}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Price Breakdown */}
                                            <div className="space-y-2 bg-white p-4 shadow-sm">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        Unit Price:
                                                    </span>
                                                    <span className="font-semibold text-gray-900">
                                                        €
                                                        {formatPrice(
                                                            selectedOrder.product_price ||
                                                                0,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        Subtotal (
                                                        {selectedOrder.quantity}
                                                        x):
                                                    </span>
                                                    <span className="font-semibold text-gray-900">
                                                        €
                                                        {formatPrice(
                                                            (selectedOrder.product_price ||
                                                                0) *
                                                                (selectedOrder.quantity ||
                                                                    0),
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between border-t border-gray-200 pt-2 text-sm">
                                                    <span className="text-gray-600">
                                                        Shipping Fee:
                                                    </span>
                                                    {selectedOrder.customer_country ===
                                                    'kosovo' ? (
                                                        <span className="font-bold text-white">
                                                            FREE 🎉
                                                        </span>
                                                    ) : (
                                                        <span className="font-semibold text-amber-600">
                                                            €
                                                            {formatPrice(
                                                                selectedOrder.total_amount -
                                                                    (selectedOrder.product_price ||
                                                                        0) *
                                                                        (selectedOrder.quantity ||
                                                                            0),
                                                            )}
                                                            <span className="ml-1 text-xs text-gray-500">
                                                                (
                                                                {selectedOrder.customer_country ===
                                                                'albania'
                                                                    ? 'Albania'
                                                                    : 'Macedonia'}{' '}
                                                                +4€)
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-between border-t-2 border-gray-300 pt-3">
                                                <span className="text-base font-bold text-gray-900">
                                                    Total Amount:
                                                </span>
                                                <span className="text-2xl font-bold text-black">
                                                    €
                                                    {formatPrice(
                                                        selectedOrder.total_amount,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Customer & Order Info Grid */}
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Customer Information */}
                                <div className="border border-gray-200 bg-white p-6 shadow-sm">
                                    <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                        <div className="bg-black p-2">
                                            <User className="h-5 w-5 text-black" />
                                        </div>
                                        Customer Information
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 bg-gray-50 p-3">
                                            <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500">
                                                    Full Name
                                                </p>
                                                <p className="font-semibold text-gray-900">
                                                    {
                                                        selectedOrder.customer_full_name
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 bg-gray-50 p-3">
                                            <Package className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500">
                                                    Email
                                                </p>
                                                <p className="font-medium text-gray-900">
                                                    {
                                                        selectedOrder.customer_email
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 bg-gray-50 p-3">
                                            <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500">
                                                    Phone
                                                </p>
                                                <p className="font-medium text-gray-900">
                                                    {
                                                        selectedOrder.customer_phone
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 bg-gray-50 p-3">
                                            <Package className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500">
                                                    Delivery Address
                                                </p>
                                                <p className="font-medium text-gray-900">
                                                    {
                                                        selectedOrder.customer_address
                                                    }
                                                </p>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {
                                                        selectedOrder.customer_city
                                                    }
                                                    ,{' '}
                                                    {getCountryLabel(
                                                        selectedOrder.customer_country,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Information */}
                                <div className="border border-gray-200 bg-white p-6 shadow-sm">
                                    <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                        <div className="bg-gray-100 p-2">
                                            <CreditCard className="h-5 w-5 text-black" />
                                        </div>
                                        Order Information
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 bg-gray-50 p-3">
                                            <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500">
                                                    Order Date
                                                </p>
                                                <p className="font-semibold text-gray-900">
                                                    {selectedOrder.created_at
                                                        ? formatDate(
                                                              selectedOrder.created_at,
                                                          )
                                                        : 'Unknown'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 bg-gray-50 p-3">
                                            <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500">
                                                    Payment Method
                                                </p>
                                                <p className="font-medium text-gray-900">
                                                    💰 Cash on Delivery
                                                </p>
                                            </div>
                                        </div>
                                        {selectedOrder.notes && (
                                            <div className="flex items-start gap-3 bg-gray-200 p-3">
                                                <Package className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                                                <div>
                                                    <p className="text-xs font-semibold text-amber-700">
                                                        Customer Notes
                                                    </p>
                                                    <p className="font-medium text-amber-900">
                                                        {selectedOrder.notes}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Information */}
                            <div className="mt-6 border-2 border-black bg-white p-6 shadow-sm">
                                <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                    <div className="bg-gray-200 p-2">
                                        <Package className="h-5 w-5 text-amber-600" />
                                    </div>
                                    Shipping & Pricing Details
                                </h4>

                                {/* Price Breakdown */}
                                <div className="mb-4 border-2 border-gray-200 bg-white p-5 shadow-sm">
                                    <h5 className="mb-3 text-sm font-bold text-gray-700 uppercase">
                                        💰 Price Breakdown
                                    </h5>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between border-b border-gray-100 py-2">
                                            <span className="text-sm text-gray-600">
                                                Products Subtotal:
                                            </span>
                                            <span className="text-base font-semibold text-gray-900">
                                                {selectedOrder.is_batch &&
                                                selectedOrder.orders
                                                    ? `€${formatPrice(
                                                          selectedOrder.orders.reduce(
                                                              (sum, order) =>
                                                                  sum +
                                                                  (order.product_price ||
                                                                      0) *
                                                                      (order.quantity ||
                                                                          0),
                                                              0,
                                                          ),
                                                      )}`
                                                    : `€${formatPrice(
                                                          (selectedOrder.product_price ||
                                                              0) *
                                                              (selectedOrder.quantity ||
                                                                  0),
                                                      )}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-100 py-2">
                                            <span className="flex items-center gap-2 text-sm text-gray-600">
                                                Shipping Fee
                                                {selectedOrder.customer_country ===
                                                    'kosovo' && (
                                                    <span className="bg-black px-2 py-0.5 text-xs font-semibold text-green-700">
                                                        FREE
                                                    </span>
                                                )}
                                            </span>
                                            <span
                                                className={`text-base font-semibold ${
                                                    selectedOrder.customer_country ===
                                                    'kosovo'
                                                        ? 'text-white'
                                                        : 'text-amber-600'
                                                }`}
                                            >
                                                {selectedOrder.customer_country ===
                                                'kosovo'
                                                    ? '€0.00'
                                                    : '€4.00'}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between border-t-2 border-gray-300 pt-3">
                                            <span className="text-base font-bold text-gray-900">
                                                Total Amount:
                                            </span>
                                            <span className="text-2xl font-bold text-black">
                                                €
                                                {formatPrice(
                                                    selectedOrder.total_amount,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="bg-white/80 p-4 shadow-sm">
                                        <p className="mb-1 text-xs font-semibold text-gray-500 uppercase">
                                            Shipping Country
                                        </p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {getCountryLabel(
                                                selectedOrder.customer_country,
                                            )}
                                        </p>
                                    </div>
                                    <div className="bg-white/80 p-4 shadow-sm">
                                        <p className="mb-1 text-xs font-semibold text-gray-500 uppercase">
                                            Delivery Address
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {selectedOrder.customer_address}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-600">
                                            {selectedOrder.customer_city}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 border-2 border-gray-300 bg-blue-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 bg-black p-2">
                                            <Package className="h-5 w-5 text-black" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-black">
                                                Shipping Instructions
                                            </p>
                                            <p className="mt-1 text-sm text-black">
                                                📦 Package will be delivered to
                                                the address provided above.
                                                <br />
                                                💰 Payment will be collected
                                                upon delivery (Cash on
                                                Delivery).
                                                <br />
                                                ⏱️ Estimated delivery: 2-5
                                                business days within{' '}
                                                {getCountryLabel(
                                                    selectedOrder.customer_country,
                                                )}
                                                .
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="border-t border-black bg-gray-50 px-8 py-6">
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedOrder(null);
                                }}
                                className="w-full bg-black px-6 py-4 font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-black hover:shadow-sm focus:ring-1 focus:ring-black focus:outline-none"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Status Modal */}
            {showEditModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                        <div className="bg-black px-8 py-6">
                            <h3 className="text-xl font-bold text-white">
                                Update Order Status
                            </h3>
                        </div>
                        <div className="p-8">
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Order: {selectedOrder.unique_id}
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) =>
                                        setNewStatus(e.target.value)
                                    }
                                    className="w-full border-2 border-gray-200 bg-gray-50/50 px-4 py-4 text-sm font-medium transition-all duration-300 focus:border-gray-300 focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">
                                        Processing
                                    </option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedOrder(null);
                                    }}
                                    className="flex-1 border-2 border-gray-300 bg-white px-6 py-4 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateStatus}
                                    disabled={isLoading}
                                    className="flex-1 bg-black px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-black focus:ring-1 focus:ring-black focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isLoading
                                        ? 'Updating...'
                                        : 'Update Status'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                        <div className="bg-black px-8 py-6">
                            <h3 className="text-xl font-bold text-white">
                                Confirm Deletion
                            </h3>
                        </div>
                        <div className="p-8">
                            <div className="mb-8 flex items-center gap-4">
                                <div className="bg-red-100 p-4">
                                    <ShoppingCart className="h-8 w-8 text-black" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        Delete Order "{selectedOrder.unique_id}
                                        "?
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        This action cannot be undone. The order
                                        will be permanently removed.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedOrder(null);
                                    }}
                                    className="flex-1 border-2 border-gray-300 bg-white px-6 py-4 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isLoading}
                                    className="flex-1 bg-black px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-100 hover:text-black focus:ring-1 focus:ring-black focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isLoading ? 'Deleting...' : 'Delete Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
