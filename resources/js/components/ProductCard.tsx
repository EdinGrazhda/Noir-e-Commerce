import { Clock, Eye, Tag } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useImageCache } from '../hooks/useImageCache';
import type { Product } from '../types/store';

interface ProductCardProps {
    product: Product;
    onQuickView?: (product: Product) => void;
    priority?: boolean; // Load image with high priority (for first visible products)
}

/**
 * Optimized product card with lazy-loaded images and memoization
 * Shows image, title, price, stock badge, and Add to Cart button
 */
export const ProductCard = memo(
    ({ product, onQuickView, priority = false }: ProductCardProps) => {
        const { isLoaded: imageLoaded, cachedUrl } = useImageCache(
            product.image,
            priority,
        );
        const [timeRemaining, setTimeRemaining] = useState<{
            days: number;
            hours: number;
            minutes: number;
            seconds: number;
        } | null>(null);

        // Calculate countdown timer for campaign
        useEffect(() => {
            if (!product.campaign_end_date) {
                setTimeRemaining(null);
                return;
            }

            const calculateTimeRemaining = () => {
                const now = new Date().getTime();
                const end = new Date(product.campaign_end_date!).getTime();
                const distance = end - now;

                if (distance < 0) {
                    setTimeRemaining(null);
                    return;
                }

                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor(
                    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
                );
                const minutes = Math.floor(
                    (distance % (1000 * 60 * 60)) / (1000 * 60),
                );
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                setTimeRemaining({ days, hours, minutes, seconds });
            };

            calculateTimeRemaining();
            const interval = setInterval(calculateTimeRemaining, 1000);

            return () => clearInterval(interval);
        }, [product.campaign_end_date]);

        const handleShowDetails = useCallback(
            (e: React.MouseEvent) => {
                e.stopPropagation();
                onQuickView?.(product);
            },
            [onQuickView, product],
        );

        const handleQuickView = useCallback(() => {
            onQuickView?.(product);
        }, [onQuickView, product]);

        const isLowStock = product.stock === 'low stock';
        const isOutOfStock = product.stock === 'out of stock';

        // Parse available sizes and check stock
        const getAvailableSizes = () => {
            if (!product.foot_numbers) return [];

            const allSizes = [
                ...new Set(
                    product.foot_numbers
                        .split(',')
                        .map((size) => size.trim())
                        .filter((size) => size.length > 0),
                ),
            ];

            // If we have size-specific stock data, filter by availability
            if (product.sizeStocks) {
                return allSizes.filter((size) => {
                    const sizeStockInfo = product.sizeStocks![size];
                    const sizeStock =
                        typeof sizeStockInfo === 'object'
                            ? sizeStockInfo.quantity
                            : sizeStockInfo || 0;
                    return sizeStock > 0;
                });
            }

            // Otherwise, show all sizes if product is in stock
            return isOutOfStock ? [] : allSizes;
        };

        const availableSizes = getAvailableSizes();

        return (
            <article
                className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-200 focus-within:ring-2 focus-within:ring-[#771E49] hover:border-[#771E49] hover:shadow-lg"
                onClick={handleQuickView}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleQuickView();
                    }
                }}
                aria-label={`${product.name} - €${(product.price || 0).toFixed(2)}`}
            >
                {/* Image Container with Fixed Aspect Ratio */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {!imageLoaded && (
                        <div className="absolute inset-0">
                            {/* Animated gradient skeleton */}
                            <div
                                className="h-full w-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"
                                style={{
                                    animation: 'shimmer 1.5s infinite',
                                }}
                                aria-hidden="true"
                            />
                            {/* Shoe icon placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg
                                    className="h-12 w-12 text-gray-400 opacity-30"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        </div>
                    )}
                    <img
                        src={cachedUrl}
                        alt={product.name}
                        loading={priority ? 'eager' : 'lazy'}
                        fetchPriority={priority ? 'high' : 'auto'}
                        decoding={priority ? 'sync' : 'async'}
                        className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    />

                    {/* Stock Badge */}
                    {isOutOfStock && (
                        <div className="absolute top-2 right-2 rounded bg-gray-800 px-2 py-1 text-xs font-semibold text-white">
                            Out of Stock
                        </div>
                    )}
                    {isLowStock && (
                        <div className="absolute top-2 right-2 rounded bg-[#771E49] px-2 py-1 text-xs font-semibold text-white">
                            Low Stock
                        </div>
                    )}

                    {/* Campaign Badge */}
                    {product.hasActiveCampaign && product.originalPrice && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                            <Tag size={12} />
                            <span>
                                {Math.round(
                                    ((product.originalPrice - product.price) /
                                        product.originalPrice) *
                                        100,
                                )}
                                % OFF
                            </span>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-1 flex-col p-2 sm:p-4">
                    {/* Title */}
                    <h3 className="mb-1 line-clamp-2 text-xs font-semibold text-gray-900 transition-colors group-hover:text-[#771E49] sm:mb-2 sm:text-base">
                        {product.name}
                    </h3>

                    {/* Gender Badge */}
                    {product.gender && (
                        <div className="mb-1 sm:mb-2">
                            <span
                                className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:py-1 sm:text-xs ${
                                    product.gender === 'male'
                                        ? 'bg-blue-100 text-blue-800'
                                        : product.gender === 'female'
                                          ? 'bg-pink-100 text-pink-800'
                                          : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {product.gender === 'male'
                                    ? 'Male'
                                    : product.gender === 'female'
                                      ? 'Female'
                                      : 'Unisex'}
                            </span>
                        </div>
                    )}

                    {/* Available Sizes */}
                    {availableSizes.length > 0 && (
                        <div className="mb-1 sm:mb-2">
                            <p className="mb-0.5 text-[10px] text-gray-500 sm:mb-1 sm:text-xs">
                                Available sizes:
                            </p>
                            <div className="flex flex-wrap gap-0.5 sm:gap-1">
                                {availableSizes.slice(0, 4).map((size) => {
                                    const sizeStockInfo =
                                        product.sizeStocks?.[size];
                                    const sizeStock =
                                        typeof sizeStockInfo === 'object'
                                            ? sizeStockInfo.quantity
                                            : sizeStockInfo || 0;
                                    const isLowSizeStock =
                                        sizeStock > 0 && sizeStock <= 3;

                                    return (
                                        <span
                                            key={size}
                                            className={`inline-block rounded border px-1 py-0.5 text-[9px] sm:px-1.5 sm:text-xs ${
                                                isLowSizeStock
                                                    ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                                                    : 'border-gray-200 bg-gray-100 text-gray-700'
                                            }`}
                                            title="Available size"
                                        >
                                            {size}
                                            {isLowSizeStock && (
                                                <span className="ml-0.5 text-[8px] sm:ml-1 sm:text-[10px]">
                                                    ●
                                                </span>
                                            )}
                                        </span>
                                    );
                                })}
                                {availableSizes.length > 4 && (
                                    <span className="text-[9px] text-gray-500 sm:text-xs">
                                        +{availableSizes.length - 4} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Price and Action */}
                    <div className="mt-auto flex items-center justify-between gap-1 pt-2 sm:gap-2 sm:pt-3">
                        <div className="flex flex-col">
                            {product.hasActiveCampaign &&
                            product.originalPrice ? (
                                <>
                                    <span className="text-base font-bold text-green-600 sm:text-xl">
                                        €{(product.price || 0).toFixed(2)}
                                    </span>
                                    <span className="text-xs text-gray-400 line-through sm:text-sm">
                                        €
                                        {(product.originalPrice || 0).toFixed(
                                            2,
                                        )}
                                    </span>
                                    {product.campaign_name && (
                                        <span className="text-[10px] font-semibold text-purple-600 sm:text-xs">
                                            {product.campaign_name}
                                        </span>
                                    )}
                                    {timeRemaining && (
                                        <div className="mt-0.5 flex items-center gap-0.5 text-[10px] font-medium text-gray-600 sm:mt-1 sm:gap-1 sm:text-xs">
                                            <Clock
                                                size={10}
                                                className="text-purple-600 sm:h-3 sm:w-3"
                                            />
                                            <span>
                                                {timeRemaining.days > 0 &&
                                                    `${timeRemaining.days}d `}
                                                {timeRemaining.hours}h{' '}
                                                {timeRemaining.minutes}m{' '}
                                                {timeRemaining.seconds}s
                                            </span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <span className="text-base font-bold text-[#771E49] sm:text-xl">
                                    €{(product.price || 0).toFixed(2)}
                                </span>
                            )}
                        </div>

                        <button
                            onClick={handleShowDetails}
                            className="flex items-center gap-1 rounded-lg bg-[#771E49] px-2 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-[#5a1738] focus:ring-2 focus:ring-[#771E49] focus:outline-none sm:gap-1.5 sm:px-3 sm:py-2 sm:text-sm"
                            aria-label={`View details for ${product.name}`}
                        >
                            <Eye size={14} className="sm:h-4 sm:w-4" />
                            <span>Details</span>
                        </button>
                    </div>
                </div>
            </article>
        );
    },
);

ProductCard.displayName = 'ProductCard';
