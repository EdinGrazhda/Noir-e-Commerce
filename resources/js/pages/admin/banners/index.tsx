import { BannerModal } from '@/components/admin/BannerModal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Image as ImageIcon,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Banners',
        href: '/admin/banners',
    },
];

interface Banner {
    id: number;
    header: string;
    description?: string;
    image_url?: string;
    has_image: boolean;
    created_at: string;
    updated_at: string;
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
    sort_by?: string;
    sort_order?: string;
}

interface BannersPageProps {
    banners: Banner[];
    pagination?: Pagination;
    filters?: Filters;
}

export default function Banners({
    banners = [],
    pagination,
    filters = {},
}: BannersPageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Real-time filtering with debounce
    const getCurrentFilters = useCallback(() => {
        const filterParams: any = {};
        if (searchTerm) filterParams.search = searchTerm;
        return filterParams;
    }, [searchTerm]);

    const applyFilters = useCallback(() => {
        router.get('/admin/banners', getCurrentFilters(), {
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
    };

    // CRUD Functions
    const handleCreateBanner = () => {
        setSelectedBanner(null);
        setShowCreateModal(true);
    };

    const handleEditBanner = (banner: Banner) => {
        setSelectedBanner(banner);
        setShowEditModal(true);
    };

    const handleDeleteBanner = (banner: Banner) => {
        setSelectedBanner(banner);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedBanner) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/banners/${selectedBanner.id}`, {
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
                setSelectedBanner(null);
                toast.success('Banner deleted successfully!');
                router.visit('/admin/banners', {
                    preserveState: false,
                    preserveScroll: true,
                });
            } else {
                const data = await response.json();
                const errorMessage = data.message || 'Failed to delete banner';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Error deleting banner:', error);
            toast.error('Network error occurred while deleting the banner');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBannerSaved = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedBanner(null);
        router.visit('/admin/banners', {
            preserveState: false,
            preserveScroll: true,
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Banners" />

            {/* Main Container with proper spacing */}
            <div className="min-h-screen bg-white">
                <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="border border-gray-300 bg-white p-2 shadow-sm">
                                    <ImageIcon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">
                                        Banners
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Manage homepage banners and promotional
                                        content
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleCreateBanner}
                            className="inline-flex items-center gap-2 border-2 border-black bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-gray-100 hover:text-black focus:ring-1 focus:ring-black focus:ring-offset-2 focus:outline-none"
                        >
                            <Plus className="h-5 w-5" />
                            Create New Banner
                        </button>
                    </div>

                    {/* Smart Filters Section */}
                    <div className="mb-6 overflow-hidden border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Search className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm font-semibold text-gray-700">
                                        Smart Filters
                                    </span>
                                    <span className="bg-black px-2 py-1 text-xs font-bold text-black">
                                        {banners.length} banners
                                    </span>
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
                            <div className="grid grid-cols-1 gap-6">
                                {/* Search Input */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Search Banners
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            placeholder="Search by header or description..."
                                            className="w-full border-2 border-gray-300 bg-gray-50 px-12 py-3 text-sm font-medium text-gray-900 transition-all duration-200 placeholder:text-gray-500 focus:border-gray-300 focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Banners Table Section */}
                    <div className="overflow-hidden border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ImageIcon className="h-5 w-5 text-gray-600" />
                                    <span className="text-sm font-semibold text-gray-700">
                                        All Banners
                                    </span>
                                    <span className="bg-black px-3 py-1 text-xs font-bold text-black">
                                        {banners.length} total
                                    </span>
                                </div>
                                <div className="text-xs font-medium text-gray-600">
                                    Showing {pagination?.from || 0} to{' '}
                                    {pagination?.to || banners.length} of{' '}
                                    {pagination?.total || banners.length}{' '}
                                    banners
                                </div>
                            </div>
                        </div>

                        {banners.length > 0 ? (
                            <>
                                {/* Desktop Table View - Hidden on mobile */}
                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                                    Banner
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                                    Content
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                                    Created
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {banners.map((banner) => (
                                                <tr
                                                    key={banner.id}
                                                    className="transition-all duration-200 hover:bg-blue-50/50"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative h-16 w-24 overflow-hidden bg-gray-100">
                                                                {banner.has_image &&
                                                                banner.image_url ? (
                                                                    <img
                                                                        key={`banner-${banner.id}-${banner.image_url}`}
                                                                        src={
                                                                            banner.image_url
                                                                        }
                                                                        alt={
                                                                            banner.header ||
                                                                            'Banner image'
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                        loading="lazy"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center">
                                                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-gray-900">
                                                                    {
                                                                        banner.header
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    ID:{' '}
                                                                    {banner.id}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="max-w-sm">
                                                            <p className="truncate text-sm text-gray-600">
                                                                {banner.description ||
                                                                    'No description'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-600">
                                                            {formatDate(
                                                                banner.created_at,
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleEditBanner(
                                                                        banner,
                                                                    )
                                                                }
                                                                className="bg-black p-2 text-black transition-all duration-200 hover:scale-110 hover:bg-blue-200"
                                                                title="Edit banner"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteBanner(
                                                                        banner,
                                                                    )
                                                                }
                                                                className="bg-red-100 p-2 text-black transition-all duration-200 hover:scale-110 hover:bg-red-200"
                                                                title="Delete banner"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View - Visible on mobile only */}
                                <div className="grid gap-6 p-6 lg:hidden">
                                    {banners.map((banner) => (
                                        <div
                                            key={banner.id}
                                            className="overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-sm"
                                        >
                                            {/* Banner Image */}
                                            {banner.has_image &&
                                            banner.image_url ? (
                                                <div className="relative h-48 overflow-hidden">
                                                    <img
                                                        src={banner.image_url}
                                                        alt={banner.header}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            console.error(
                                                                'Error loading image:',
                                                                banner.image_url,
                                                            );
                                                            e.currentTarget.style.display =
                                                                'none';
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-48 items-center justify-center bg-gray-100">
                                                    <ImageIcon className="h-12 w-12 text-gray-400" />
                                                </div>
                                            )}

                                            <div className="p-6">
                                                {/* Header */}
                                                <div className="mb-4">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {banner.header}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {banner.description ||
                                                            'No description'}
                                                    </p>
                                                </div>

                                                {/* Meta Info */}
                                                <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
                                                    <span>ID: {banner.id}</span>
                                                    <span>
                                                        Created:{' '}
                                                        {formatDate(
                                                            banner.created_at,
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() =>
                                                            handleEditBanner(
                                                                banner,
                                                            )
                                                        }
                                                        className="flex-1 bg-black px-4 py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-blue-200"
                                                    >
                                                        <Pencil className="mx-auto h-4 w-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteBanner(
                                                                banner,
                                                            )
                                                        }
                                                        className="flex-1 bg-red-100 px-4 py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-red-200"
                                                    >
                                                        <Trash2 className="mx-auto h-4 w-4" />
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
                                <div className="mb-4 bg-black p-4">
                                    <ImageIcon className="h-10 w-10 text-black" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-gray-900">
                                    No banners found
                                </h3>
                                <p className="mb-6 max-w-md text-sm text-gray-600">
                                    Get started by creating your first banner
                                    for the homepage. Banners are great for
                                    promotions and featured content.
                                </p>
                                <button
                                    onClick={handleCreateBanner}
                                    className="inline-flex items-center gap-2 border-2 border-black bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-gray-100 hover:text-black focus:ring-1 focus:ring-black focus:ring-offset-2 focus:outline-none"
                                >
                                    <Plus className="h-5 w-5" />
                                    Create First Banner
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination && pagination.last_page > 1 && (
                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing {pagination.from} to{' '}
                                        {pagination.to} of {pagination.total}{' '}
                                        results
                                    </div>
                                    <div className="flex gap-2">
                                        {Array.from(
                                            { length: pagination.last_page },
                                            (_, i) => i + 1,
                                        ).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() =>
                                                    router.get(
                                                        '/admin/banners',
                                                        {
                                                            ...getCurrentFilters(),
                                                            page,
                                                        },
                                                    )
                                                }
                                                className={`px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                                                    page ===
                                                    pagination.current_page
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Banner Modal */}
            <BannerModal
                isOpen={showCreateModal || showEditModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedBanner(null);
                }}
                banner={selectedBanner}
                onSave={handleBannerSaved}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedBanner && (
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
                                    <ImageIcon className="h-8 w-8 text-black" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        Delete "{selectedBanner.header}"?
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
                                        setSelectedBanner(null);
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
                                        : 'Delete Banner'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
