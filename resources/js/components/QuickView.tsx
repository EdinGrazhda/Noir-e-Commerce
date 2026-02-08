import { Minus, Plus, ShoppingCart, Star, Upload, X } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import type { Product } from '../types/store';

interface QuickViewProps {
    product: Product | null;
    onClose: () => void;
}

/**
 * Quick-view modal for detailed product information
 * Accessible with keyboard navigation and ARIA attributes
 */
export const QuickView = memo(({ product, onClose }: QuickViewProps) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [customLogoFile, setCustomLogoFile] = useState<File | null>(null);
    const [customLogoPreview, setCustomLogoPreview] = useState<string | null>(null);
    const addItem = useCartStore((state) => state.addItem);

    // Reset state when product changes or modal opens
    useEffect(() => {
        if (product) {
            setQuantity(1);
            setSelectedSize(null);
            setSelectedImageIndex(0);
            setCustomLogoFile(null);
            setCustomLogoPreview(null);
        }
    }, [product?.id]);

    const handleBackdropClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        },
        [onClose],
    );

    // Handle logo file upload
    const handleLogoFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/png')) {
            toast.error('Please upload a PNG file only');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setCustomLogoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setCustomLogoPreview(reader.result as string);
        reader.readAsDataURL(file);
        toast.success('Logo uploaded!');
    }, []);

    const handleRemoveLogo = useCallback(() => {
        setCustomLogoFile(null);
        setCustomLogoPreview(null);
    }, []);

    const handleAddToCart = useCallback(() => {
        if (!product) return;

        // If product has size-specific stock, require size selection
        if (product.sizeStocks && Object.keys(product.sizeStocks).length > 0) {
            if (!selectedSize) {
                toast.error('Please select a size before adding to cart');
                return;
            }

            const sizeStock = product.sizeStocks[selectedSize];
            if (!sizeStock || sizeStock.quantity === 0) {
                toast.error(`Size ${selectedSize} is out of stock`);
                return;
            }

            // Check if requested quantity is available
            if (quantity > sizeStock.quantity) {
                toast.error(
                    `Not enough stock available for size ${selectedSize}`,
                );
                return;
            }
        } else {
            // Fallback to general stock check
            if (product.stock === 'out of stock') {
                toast.error('This product is out of stock');
                return;
            }
        }

        // Add to cart with selected size and logo
        addItem(
            { ...product, selectedSize: selectedSize || undefined },
            quantity,
            customLogoPreview || undefined,
        );
        toast.success('Added to cart successfully!');
        onClose();
    }, [product, quantity, selectedSize, customLogoPreview, addItem, onClose]);

    // Parse available sizes and check stock - MOVED BEFORE early return
    const getAvailableSizes = useCallback(() => {
        if (!product) return [];

        // If product has size-specific stock data, use it
        if (product.sizeStocks && Object.keys(product.sizeStocks).length > 0) {
            return Object.entries(product.sizeStocks)
                .filter(([_, stockInfo]) => stockInfo.quantity > 0) // Only show sizes with stock > 0
                .map(([size, _]) => ({
                    size,
                    available: true, // All returned sizes are available
                }))
                .sort((a, b) => {
                    const sizeA = parseFloat(a.size);
                    const sizeB = parseFloat(b.size);
                    return sizeA - sizeB;
                });
        }

        // If no size-specific stock, don't show any sizes
        // Products without sizeStocks data should not display size options
        return [];
    }, [product]);

    const sizeInfo = getAvailableSizes();
    const availableSizes = sizeInfo.filter((info) => info.available);

    // Early return AFTER all hooks are called
    if (!product) return null;

    const isOutOfStock = product.stock === 'out of stock';
    const maxQuantity = 10; // Set a reasonable max quantity

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-all duration-500 fade-in"
            onClick={handleBackdropClick}
            role="dialog"
            aria-labelledby="quick-view-title"
            aria-modal="true"
        >
            <div className="shadow-premium transition-noir max-h-[90vh] w-full max-w-5xl animate-in overflow-y-auto bg-white zoom-in-95">
                {/* Header */}
                <div className="shadow-soft sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white px-8 py-6">
                    <h2
                        id="quick-view-title"
                        className="font-sans text-2xl font-bold tracking-wide text-black uppercase"
                    >
                        Quick View
                    </h2>
                    <button
                        onClick={onClose}
                        className="transition-noir p-2 text-black hover:bg-black hover:text-white focus:ring-2 focus:ring-black focus:outline-none"
                        aria-label="Close quick view"
                    >
                        <X size={22} strokeWidth={2} />
                    </button>
                </div>

                {/* Content */}
                <div className="grid gap-10 p-8 md:grid-cols-2">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="shadow-soft aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-white">
                            <img
                                src={
                                    (product as any).all_images?.[
                                        selectedImageIndex
                                    ]?.url || product.image
                                }
                                alt={product.name}
                                className="transition-noir h-full w-full object-cover hover:scale-105"
                            />
                        </div>

                        {/* Thumbnail Gallery */}
                        {(product as any).all_images?.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {(product as any).all_images.map(
                                    (img: any, index: number) => (
                                        <button
                                            key={img.id}
                                            onClick={() =>
                                                setSelectedImageIndex(index)
                                            }
                                            className={`transition-noir aspect-square overflow-hidden border-2 ${
                                                selectedImageIndex === index
                                                    ? 'shadow-elevated scale-105 border-black'
                                                    : 'hover:shadow-soft border-gray-200 hover:border-gray-400'
                                            }`}
                                        >
                                            <img
                                                src={img.thumb}
                                                alt={`${product.name} view ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                        </button>
                                    ),
                                )}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col">
                        {/* Title */}
                        <h3 className="mb-4 font-sans text-3xl font-bold tracking-wide text-black uppercase">
                            {product.name}
                        </h3>

                        {/* Rating */}
                        {product.rating && (
                            <div
                                className="mb-5 flex items-center gap-2"
                                aria-label={`Rating: ${product.rating} out of 5 stars`}
                            >
                                <div className="flex gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={18}
                                            className={
                                                i <
                                                Math.floor(product.rating || 0)
                                                    ? 'fill-black text-black'
                                                    : 'fill-gray-200 text-gray-200'
                                            }
                                            aria-hidden="true"
                                            strokeWidth={1.5}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-gray-600">
                                    ({product.rating.toFixed(1)})
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="mb-6 font-sans text-4xl font-bold text-black">
                            €{(product.price || 0).toFixed(2)}
                        </div>

                        {/* Description */}
                        <p className="mb-6 leading-relaxed text-gray-700">
                            {product.description}
                        </p>

                        {/* Color */}
                        {product.color && (
                            <div className="mb-6">
                                <span className="mb-2 block font-sans text-xs font-bold tracking-wider text-gray-600 uppercase">
                                    Color:
                                </span>
                                <span className="shadow-soft inline-flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 font-sans text-sm font-semibold tracking-wide text-black uppercase">
                                    {product.color}
                                </span>
                            </div>
                        )}

                        {/* Categories */}
                        {product.categories &&
                            product.categories.length > 0 && (
                                <div className="mb-6">
                                    <span className="mb-2 block font-sans text-xs font-bold tracking-wider text-gray-600 uppercase">
                                        Categories:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {product.categories.map((category) => (
                                            <span
                                                key={category.id}
                                                className="shadow-soft border border-gray-300 bg-white px-3 py-1.5 font-sans text-xs font-semibold tracking-wide text-black uppercase"
                                            >
                                                {category.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* Stock Status */}
                        <div className="mb-6">
                            {isOutOfStock ? (
                                <span className="inline-block border border-red-200 bg-red-50 px-4 py-2 font-sans text-xs font-bold tracking-wider text-red-700 uppercase">
                                    Out of Stock
                                </span>
                            ) : product.stock === 'low stock' ? (
                                <span className="inline-block border border-orange-200 bg-orange-50 px-4 py-2 font-sans text-xs font-bold tracking-wider text-orange-700 uppercase">
                                    Low Stock
                                </span>
                            ) : (
                                <span className="inline-block border border-green-200 bg-green-50 px-4 py-2 font-sans text-xs font-bold tracking-wider text-green-700 uppercase">
                                    In Stock
                                </span>
                            )}
                        </div>

                        {/* Size Availability */}
                        {(product.foot_numbers ||
                            (product.sizeStocks &&
                                Object.keys(product.sizeStocks).length >
                                    0)) && (
                            <div className="mb-6">
                                <h4 className="mb-3 font-sans text-xs font-bold tracking-wider text-gray-600 uppercase">
                                    {product.sizeStocks &&
                                    Object.keys(product.sizeStocks).length > 0
                                        ? 'Select Size (EU):'
                                        : 'Available Sizes (EU):'}
                                </h4>
                                <div className="grid grid-cols-5 gap-2">
                                    {sizeInfo.map((sizeItem) => (
                                        <button
                                            key={sizeItem.size}
                                            onClick={() =>
                                                setSelectedSize(sizeItem.size)
                                            }
                                            className={`transition-noir relative border p-3 text-center font-mono text-sm font-bold ${
                                                selectedSize === sizeItem.size
                                                    ? 'shadow-elevated scale-105 border-black bg-black text-white'
                                                    : 'hover:shadow-soft cursor-pointer border-gray-300 bg-white text-black hover:border-black'
                                            }`}
                                        >
                                            <span>{sizeItem.size}</span>
                                        </button>
                                    ))}
                                </div>
                                {selectedSize && (
                                    <p className="mt-3 font-sans text-xs font-semibold tracking-wider text-black uppercase">
                                        Selected: EU {selectedSize}
                                    </p>
                                )}
                                {product.sizeStocks &&
                                    Object.keys(product.sizeStocks).length >
                                        0 &&
                                    !selectedSize && (
                                        <p className="mt-3 font-sans text-xs font-semibold tracking-wider text-orange-600 uppercase">
                                            Please select a size
                                        </p>
                                    )}
                            </div>
                        )}

                        {/* Custom Logo Upload - Show after size selection */}
                        {product.allows_custom_logo && selectedSize && (
                            <div className="mb-6">
                                <h4 className="mb-3 font-sans text-xs font-bold tracking-wider text-gray-600 uppercase">
                                    Upload Your Logo (PNG only):
                                </h4>

                                {!customLogoPreview ? (
                                    <label className="shadow-soft transition-noir flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 p-6 hover:border-black hover:bg-gray-100">
                                        <Upload size={32} className="mb-2 text-gray-400" strokeWidth={1.5} />
                                        <span className="mb-1 font-sans text-sm font-semibold text-gray-700">
                                            Click to upload logo
                                        </span>
                                        <span className="font-sans text-xs text-gray-500">
                                            PNG only, max 5MB
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/png"
                                            onChange={handleLogoFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                ) : (
                                    <div className="shadow-soft relative border-2 border-gray-300 bg-white p-4">
                                        <button
                                            onClick={handleRemoveLogo}
                                            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center border border-red-300 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                                            aria-label="Remove logo"
                                        >
                                            <X size={16} strokeWidth={2.5} />
                                        </button>
                                        <div className="flex items-center gap-4">
                                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden border border-gray-200 bg-gray-50 p-2">
                                                <img
                                                    src={customLogoPreview}
                                                    alt="Logo preview"
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                            <p className="font-sans text-sm font-semibold text-green-700">
                                                ✓ Logo uploaded
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quantity Selector */}
                        {!isOutOfStock && (
                            <div className="mb-6">
                                <label
                                    htmlFor="quantity"
                                    className="mb-3 block font-sans text-xs font-bold tracking-wider text-gray-600 uppercase"
                                >
                                    Quantity:
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() =>
                                            setQuantity((q) =>
                                                Math.max(1, q - 1),
                                            )
                                        }
                                        className="transition-noir flex h-10 w-10 items-center justify-center border border-gray-300 bg-white hover:border-black hover:bg-black hover:text-white focus:ring-2 focus:ring-black focus:outline-none"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={16} strokeWidth={2.5} />
                                    </button>
                                    <input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        max={maxQuantity}
                                        value={quantity}
                                        onChange={(e) =>
                                            setQuantity(
                                                Math.min(
                                                    maxQuantity,
                                                    Math.max(
                                                        1,
                                                        Number(e.target.value),
                                                    ),
                                                ),
                                            )
                                        }
                                        className="shadow-soft w-20 border border-gray-300 bg-white py-2 text-center font-mono text-sm font-bold focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                        aria-label="Product quantity"
                                    />
                                    <button
                                        onClick={() =>
                                            setQuantity((q) =>
                                                Math.min(maxQuantity, q + 1),
                                            )
                                        }
                                        disabled={quantity >= maxQuantity}
                                        className="transition-noir flex h-10 w-10 items-center justify-center border border-gray-300 bg-white hover:border-black hover:bg-black hover:text-white focus:ring-2 focus:ring-black focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={
                                isOutOfStock ||
                                (!!product.sizeStocks &&
                                    Object.keys(product.sizeStocks).length > 0 &&
                                    !selectedSize) ||
                                (!!selectedSize &&
                                    !!product.sizeStocks?.[selectedSize] &&
                                    product.sizeStocks[selectedSize].quantity === 0)
                            }
                            className={`shadow-soft transition-noir flex w-full items-center justify-center gap-3 py-5 font-sans text-sm font-bold tracking-widest uppercase focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none ${
                                isOutOfStock ||
                                (!!product.sizeStocks &&
                                    Object.keys(product.sizeStocks).length > 0 &&
                                    !selectedSize) ||
                                (!!selectedSize &&
                                    !!product.sizeStocks?.[selectedSize] &&
                                    product.sizeStocks[selectedSize].quantity === 0)
                                    ? 'cursor-not-allowed border border-gray-300 bg-gray-100 text-gray-400'
                                    : 'hover:shadow-elevated bg-black text-white hover:-translate-y-0.5 active:translate-y-0'
                            }`}
                            aria-label={`Add ${quantity} ${product.name} to cart`}
                        >
                            <ShoppingCart size={20} strokeWidth={2.5} />
                            {isOutOfStock ||
                            (selectedSize &&
                                product.sizeStocks?.[selectedSize]?.quantity === 0)
                                ? 'Out of Stock'
                                : product.sizeStocks &&
                                    Object.keys(product.sizeStocks).length > 0 &&
                                    !selectedSize
                                  ? 'Select Size First'
                                  : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

QuickView.displayName = 'QuickView';
