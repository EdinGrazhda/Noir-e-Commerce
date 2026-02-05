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
                className="group flex h-full cursor-pointer flex-col overflow-hidden border-2 border-black bg-white transition-all duration-300 focus-within:ring-4 focus-within:ring-black hover:bg-black hover:text-white"
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
                            {/* Minimalist skeleton */}
                            <div
                                className="h-full w-full animate-pulse bg-gray-200"
                                aria-hidden="true"
                            />
                            {/* Simple icon placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-16 w-16 border-4 border-black" />
                            </div>
                        </div>
                    )}
                    <img
                        src={cachedUrl}
                        alt={product.name}
                        loading={priority ? 'eager' : 'lazy'}
                        fetchPriority={priority ? 'high' : 'auto'}
                        decoding={priority ? 'sync' : 'async'}
                        className={`h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    />

                    {/* Stock Badge - Minimalist */}
                    {isOutOfStock && (
                        <div className="absolute top-3 right-3 border-2 border-black bg-white px-3 py-1 font-black tracking-wider text-black uppercase">
                            SOLD OUT
                        </div>
                    )}
                    {isLowStock && (
                        <div className="absolute top-3 right-3 border-2 border-black bg-black px-3 py-1 font-black tracking-wider text-white uppercase">
                            LOW STOCK
                        </div>
                    )}

                    {/* Campaign Badge - Minimalist */}
                    {product.hasActiveCampaign && product.originalPrice && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 border-2 border-black bg-black px-3 py-1.5 font-black tracking-wider text-white uppercase">
                            <Tag size={14} strokeWidth={3} />
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

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
                </div>

                {/* Product Info */}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                    {/* Title */}
                    <h3 className="mb-2 line-clamp-2 font-black tracking-tight text-black uppercase transition-colors group-hover:text-white sm:mb-3 sm:text-lg">
                        {product.name}
                    </h3>

                    {/* Gender Badge - Minimalist */}
                    {product.gender && (
                        <div className="mb-2 sm:mb-3">
                            <span className="inline-block border border-black px-2 py-1 text-xs font-bold tracking-wider text-black uppercase transition-all group-hover:border-white group-hover:text-white">
                                {product.gender === 'male'
                                    ? 'MALE'
                                    : product.gender === 'female'
                                      ? 'FEMALE'
                                      : 'UNISEX'}
                            </span>
                        </div>
                    )}

                    {/* Available Sizes - Minimalist */}
                    {availableSizes.length > 0 && (
                        <div className="mb-3">
                            <p className="mb-1.5 text-xs font-bold tracking-wide text-black uppercase transition-colors group-hover:text-white">
                                Sizes:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {availableSizes.slice(0, 5).map((size) => {
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
                                            className={`inline-block border px-2 py-0.5 text-xs font-bold transition-all ${
                                                isLowSizeStock
                                                    ? 'border-black bg-black text-white group-hover:border-white group-hover:bg-white group-hover:text-black'
                                                    : 'border-black text-black group-hover:border-white group-hover:text-white'
                                            }`}
                                            title="Available size"
                                        >
                                            {size}
                                        </span>
                                    );
                                })}
                                {availableSizes.length > 5 && (
                                    <span className="text-xs font-medium text-black transition-colors group-hover:text-white">
                                        +{availableSizes.length - 5}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Price and Action */}
                    <div className="mt-auto pt-3 sm:pt-4">
                        <div className="mb-3 border-t-2 border-black pt-3 transition-colors group-hover:border-white">
                            {product.hasActiveCampaign &&
                            product.originalPrice ? (
                                <>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-black transition-colors group-hover:text-white sm:text-3xl">
                                            €{(product.price || 0).toFixed(2)}
                                        </span>
                                        <span className="text-sm font-bold text-gray-400 line-through transition-colors group-hover:text-gray-300">
                                            €
                                            {(
                                                product.originalPrice || 0
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                    {product.campaign_name && (
                                        <span className="mt-1 block text-xs font-bold tracking-wider text-black uppercase transition-colors group-hover:text-white">
                                            {product.campaign_name}
                                        </span>
                                    )}
                                    {timeRemaining && (
                                        <div className="mt-1.5 flex items-center gap-1 text-xs font-bold tracking-wide text-black uppercase transition-colors group-hover:text-white">
                                            <Clock size={12} strokeWidth={3} />
                                            <span>
                                                {timeRemaining.days > 0 &&
                                                    `${timeRemaining.days}D `}
                                                {timeRemaining.hours}H{' '}
                                                {timeRemaining.minutes}M
                                            </span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <span className="text-2xl font-black text-black transition-colors group-hover:text-white sm:text-3xl">
                                    €{(product.price || 0).toFixed(2)}
                                </span>
                            )}
                        </div>

                        <button
                            onClick={handleShowDetails}
                            className="flex w-full items-center justify-center gap-2 border-2 border-black bg-black py-3 font-black tracking-widest text-white uppercase transition-all duration-300 group-hover:border-white group-hover:bg-white group-hover:text-black hover:bg-white hover:text-black focus:ring-4 focus:ring-black focus:outline-none"
                            aria-label={`View details for ${product.name}`}
                        >
                            <Eye size={16} strokeWidth={3} />
                            <span>VIEW</span>
                        </button>
                    </div>
                </div>
            </article>
        );
    },
);

ProductCard.displayName = 'ProductCard';
