import {
    QueryClient,
    QueryClientProvider,
    useInfiniteQuery,
    useQuery,
} from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { BannerCarousel } from '../components/BannerCarousel';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModalSimple';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { HorizontalFilters } from '../components/HorizontalFilters';
import { MultiOrderSuccessModal } from '../components/MultiOrderSuccessModal';
import { OrderSuccessModal } from '../components/OrderSuccessModal';
import { ProductGrid } from '../components/ProductGrid';
import { QuickView } from '../components/QuickView';
import { useDebounce } from '../hooks/useDebounce';
import { useURLFilters } from '../hooks/useURLFilters';
import { useCheckoutStore } from '../store/checkoutStore';
import type {
    Category,
    Filters,
    PaginatedResponse,
    Product,
} from '../types/store';

// Props interface for SSR data
interface WelcomeProps {
    initialProducts?: PaginatedResponse<any>;
    categories?: Category[];
    campaigns?: any[];
}

// Fetch active campaigns
const fetchActiveCampaigns = async (): Promise<any[]> => {
    try {
        const response = await fetch('/api/campaigns/active');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return [];
    }
};

// Real API functions to fetch data from your Laravel backend
const fetchProducts = async (
    page: number,
    filters: Filters,
): Promise<PaginatedResponse<Product>> => {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
    });

    if (filters.search) {
        params.append('search', filters.search);
    }
    if (filters.categories.length > 0) {
        filters.categories.forEach((categoryId) => {
            params.append('category[]', categoryId.toString());
        });
    }
    if (filters.priceMin > 0) {
        params.append('price_min', filters.priceMin.toString());
    }
    if (filters.priceMax < 1000) {
        params.append('price_max', filters.priceMax.toString());
    }
    if (filters.gender && filters.gender.length > 0) {
        filters.gender.forEach((gender) => {
            params.append('gender[]', gender);
        });
    }
    if (filters.sortBy) {
        params.append('sort_by', filters.sortBy);
    }

    try {
        const response = await fetch(`/api/products?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Since the API now returns Laravel pagination object directly,
        // the products are in data.data
        return {
            data: data.data.map((product: any) => ({
                id: product.id,
                name: product.name,
                description: product.description,
                price: parseFloat(product.campaign_price || product.price), // Use campaign price if available
                originalPrice: product.campaign_price
                    ? parseFloat(product.price)
                    : undefined, // Store original price if on campaign
                image:
                    product.image_url ||
                    product.image ||
                    `https://picsum.photos/seed/${product.id}/400/400`, // Use image_url from Media Library
                all_images: product.all_images || [], // Multiple images for gallery
                stock: product.stock || 0,
                foot_numbers: product.foot_numbers, // Added missing foot_numbers field
                sizeStocks: product.sizeStocks || {}, // Size-specific stock quantities
                color: product.color, // Also added color field for completeness
                gender: product.gender || 'unisex', // Added gender field
                categories: product.category ? [product.category] : [],
                created_at: product.created_at,
                hasActiveCampaign: !!product.campaign_price, // Flag to show campaign badge
            })),
            current_page: data.current_page,
            last_page: data.last_page,
            per_page: data.per_page,
            total: data.total,
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to empty results if API fails
        return {
            data: [],
            current_page: page,
            last_page: 1,
            per_page: 20,
            total: 0,
        };
    }
};

const fetchCategories = async (): Promise<Category[]> => {
    try {
        const response = await fetch('/api/categories');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return data.data.map((category: any) => ({
            id: category.id,
            name: category.name,
            slug: category.name.toLowerCase().replace(/\s+/g, '-'),
        }));
    } catch (error) {
        console.error('Error fetching categories:', error);

        return [
            { id: 1, name: 'Running', slug: 'running' },
            { id: 2, name: 'Casual', slug: 'casual' },
            { id: 3, name: 'Formal', slug: 'formal' },
            { id: 4, name: 'Sports', slug: 'sports' },
        ];
    }
};

/**
 * Main storefront component with all optimizations
 */
