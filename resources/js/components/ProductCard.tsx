import { Clock, Eye, Tag } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useImageCache } from '../hooks/useImageCache';
import type { Product } from '../types/store';

interface ProductCardProps {
    product: Product;
    onQuickView?: (product: Product) => void;
    priority?: boolean;
}

/**
 * Premium product card - Luxury e-commerce design
 * Focus: Visual hierarchy, intentional spacing, refined hover states
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

            return isOutOfStock ? [] : allSizes;
        };

        const availableSizes = getAvailableSizes();

        return (
            <article
                className="group relative flex h-full cursor-pointer flex-col overflow-hidden bg-white transition-all duration-500 focus-within:shadow-2xl focus-within:outline-none focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-4 hover:-translate-y-1 hover:shadow-2xl"
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
                style={{
                    willChange: 'transform, box-shadow',
                }}
            >
                {/* Subtle Border - Appears on Hover */}
                <div className="absolute inset-0 border border-gray-200 transition-all duration-500 group-hover:border-black" />

                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    {!imageLoaded && (
                        <div className="absolute inset-0">
                            <div className="h-full w-full animate-pulse bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-20 w-20 animate-pulse border-2 border-gray-300" />
                            </div>
                        </div>
                    )}
                    <img
                        src={cachedUrl}
                        alt={product.name}
                        loading={priority ? 'eager' : 'lazy'}
                        fetchPriority={priority ? 'high' : 'auto'}
                        decoding={priority ? 'sync' : 'async'}
                        className={`h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{
                            filter: 'grayscale(30%)',
                            willChange: 'transform, filter',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.filter = 'grayscale(0%)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.filter = 'grayscale(30%)';
                        }}
                    />

                    {/* Stock Badge */}
                    {isOutOfStock && (
                        <div className="absolute right-4 top-4 bg-white px-4 py-2 shadow-lg backdrop-blur-sm">
                            <span className="text-xs font-black uppercase tracking-wider">
                                Sold Out
                            </span>
                        </div>
                    )}
                    {isLowStock && (
                        <div className="absolute right-4 top-4 bg-black px-4 py-2 shadow-lg">
                            <span className="text-xs font-black uppercase tracking-wider text-white">
                                Low Stock
                            </span>
                        </div>
                    )}

                    {/* Campaign Badge */}
                    {product.hasActiveCampaign && product.originalPrice && (
                        <div className="absolute left-4 top-4 flex items-center gap-2 bg-black px-4 py-2 shadow-lg">
                            <Tag
                                size={14}
                                strokeWidth={3}
                                className="text-white"
                            />
                            <span className="text-xs font-black uppercase tracking-wider text-white">
                                {Math.round(
                                    ((product.originalPrice - product.price) /
                                        product.originalPrice) *
                                        100,
                                )}
                                % Off
                            </span>
                        </div>
                    )}

                    {/* Quick View Overlay - Subtle Fade */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-500 group-hover:bg-black/40 group-hover:opacity-100">
                        <button
                            onClick={handleShowDetails}
                            className="translate-y-4 border-2 border-white bg-white px-8 py-3 font-bold tracking-wide text-black opacity-0 transition-all duration-500 hover:bg-black hover:text-white group-hover:translate-y-0 group-hover:opacity-100"
                            aria-label={`Quick view ${product.name}`}
                        >
                            Quick View
                        </button>
                    </div>
                </div>

                {/* Product Info - Premium Spacing */}
                <div className="flex flex-1 flex-col p-4">
                    {/* Gender Badge - Refined */}
                    {product.gender && (
                        <div className="mb-2">
                            <span className="inline-block border border-gray-300 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 transition-colors group-hover:border-black group-hover:text-black">
                                {product.gender === 'male'
                                    ? 'Men'
                                    : product.gender === 'female'
                                      ? 'Women'
                                      : 'Unisex'}
                            </span>
                        </div>
                    )}

                    {/* Title - Better Typography */}
                    <h3 className="mb-3 line-clamp-2 min-h-[2.75rem] text-base font-bold leading-snug tracking-tight text-black transition-colors group-hover:text-black">
                        {product.name}
                    </h3>

                    {/* Price Section - Enhanced Hierarchy */}
                    <div className="mb-3 border-t border-gray-200 pt-3">
                        {product.hasActiveCampaign && product.originalPrice ? (
                            <div className="space-y-1.5">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-black tracking-tight text-black">
                                        €{(product.price || 0).toFixed(2)}
                                    </span>
                                    <span className="text-sm font-medium text-gray-400 line-through">
                                        €
                                        {(product.originalPrice || 0).toFixed(
                                            2,
                                        )}
                                    </span>
                                </div>
                                {product.campaign_name && (
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                        {product.campaign_name}
                                    </span>
                                )}
                                {timeRemaining && (
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-700">
                                        <Clock size={12} strokeWidth={2.5} />
                                        <span>
                                            {timeRemaining.days > 0 &&
                                                `${timeRemaining.days}d `}
                                            {timeRemaining.hours}h{' '}
                                            {timeRemaining.minutes}m
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <span className="text-xl font-black tracking-tight text-black">
                                €{(product.price || 0).toFixed(2)}
                            </span>
                        )}
                    </div>

                    {/* Available Sizes - Clean Design */}
                    {availableSizes.length > 0 && (
                        <div className="mb-3">
                            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                Available Sizes
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {availableSizes.slice(0, 6).map((size) => {
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
                                            className={`inline-flex h-8 min-w-[2rem] items-center justify-center border px-2.5 text-xs font-semibold transition-all duration-300 ${
                                                isLowSizeStock
                                                    ? 'border-black bg-black text-white'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:border-black'
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
                                {availableSizes.length > 6 && (
                                    <span className="flex h-8 items-center text-xs font-medium text-gray-500">
                                        +{availableSizes.length - 6}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* CTA Button - Refined */}
                    <button
                        onClick={handleShowDetails}
                        className="mt-auto flex w-full items-center justify-center gap-2 border-2 border-black bg-black py-2.5 font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        aria-label={`View details for ${product.name}`}
                    >
                        <Eye size={18} strokeWidth={2.5} />
                        <span>View Details</span>
                    </button>
                </div>
            </article>
        );
    },
);

ProductCard.displayName = 'ProductCard';
