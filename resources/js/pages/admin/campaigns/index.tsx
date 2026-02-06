import { CampaignModal } from '@/components/admin/CampaignModal';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Calendar, Filter, Plus, Search, Tag, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Campaigns',
        href: '/admin/campaigns',
    },
];

interface Product {
    id: number;
    name: string;
    price: number;
    image?: string;
}

interface Campaign {
    id: number;
    name: string;
    description?: string;
    price: number;
    start_date: string;
    end_date: string;
    product_id: number;
    product?: Product;
    banner_image?: string;
    banner_color?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
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
    product_id?: string;
    is_active?: string;
    sort_by?: string;
    sort_order?: string;
}

interface CampaignsPageProps {
    campaigns: Campaign[];
    products: Product[];
    pagination?: Pagination;
    filters?: Filters;
}

export default function Campaigns({
    campaigns = [],
    products = [],
    pagination,
    filters = {},
}: CampaignsPageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedProduct, setSelectedProduct] = useState(
        filters.product_id || '',
    );
    const [selectedStatus, setSelectedStatus] = useState(
        filters.is_active || '',
    );

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(false);

    // Real-time filtering with debounce
    const getCurrentFilters = useCallback(() => {
        const filterParams: any = {};
        if (searchTerm) filterParams.search = searchTerm;
        if (selectedProduct) filterParams.product_id = selectedProduct;
        if (selectedStatus !== '') filterParams.is_active = selectedStatus;
        return filterParams;
    }, [searchTerm, selectedProduct, selectedStatus]);

    const applyFilters = useCallback(() => {
        router.get('/admin/campaigns', getCurrentFilters(), {
            preserveState: true,
            preserveScroll: true,
        });
    }, [getCurrentFilters]);

    // Debounced filtering effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            applyFilters();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [applyFilters]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedProduct('');
        setSelectedStatus('');
    };

    // CRUD Functions
    const handleCreateCampaign = () => {
        setSelectedCampaign(null);
        setShowCreateModal(true);
    };

    const handleEditCampaign = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setShowEditModal(true);
    };

    const handleDeleteCampaign = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedCampaign) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/campaigns/${selectedCampaign.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            if (response.ok) {
                setShowDeleteModal(false);
                setSelectedCampaign(null);
                toast.success('Campaign deleted successfully!');
                router.reload();
            } else {
                const data = await response.json();
                const errorMessage =
                    data.message || 'Failed to delete campaign';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Error deleting campaign:', error);
            toast.error('Network error occurred while deleting the campaign');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCampaignSaved = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedCampaign(null);
        router.reload();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const calculateDiscount = (originalPrice: number, salePrice: number) => {
        return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Campaigns" />

            {/* Main Container with proper spacing */}
            <div className="min-h-screen bg-white">
                <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="bg-black p-2 shadow-sm">
                                    <Tag className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">
                                        Campaigns
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Manage product campaigns and special
                                        offers
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleCreateCampaign}
                            className="inline-flex items-center gap-2 border-2 border-black bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-gray-100 hover:text-black focus:ring-1 focus:ring-black focus:ring-offset-2 focus:outline-none"
                        >
                            <Plus className="h-5 w-5" />
                            Create New Campaign
                        </button>
                    </div>

                    {/* Smart Filters Section */}
                    <div className="mb-6 overflow-hidden border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="border border-gray-300 bg-white p-2 shadow-sm">
                                        <Filter className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">
                                        Smart Filters
                                    </h3>
                                </div>
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-200 hover:text-gray-900"
                                >
                                    <X className="h-3 w-3" />
                                    Clear All
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {/* Search */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold tracking-wide text-gray-700">
                                        Search Campaigns
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            placeholder="Type to search..."
                                            className="w-full border-2 border-gray-200 bg-gray-50/50 py-2.5 pr-3 pl-10 text-sm font-medium transition-all duration-300 focus:border-gray-300 focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Products */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold tracking-wide text-gray-700">
                                        Product
                                    </label>
                                    <select
                                        value={selectedProduct}
                                        onChange={(e) =>
                                            setSelectedProduct(e.target.value)
                                        }
                                        className="w-full border-2 border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium transition-all duration-300 focus:border-gray-300 focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                                    >
                                        <option value="">All Products</option>
                                        {products.map((product) => (
                                            <option
                                                key={product.id}
                                                value={product.id}
                                            >
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Active Status */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold tracking-wide text-gray-700">
                                        Status
                                    </label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) =>
                                            setSelectedStatus(e.target.value)
                                        }
                                        className="w-full border-2 border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium transition-all duration-300 focus:border-gray-300 focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                                    >
                                        <option value="">All Status</option>
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Campaigns Table Section */}
                    <div className="overflow-hidden border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-black p-2 shadow-sm">
                                        <Tag className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">
                                        Campaign List (
                                        {pagination?.total || campaigns.length}{' '}
                                        items)
                                    </h3>
                                </div>
                                <div className="text-xs font-medium text-gray-600">
                                    Showing {pagination?.from || 0} to{' '}
                                    {pagination?.to || 0} of{' '}
                                    {pagination?.total || campaigns.length}{' '}
                                    campaigns
                                </div>
                            </div>
                        </div>

                        {campaigns.length > 0 ? (
                            <>
                                {/* Desktop Table View - Hidden on mobile */}
                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                    Campaign
                                                </th>
                                                <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                    Product
                                                </th>
                                                <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                    Prices
                                                </th>
                                                <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                    Duration
                                                </th>
                                                <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                    Status
                                                </th>
                                                <th className="w-48 px-4 py-4 text-right text-xs font-bold tracking-wider text-gray-700 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {campaigns.map(
                                                (campaign, index) => {
                                                    const discount =
                                                        campaign.product
                                                            ? calculateDiscount(
                                                                  Number(
                                                                      campaign
                                                                          .product
                                                                          .price,
                                                                  ) || 0,
                                                                  Number(
                                                                      campaign.price,
                                                                  ) || 0,
                                                              )
                                                            : 0;

                                                    return (
                                                        <tr
                                                            key={campaign.id}
                                                            className="transition-all duration-200 hover:bg-gray-50"
                                                        >
                                                            <td className="px-4 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div
                                                                        className="h-12 w-12 flex-shrink-0 shadow-sm"
                                                                        style={{
                                                                            backgroundColor:
                                                                                campaign.banner_color ||
                                                                                '#ef4444',
                                                                        }}
                                                                    >
                                                                        <div className="flex h-full items-center justify-center">
                                                                            <Tag className="h-6 w-6 text-white" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="max-w-xs">
                                                                        <div className="truncate text-sm font-bold text-gray-900">
                                                                            {
                                                                                campaign.name
                                                                            }
                                                                        </div>
                                                                        {campaign.description && (
                                                                            <div className="truncate text-xs text-gray-600">
                                                                                {
                                                                                    campaign.description
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                {campaign.product ? (
                                                                    <div className="text-sm">
                                                                        <div className="font-semibold text-gray-900">
                                                                            {
                                                                                campaign
                                                                                    .product
                                                                                    .name
                                                                            }
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            ID:{' '}
                                                                            {
                                                                                campaign
                                                                                    .product
                                                                                    .id
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-gray-400">
                                                                        N/A
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-bold text-white">
                                                                            $
                                                                            {(
                                                                                Number(
                                                                                    campaign.price,
                                                                                ) ||
                                                                                0
                                                                            ).toFixed(
                                                                                2,
                                                                            )}
                                                                        </span>
                                                                        {campaign.product && (
                                                                            <span className="bg-red-100 px-2 py-0.5 text-xs font-bold text-black">
                                                                                -
                                                                                {
                                                                                    discount
                                                                                }

                                                                                %
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {campaign.product && (
                                                                        <div className="text-xs text-gray-500 line-through">
                                                                            $
                                                                            {(
                                                                                Number(
                                                                                    campaign
                                                                                        .product
                                                                                        ?.price,
                                                                                ) ||
                                                                                0
                                                                            ).toFixed(
                                                                                2,
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                                        <Calendar className="h-3.5 w-3.5" />
                                                                        <span>
                                                                            {formatDate(
                                                                                campaign.start_date,
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                                        <Calendar className="h-3.5 w-3.5" />
                                                                        <span>
                                                                            {formatDate(
                                                                                campaign.end_date,
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                {campaign.is_active ? (
                                                                    <span className="inline-flex bg-black px-3 py-1 text-xs font-semibold text-green-800">
                                                                        Active
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
                                                                        Inactive
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            handleEditCampaign(
                                                                                campaign,
                                                                            )
                                                                        }
                                                                        className="border border-black bg-white px-4 py-2 text-xs font-semibold text-black transition-all duration-200 hover:bg-black hover:text-white focus:ring-1 focus:ring-black focus:outline-none"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleDeleteCampaign(
                                                                                campaign,
                                                                            )
                                                                        }
                                                                        className="bg-black px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:shadow-sm focus:ring-1 focus:ring-black focus:outline-none"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                },
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View - Visible on mobile only */}
                                <div className="grid gap-6 p-6 lg:hidden">
                                    {campaigns.map((campaign) => {
                                        const discount = campaign.product
                                            ? calculateDiscount(
                                                  Number(
                                                      campaign.product.price,
                                                  ) || 0,
                                                  Number(campaign.price) || 0,
                                              )
                                            : 0;

                                        return (
                                            <div
                                                key={campaign.id}
                                                className="overflow-hidden border border-black bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                                            >
                                                {/* Campaign Header */}
                                                <div
                                                    className="border-b border-gray-200 p-4"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${campaign.banner_color || '#ef4444'} 0%, ${campaign.banner_color || '#ef4444'}dd 100%)`,
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-white/20 p-2.5 backdrop-blur-sm">
                                                                <Tag className="h-6 w-6 text-white" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-base font-bold text-white">
                                                                    {
                                                                        campaign.name
                                                                    }
                                                                </h3>
                                                                {campaign.description && (
                                                                    <p className="mt-0.5 text-xs text-white/90">
                                                                        {
                                                                            campaign.description
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {campaign.is_active ? (
                                                            <span className="inline-flex bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex bg-gray-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Campaign Details */}
                                                <div className="space-y-4 p-4">
                                                    {/* Product Info */}
                                                    <div className="border border-black bg-white p-3">
                                                        <div className="mb-1 text-xs font-semibold text-gray-500 uppercase">
                                                            Product
                                                        </div>
                                                        {campaign.product ? (
                                                            <div>
                                                                <div className="text-sm font-bold text-gray-900">
                                                                    {
                                                                        campaign
                                                                            .product
                                                                            .name
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-gray-600">
                                                                    ID:{' '}
                                                                    {
                                                                        campaign
                                                                            .product
                                                                            .id
                                                                    }
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-gray-500">
                                                                No product
                                                                assigned
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Price Info */}
                                                    <div className="border border-black bg-white p-3">
                                                        <div className="mb-1 text-xs font-semibold text-gray-500 uppercase">
                                                            Pricing
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-bold text-white">
                                                                $
                                                                {(
                                                                    Number(
                                                                        campaign.price,
                                                                    ) || 0
                                                                ).toFixed(2)}
                                                            </span>
                                                            {campaign.product && (
                                                                <>
                                                                    <span className="bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                                                                        -
                                                                        {
                                                                            discount
                                                                        }
                                                                        %
                                                                    </span>
                                                                    <span className="text-sm text-gray-500 line-through">
                                                                        $
                                                                        {(
                                                                            Number(
                                                                                campaign
                                                                                    .product
                                                                                    ?.price,
                                                                            ) ||
                                                                            0
                                                                        ).toFixed(
                                                                            2,
                                                                        )}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Date Range */}
                                                    <div className="border border-black bg-white p-3">
                                                        <div className="mb-2 text-xs font-semibold text-gray-500 uppercase">
                                                            Duration
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Calendar className="h-4 w-4 text-black" />
                                                                <span className="font-medium text-gray-700">
                                                                    Start:
                                                                </span>
                                                                <span className="text-gray-900">
                                                                    {formatDate(
                                                                        campaign.start_date,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Calendar className="h-4 w-4 text-black" />
                                                                <span className="font-medium text-gray-700">
                                                                    End:
                                                                </span>
                                                                <span className="text-gray-900">
                                                                    {formatDate(
                                                                        campaign.end_date,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card Actions */}
                                                <div className="border-t border-gray-200 bg-gray-50 p-4">
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() =>
                                                                handleEditCampaign(
                                                                    campaign,
                                                                )
                                                            }
                                                            className="flex-1 border border-black bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition-all duration-200 hover:bg-black hover:text-white focus:ring-1 focus:ring-black focus:outline-none"
                                                        >
                                                            Edit Campaign
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteCampaign(
                                                                    campaign,
                                                                )
                                                            }
                                                            className="flex-1 bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-sm focus:ring-1 focus:ring-black focus:outline-none"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 bg-black p-4">
                                    <Tag className="h-10 w-10 text-white" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-gray-900">
                                    No campaigns found
                                </h3>
                                <p className="mb-6 max-w-md text-sm text-gray-600">
                                    {Object.keys(filters).length > 0
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'Get started by creating your first campaign to boost sales.'}
                                </p>
                                <button
                                    onClick={handleCreateCampaign}
                                    className="inline-flex items-center gap-2 border-2 border-black bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-gray-100 hover:text-black focus:ring-1 focus:ring-black focus:ring-offset-2 focus:outline-none"
                                >
                                    <Plus className="h-5 w-5" />
                                    Create First Campaign
                                </button>
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
                                    <div className="flex items-center gap-1.5">
                                        {pagination.current_page > 1 && (
                                            <button
                                                onClick={() =>
                                                    router.get(
                                                        '/admin/campaigns',
                                                        {
                                                            ...getCurrentFilters(),
                                                            page:
                                                                pagination.current_page -
                                                                1,
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
                                                        '/admin/campaigns',
                                                        {
                                                            ...getCurrentFilters(),
                                                            page,
                                                        },
                                                    )
                                                }
                                                className={`relative inline-flex items-center border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                                                    page ===
                                                    pagination.current_page
                                                        ? 'border-black bg-black text-white shadow-sm'
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
                                                        '/admin/campaigns',
                                                        {
                                                            ...getCurrentFilters(),
                                                            page:
                                                                pagination.current_page +
                                                                1,
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

            {/* Campaign Modal */}
            <CampaignModal
                isOpen={showCreateModal || showEditModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedCampaign(null);
                }}
                campaign={selectedCampaign}
                products={products}
                onSave={handleCampaignSaved}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedCampaign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden border-2 border-black bg-white shadow-sm">
                        <div className="bg-black px-8 py-6">
                            <h3 className="text-xl font-bold text-white">
                                Confirm Deletion
                            </h3>
                        </div>
                        <div className="p-8">
                            <div className="mb-8 flex items-center gap-4">
                                <div className="bg-red-100 p-4">
                                    <Tag className="h-8 w-8 text-black" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        Delete "{selectedCampaign.name}"?
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedCampaign(null);
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
                                    {isLoading
                                        ? 'Deleting...'
                                        : 'Delete Campaign'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