function StorefrontContent({
    initialProducts,
    categories: ssrCategories = [],
    campaigns: ssrCampaigns = [],
}: WelcomeProps) {
    const { filters, updateFilters, clearFilters, hasActiveFilters } =
        useURLFilters();
    const [searchInput, setSearchInput] = useState(filters.search);
    const debouncedSearch = useDebounce(searchInput, 300);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
        null,
    );

    const {
        isOpen: isCheckoutOpen,
        items: checkoutItems,
        closeCheckout,
        isSuccessOpen,
        successOrder,
        closeSuccess,
        isMultiSuccessOpen,
        successOrders,
        totalAmount,
        closeMultiSuccess,
    } = useCheckoutStore();

    // Update filters when debounced search changes
    useMemo(() => {
        if (debouncedSearch !== filters.search) {
            updateFilters({ search: debouncedSearch });
        }
    }, [debouncedSearch]);

    // Fetch categories - use SSR data as initial
    const { data: categories = ssrCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        staleTime: Infinity,
        gcTime: Infinity,
        initialData: ssrCategories.length > 0 ? ssrCategories : undefined,
    });

    // Fetch active campaigns - use SSR data as initial
    const { data: campaigns = ssrCampaigns } = useQuery({
        queryKey: ['campaigns'],
        queryFn: fetchActiveCampaigns,
        staleTime: 60000, // 1 minute
        gcTime: 300000, // 5 minutes
        initialData: ssrCampaigns.length > 0 ? ssrCampaigns : undefined,
    });

    // Check if we have any active filters
    const hasFilters =
        filters.search ||
        filters.categories.length > 0 ||
        filters.priceMin > 0 ||
        filters.priceMax < 1000 ||
        (filters.gender && filters.gender.length > 0) ||
        filters.sortBy !== 'newest';

    // Fetch products with infinite scroll - use SSR data for initial page
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useInfiniteQuery({
            queryKey: ['products', filters],
            queryFn: ({ pageParam = 1 }) => fetchProducts(pageParam, filters),
            getNextPageParam: (lastPage) =>
                lastPage.current_page < lastPage.last_page
                    ? lastPage.current_page + 1
                    : undefined,
            initialPageParam: 1,
            staleTime: 30000, // 30 seconds
            gcTime: 300000, // 5 minutes
            // Use SSR data only if no filters are applied and we have initial data
            initialData:
                !hasFilters && initialProducts
                    ? {
                          pages: [
                              {
                                  data: initialProducts.data.map(
                                      (product: any) => ({
                                          id: product.id,
                                          name: product.name,
                                          description: product.description,
                                          price: parseFloat(
                                              product.campaign_price ||
                                                  product.price,
                                          ),
                                          originalPrice: product.campaign_price
                                              ? parseFloat(product.price)
                                              : undefined,
                                          image:
                                              product.image_url ||
                                              product.image ||
                                              `https://picsum.photos/seed/${product.id}/400/400`,
                                          all_images: product.all_images || [],
                                          stock: product.stock_quantity || 0,
                                          foot_numbers: product.foot_numbers,
                                          sizeStocks: product.sizeStocks || {},
                                          color: product.color,
                                          gender: product.gender || 'unisex',
                                          categories: product.category
                                              ? [product.category]
                                              : [],
                                          created_at: product.created_at,
                                          hasActiveCampaign:
                                              !!product.campaign_price,
                                      }),
                                  ),
                                  current_page: initialProducts.current_page,
                                  last_page: initialProducts.last_page,
                                  per_page: initialProducts.per_page,
                                  total: initialProducts.total,
                              },
                          ],
                          pageParams: [1],
                      }
                    : undefined,
        });

    const products = useMemo(() => {
        const regularProducts = data?.pages.flatMap((page) => page.data) ?? [];

        // Convert campaign products to Product type and add to the beginning
        const campaignProducts: Product[] = campaigns
            .filter((campaign: any) => campaign.product) // Only include campaigns with a product
            .map((campaign: any) => {
                const raw = campaign.product || {};

                // Normalize sizeStocks: prefer already structured `sizeStocks`,
                // otherwise transform `size_stocks` (snake_case array) into the expected object.
                let normalizedSizeStocks: Record<string, any> =
                    raw.sizeStocks || {};

                if (
                    (!normalizedSizeStocks ||
                        Object.keys(normalizedSizeStocks).length === 0) &&
                    raw.size_stocks &&
                    Array.isArray(raw.size_stocks)
                ) {
                    normalizedSizeStocks = raw.size_stocks.reduce(
                        (acc: Record<string, any>, s: any) => {
                            const sizeKey = String(s.size);
                            acc[sizeKey] = {
                                quantity: s.quantity,
                                stock_status:
                                    s.quantity === 0
                                        ? 'out of stock'
                                        : s.quantity <= 10
                                          ? 'low stock'
                                          : 'in stock',
                            };
                            return acc;
                        },
                        {},
                    );
                }

                return {
                    id: raw.id,
                    name: raw.name,
                    description: raw.description,
                    price: parseFloat(campaign.price), // Campaign discounted price
                    originalPrice: parseFloat(raw.price), // Original product price
                    image:
                        raw.image_url ||
                        raw.image ||
                        `https://picsum.photos/seed/${raw.id}/400/400`,
                    all_images: raw.all_images || [],
                    stock: raw.stock || 0,
                    foot_numbers: raw.foot_numbers,
                    sizeStocks: normalizedSizeStocks, // Normalized size-specific stock quantities
                    color: raw.color,
                    gender: raw.gender || 'unisex',
                    categories: raw.category ? [raw.category] : [],
                    created_at: raw.created_at,
                    hasActiveCampaign: true,
                    campaign_id: campaign.id,
                    campaign_name: campaign.name,
                    campaign_end_date: campaign.end_date,
                } as Product;
            });

        // Remove duplicates (if a campaign product is also in regular products)
        const campaignProductIds = new Set(campaignProducts.map((p) => p.id));
        const filteredRegularProducts = regularProducts.filter(
            (p) => !campaignProductIds.has(p.id),
        );

        // Return campaign products first, then regular products
        return [...campaignProducts, ...filteredRegularProducts];
    }, [data, campaigns]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchInput(value);
    }, []);

    const handleQuickView = useCallback((product: Product) => {
        setQuickViewProduct(product);
    }, []);

    const handleCloseQuickView = useCallback(() => {
        setQuickViewProduct(null);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <Header
                searchValue={searchInput}
                onSearchChange={handleSearchChange}
            />

            {/* Full Width Banner */}
            <BannerCarousel />

            {/* Sticky Horizontal Filter Bar */}
            <HorizontalFilters
                filters={filters}
                categories={categories}
                onFilterChange={updateFilters}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
            />

            {/* Full Width Product Grid */}
            <main className="w-full">
                <ProductGrid
                    products={products}
                    isLoading={isLoading}
                    hasNextPage={hasNextPage ?? false}
                    fetchNextPage={fetchNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    onQuickView={handleQuickView}
                />
            </main>

            {/* Footer */}
            <Footer />

            {/* Cart Drawer */}
            <CartDrawer />

            {/* Quick View Modal */}
            <QuickView
                product={quickViewProduct}
                onClose={handleCloseQuickView}
            />

            {/* Checkout Modal */}
            {checkoutItems.length > 0 && (
                <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={closeCheckout}
                />
            )}

            {/* Order Success Modal */}
            {successOrder && (
                <OrderSuccessModal
                    isOpen={isSuccessOpen}
                    onClose={closeSuccess}
                    order={successOrder}
                />
            )}

            {/* Multi-Order Success Modal */}
            {successOrders.length > 0 && (
                <MultiOrderSuccessModal
                    isOpen={isMultiSuccessOpen}
                    onClose={closeMultiSuccess}
                    orders={successOrders}
                    totalAmount={totalAmount}
                />
            )}
        </div>
    );
}

// Initialize React Query client with optimizations
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30000,
        },
    },
});

/**
 * Root component with React Query provider
 */
export default function Welcome({
    initialProducts,
    categories,
    campaigns,
}: WelcomeProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <StorefrontContent
                initialProducts={initialProducts}
                categories={categories}
                campaigns={campaigns}
            />
        </QueryClientProvider>
    );
}
