import { Clock, Tag } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useImageCache } from '../hooks/useImageCache';
import type { Product } from '../types/store';

interface ProductCardProps {
    product: Product;
    onQuickView?: (product: Product) => void;
    priority?: boolean;
}

/**
 * Premium product card - compact, balanced proportions
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

            // Only filter by sizeStocks if it's a non-empty object
            if (
                product.sizeStocks &&
                Object.keys(product.sizeStocks).length > 0
            ) {
                return allSizes.filter((size) => {
                    const sizeStockInfo = product.sizeStocks![size];
                    if (!sizeStockInfo) return false;
                    // Handle both { quantity: N } and { available: boolean } formats
                    if (typeof sizeStockInfo === 'object') {
                        if ('quantity' in sizeStockInfo)
                            return sizeStockInfo.quantity > 0;
                        if ('available' in sizeStockInfo)
                            return !!(sizeStockInfo as any).available;
                    }
                    return (sizeStockInfo || 0) > 0;
                });
            }

            return isOutOfStock ? [] : allSizes;
        };

        const availableSizes = getAvailableSizes();

        const discountPercent =
            product.hasActiveCampaign && product.originalPrice
                ? Math.round(
                      ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100,
                  )
                : 0;

        return (
            <article
                className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
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
                {/* ── Image ── */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                    {!imageLoaded && (
                        <div className="absolute inset-0 animate-pulse bg-gray-100" />
                    )}

                    <img
                        src={cachedUrl}
                        alt={product.name}
                        loading={priority ? 'eager' : 'lazy'}
                        fetchPriority={priority ? 'high' : 'auto'}
                        decoding={priority ? 'sync' : 'async'}
                        className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    />

                    {/* Badges — top left */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                        {discountPercent > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-sm bg-black px-2 py-0.5">
                                <Tag
                                    size={8}
                                    strokeWidth={3}
                                    className="text-white"
                                />
                                <span className="text-[9px] font-bold text-white">
                                    -{discountPercent}%
                                </span>
                            </span>
                        )}
                    </div>

                    {/* Badges — top right */}
                    {isOutOfStock && (
                        <span className="absolute top-2.5 right-2.5 rounded-sm bg-white/90 px-2 py-0.5 text-[9px] font-bold tracking-wider text-gray-700 uppercase backdrop-blur-sm">
                            Sold Out
                        </span>
                    )}
                    {isLowStock && !isOutOfStock && (
                        <span className="absolute top-2.5 right-2.5 rounded-sm bg-black px-2 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
                            Low Stock
                        </span>
                    )}

                    {/* Hover overlay with quick-view */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/30 group-hover:opacity-100">
                        <button
                            onClick={handleShowDetails}
                            className="translate-y-2 rounded-full bg-white px-5 py-2 text-[11px] font-bold tracking-wide text-black uppercase shadow-md transition-all duration-300 group-hover:translate-y-0 hover:bg-black hover:text-white"
                            aria-label={`Quick view ${product.name}`}
                        >
                            Quick View
                        </button>
                    </div>
                </div>

                {/* ── Info ── */}
                <div className="flex flex-1 flex-col gap-1 px-2 pt-2 pb-2 sm:gap-2 sm:p-3">
                    {/* Gender tag + Name */}
                    {product.gender && (
                        <span className="inline-flex w-fit rounded border border-gray-200 px-1.5 py-px text-[7px] font-bold tracking-widest text-gray-500 uppercase sm:py-0.5 sm:text-[9px]">
                            {product.gender === 'male'
                                ? 'Men'
                                : product.gender === 'female'
                                  ? 'Women'
                                  : 'Unisex'}
                        </span>
                    )}
                    <h3 className="line-clamp-1 text-[11px] leading-tight font-semibold text-gray-900 sm:text-[13px]">
                        {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-1">
                        {product.hasActiveCampaign && product.originalPrice ? (
                            <>
                                <span className="text-sm font-extrabold text-black sm:text-base">
                                    €{(product.price || 0).toFixed(2)}
                                </span>
                                <span className="text-[9px] text-gray-400 line-through sm:text-[11px]">
                                    €{(product.originalPrice || 0).toFixed(2)}
                                </span>
                            </>
                        ) : (
                            <span className="text-sm font-extrabold text-black sm:text-base">
                                €{(product.price || 0).toFixed(2)}
                            </span>
                        )}
                    </div>

                    {/* Campaign timer */}
                    {product.hasActiveCampaign && timeRemaining && (
                        <div className="flex items-center gap-1 text-[9px] font-semibold text-amber-600 sm:text-[10px]">
                            <Clock
                                size={9}
                                strokeWidth={2.5}
                                className="sm:h-2.5 sm:w-2.5"
                            />
                            <span>
                                {timeRemaining.days > 0 &&
                                    `${timeRemaining.days}d `}
                                {timeRemaining.hours}h {timeRemaining.minutes}m
                            </span>
                        </div>
                    )}

                    {/* Sizes */}
                    {availableSizes.length > 0 && (
                        <div className="mt-0.5">
                            <span className="mb-0.5 hidden text-[9px] font-semibold tracking-widest text-gray-400 uppercase sm:mb-1 sm:block">
                                Available Sizes
                            </span>
                            <div className="flex flex-wrap items-center gap-[3px] sm:gap-1">
                                {availableSizes.slice(0, 4).map((size) => {
                                    const sizeStockInfo =
                                        product.sizeStocks?.[size];
                                    const sizeStock =
                                        typeof sizeStockInfo === 'object'
                                            ? (sizeStockInfo.quantity ?? 0)
                                            : sizeStockInfo || 0;
                                    const isLowSizeStock =
                                        sizeStock > 0 && sizeStock <= 3;

                                    return (
                                        <span
                                            key={size}
                                            className={`inline-flex h-[18px] min-w-[1.1rem] items-center justify-center rounded border px-0.5 text-[8px] font-semibold sm:h-6 sm:min-w-[1.5rem] sm:px-1.5 sm:text-[10px] ${
                                                isLowSizeStock
                                                    ? 'border-gray-900 bg-gray-900 text-white'
                                                    : 'border-gray-200 bg-gray-50 text-gray-500'
                                            }`}
                                            title={
                                                isLowSizeStock
                                                    ? `Only ${sizeStock} left`
                                                    : 'Available'
                                            }
                                        >
                                            {size}
                                        </span>
                                    );
                                })}
                                {availableSizes.length > 4 && (
                                    <span className="text-[8px] font-medium text-gray-400 sm:text-[10px]">
                                        +{availableSizes.length - 4}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Button */}
                    <button
                        onClick={handleShowDetails}
                        className="mt-auto flex w-full items-center justify-center rounded bg-black py-[5px] text-[8px] font-bold tracking-wide text-white uppercase transition-colors duration-200 hover:bg-gray-800 sm:rounded-md sm:py-2.5 sm:text-[11px] sm:tracking-wider"
                        aria-label={`View details for ${product.name}`}
                    >
                        View Details
                    </button>
                </div>
            </article>
        );
    },
);

ProductCard.displayName = 'ProductCard';
