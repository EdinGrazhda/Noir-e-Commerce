import { memo, useCallback, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useImagePreloader } from '../hooks/useImageCache';
import type { Product } from '../types/store';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from './Skeletons';

interface ProductGridProps {
    products: Product[];
    isLoading: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    isFetchingNextPage: boolean;
    onQuickView: (product: Product) => void;
}

const PRIORITY_COUNT = 8; // Load first 8 images with high priority

/**
 * Optimized product grid with infinite scroll and IntersectionObserver
 * Handles 1000+ products smoothly with windowing and lazy loading
 */
export const ProductGrid = memo(
    ({
        products,
        isLoading,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        onQuickView,
    }: ProductGridProps) => {
        const { ref: loadMoreRef, inView } = useInView({
            threshold: 0.1,
            rootMargin: '400px',
        });

        const handleQuickView = useCallback(
            (product: Product) => {
                onQuickView(product);
            },
            [onQuickView],
        );

        // Preload images for upcoming products
        const upcomingImageUrls = useMemo(() => {
            return products
                .slice(PRIORITY_COUNT, PRIORITY_COUNT + 12)
                .map((p) => p.image);
        }, [products]);

        useImagePreloader(upcomingImageUrls);

        // Trigger next page load when sentinel is in view
        useEffect(() => {
            if (inView && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

        // Show skeleton on initial load
        if (isLoading && products.length === 0) {
            return (
                <div className="px-4 py-8 sm:px-6 lg:px-8">
                    <ProductGridSkeleton count={20} />
                </div>
            );
        }

        // No products found
        if (!isLoading && products.length === 0) {
            return (
                <div className="px-4 py-24 sm:px-6 lg:px-8">
                    <div className="group mx-auto max-w-2xl text-center">
                        {/* Animated Icon */}
                        <div className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center">
                            <div className="absolute inset-0 animate-pulse rounded-full border-4 border-black opacity-20" />
                            <div className="absolute inset-4 animate-pulse rounded-full border-2 border-black opacity-40 animation-delay-150" />
                            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-black bg-white shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                                <svg
                                    className="h-12 w-12 text-black transition-transform duration-300 group-hover:scale-110"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Text Content */}
                        <h2 className="mb-3 text-4xl font-black uppercase tracking-tight text-black">
                            NO PRODUCTS FOUND
                        </h2>
                        <div className="mx-auto mb-6 h-1 w-24 bg-black" />
                        <p className="mb-8 text-lg text-gray-700">
                            We couldn't find any items matching your criteria.<br />
                            Try adjusting your filters or exploring different categories.
                        </p>
                        
                        {/* Action Button */}
                        <button
                            onClick={() => window.location.href = '/'}
                            className="group inline-flex items-center gap-3 border-2 border-black bg-black px-8 py-4 font-bold uppercase tracking-wide text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white hover:text-black hover:shadow-2xl active:scale-95"
                        >
                            <span>Explore All Products</span>
                            <svg
                                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div id="products" className="px-4 py-8 sm:px-6 lg:px-8">
                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        Showing{' '}
                        <span className="font-semibold text-gray-900">
                            {products.length}
                        </span>{' '}
                        products
                    </p>
                </div>

                {/* Product Grid */}
                <div
                    className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                    role="list"
                    aria-label="Product list"
                >
                    {products.map((product, index) => (
                        <div key={product.id} role="listitem">
                            <ProductCard
                                product={product}
                                onQuickView={handleQuickView}
                                priority={index < PRIORITY_COUNT}
                            />
                        </div>
                    ))}
                </div>

                {/* Loading More Indicator */}
                {hasNextPage && (
                    <div
                        ref={loadMoreRef}
                        className="mt-12 flex justify-center"
                    >
                        {isFetchingNextPage ? (
                            <div className="flex items-center gap-3 text-[#771E49]">
                                <div className="h-6 w-6 animate-spin rounded-full border-3 border-[#771E49] border-t-transparent" />
                                <span className="font-medium">
                                    Loading more products...
                                </span>
                            </div>
                        ) : (
                            <div className="h-20" aria-hidden="true" />
                        )}
                    </div>
                )}

                {/* End of Results */}
                {!hasNextPage && products.length > 0 && (
                    <div className="mt-12 text-center">
                        <p className="text-sm text-gray-500">
                            You've reached the end of the catalog
                        </p>
                    </div>
                )}
            </div>
        );
    },
);

ProductGrid.displayName = 'ProductGrid';
