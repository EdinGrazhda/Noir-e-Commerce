import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertTriangle,
    Calendar,
    DollarSign,
    Package,
    RefreshCw,
    ShoppingCart,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardStats {
    daily: { sales: number; orders: number };
    weekly: { sales: number; orders: number };
    monthly: { sales: number; orders: number };
    total_revenue: number;
    low_stock_products: Array<{
        id: number;
        name: string;
        stock: number;
        price: number;
    }>;
    out_of_stock_count: number;
    total_products: number;
    total_customers: number;
    recent_orders: Array<any>;
    top_products: Array<any>;
    sales_trend: Array<{ date: string; sales: number }>;
    orders_by_status: Record<string, number>;
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStats();
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchStats();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchStats = async (manual = false) => {
        if (manual) setRefreshing(true);
        try {
            const response = await axios.get('/api/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
            if (manual) setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full items-center justify-center">
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="mb-2 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Dashboard Overview
                        </h1>
                        <p className="mt-1 text-gray-600">
                            Welcome back! Here's what's happening with your
                            store.
                        </p>
                    </div>
                    <button
                        onClick={() => fetchStats(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 bg-black px-4 py-2 text-white transition-colors hover:bg-black disabled:opacity-50"
                    >
                        <RefreshCw
                            size={18}
                            className={refreshing ? 'animate-spin' : ''}
                        />
                        <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                </div>

                {/* Key Metrics - 4 Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Revenue */}
                    <div className="bg-black p-6 text-white shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium opacity-90">
                                    Total Revenue
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    €{(stats?.total_revenue || 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-white/20 p-3">
                                <DollarSign size={28} />
                            </div>
                        </div>
                    </div>

                    {/* Total Products */}
                    <div className="border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Products
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {stats?.total_products || 0}
                                </p>
                            </div>
                            <div className="bg-black p-3">
                                <Package size={28} className="text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Total Customers */}
                    <div className="border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Customers
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {stats?.total_customers || 0}
                                </p>
                            </div>
                            <div className="bg-black p-3">
                                <Users size={28} className="text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Alert */}
                    <div className="border border-gray-300 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Low Stock Items
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {stats?.low_stock_products?.length || 0}
                                </p>
                            </div>
                            <div className="bg-black p-3">
                                <AlertTriangle
                                    size={28}
                                    className="text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sales Overview - 3 Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Daily Sales */}
                    <div className="border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="bg-black p-2">
                                <Calendar size={20} className="text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Today's Sales
                            </h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900">
                                    €{(stats?.daily?.sales || 0).toFixed(2)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">
                                {stats?.daily?.orders || 0} orders today
                            </p>
                        </div>
                    </div>

                    {/* Weekly Sales */}
                    <div className="border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="bg-black p-2">
                                <TrendingUp size={20} className="text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Last 7 Days
                            </h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900">
                                    €{(stats?.weekly?.sales || 0).toFixed(2)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">
                                {stats?.weekly?.orders || 0} orders in last 7
                                days
                            </p>
                        </div>
                    </div>

                    {/* Monthly Sales */}
                    <div className="border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="bg-gray-100 p-2">
                                <ShoppingCart
                                    size={20}
                                    className="text-black"
                                />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                This Month
                            </h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900">
                                    €{(stats?.monthly?.sales || 0).toFixed(2)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">
                                {stats?.monthly?.orders || 0} orders this month
                            </p>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Low Stock Products */}
                    <div className="border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Low Stock Products
                            </h3>
                            <span className="bg-black px-3 py-1 text-sm font-medium text-white">
                                {stats?.low_stock_products.length || 0} items
                            </span>
                        </div>
                        <div className="max-h-[300px] space-y-3 overflow-y-auto">
                            {stats?.low_stock_products &&
                            stats.low_stock_products.length > 0 ? (
                                stats.low_stock_products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between border border-gray-300 bg-gray-50 p-3"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                                {product.name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                €
                                                {(
                                                    Number(product.price) || 0
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-white">
                                                Stock: {product.stock}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="py-4 text-center text-gray-500">
                                    All products are well stocked!
                                </p>
                            )}
                            {stats?.out_of_stock_count &&
                                stats.out_of_stock_count > 0 && (
                                    <div className="border border-gray-300 bg-red-50 p-3">
                                        <p className="text-sm font-medium text-black">
                                            ⚠️ {stats.out_of_stock_count}{' '}
                                            products are out of stock
                                        </p>
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Top Selling Products */}
                    <div className="border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Top Selling Products
                            </h3>
                            <TrendingUp className="text-white" size={20} />
                        </div>
                        <div className="max-h-[300px] space-y-3 overflow-y-auto">
                            {stats?.top_products &&
                            stats.top_products.length > 0 ? (
                                stats.top_products.map((item, index) => (
                                    <div
                                        key={item.product_id}
                                        className="flex items-center justify-between border border-gray-300 bg-green-50 p-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-8 w-8 items-center justify-center bg-black text-sm font-bold text-white">
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {item.product?.name ||
                                                        'Product'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    €
                                                    {(
                                                        Number(
                                                            item.product?.price,
                                                        ) || 0
                                                    ).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-white">
                                                {item.total_sold} sold
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="py-4 text-center text-gray-500">
                                    No sales data available yet
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                        Recent Orders
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Order ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Product
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recent_orders &&
                                stats.recent_orders.length > 0 ? (
                                    stats.recent_orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                #{order.unique_id || order.id}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {order.customer_full_name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {order.product_name ||
                                                    order.product?.name ||
                                                    'N/A'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-medium ${
                                                        order.status ===
                                                            'completed' ||
                                                        order.status ===
                                                            'delivered'
                                                            ? 'bg-black text-green-700'
                                                            : order.status ===
                                                                'pending'
                                                              ? 'bg-black text-yellow-700'
                                                              : order.status ===
                                                                      'processing' ||
                                                                  order.status ===
                                                                      'confirmed'
                                                                ? 'bg-black text-black'
                                                                : order.status ===
                                                                    'shipped'
                                                                  ? 'bg-black text-black'
                                                                  : 'bg-red-100 text-black'
                                                    }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                €
                                                {(
                                                    Number(
                                                        order.total_amount,
                                                    ) || 0
                                                ).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-8 text-center text-gray-500"
                                        >
                                            No orders yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sales Trend Chart */}
                <div className="border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                        Sales Trend (Last 7 Days)
                    </h3>
                    <div className="flex h-64 items-end justify-between gap-2">
                        {stats?.sales_trend && stats.sales_trend.length > 0 ? (
                            stats.sales_trend.map((day, index) => {
                                const maxSale = Math.max(
                                    ...stats.sales_trend.map(
                                        (d) => d.sales || 0,
                                    ),
                                    1,
                                );
                                const height =
                                    ((day.sales || 0) / maxSale) * 100;
                                return (
                                    <div
                                        key={index}
                                        className="flex flex-1 flex-col items-center gap-2"
                                    >
                                        <div className="relative flex h-48 w-full items-end justify-center">
                                            <div
                                                className="group relative w-full cursor-pointer bg-black transition-all hover:opacity-80"
                                                style={{
                                                    height: `${height}%`,
                                                    minHeight: '4px',
                                                }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform bg-black px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                                                    €
                                                    {(day.sales || 0).toFixed(
                                                        2,
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="mt-2 text-xs text-gray-600">
                                            {day.date}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex h-48 w-full items-center justify-center">
                                <p className="text-gray-500">
                                    No sales data available
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
