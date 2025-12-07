import { Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Category {
    id: number;
    name: string;
    description?: string;
}

interface Product {
    id: number;
    product_id?: string; // Custom product ID
    name: string;
    price: number;
    description?: string;
    image?: string;
    stock: number; // Now represents quantity
    stock_quantity?: number; // Backend field
    stock_status?: string; // Calculated status
    foot_numbers?: string;
    color?: string;
    gender?: 'male' | 'female' | 'unisex';
    category?: Category;
    category_id?: number;
}

interface ProductModalProps {
    product?: Product | null;
    categories: Category[];
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

interface FormData {
    name: string;
    description: string;
    price: string;
    image: string;
    imageFile: File | null; // Legacy single image file
    imageFiles: File[]; // Multiple image files (max 4)
    existingImages: Array<{ id: number; url: string; thumb: string }>; // Existing images from Media Library
    deleteImageIds: number[]; // IDs of images to delete
    stock: number; // Now quantity
    foot_numbers: string;
    color: string;
    category_id: number | '';
    gender: 'male' | 'female' | 'unisex';
    sizeStocks: Record<string, number>; // New field for size-specific stock
    product_id: string; // Custom product ID
}

export default function ProductModal({
    product,
    categories,
    isOpen,
    onClose,
    onSave,
}: ProductModalProps) {
    const [formData, setFormData] = useState<FormData>({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price?.toString() || '',
        image: product?.image || '',
        imageFile: null,
        imageFiles: [],
        existingImages: (product as any)?.all_images || [],
        deleteImageIds: [],
        stock: product?.stock_quantity ?? product?.stock ?? 0,
        foot_numbers: product?.foot_numbers || '',
        color: product?.color || '',
        category_id: product?.category_id || product?.category?.id || '',
        gender: product?.gender || 'unisex',
        sizeStocks: {},
        product_id: product?.product_id || '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    // Reset form when product changes or modal opens
    useEffect(() => {
        if (isOpen) {
            // If product contains sizeStocks, normalize into map { size: quantity }
            let initialSizeStocks: Record<string, number> = {};
            if (product && (product as any).sizeStocks) {
                const ss = (product as any).sizeStocks;
                // If it's an array of {size, quantity}
                if (Array.isArray(ss)) {
                    ss.forEach((item: any) => {
                        if (item && item.size) {
                            initialSizeStocks[item.size] =
                                Number(item.quantity) || 0;
                        }
                    });
                } else if (typeof ss === 'object') {
                    // If it's already a map { size: { quantity } } or { size: qty }
                    Object.keys(ss).forEach((k) => {
                        const val = ss[k];
                        if (
                            val &&
                            typeof val === 'object' &&
                            'quantity' in val
                        ) {
                            initialSizeStocks[k] = Number(val.quantity) || 0;
                        } else {
                            initialSizeStocks[k] = Number(val) || 0;
                        }
                    });
                }
            }

            const initialTotal = Object.values(initialSizeStocks).reduce(
                (s, v) => s + v,
                0,
            );

            setFormData({
                name: product?.name || '',
                description: product?.description || '',
                price: product?.price?.toString() || '',
                image: product?.image || '',
                imageFile: null,
                imageFiles: [],
                existingImages: (product as any)?.all_images || [],
                deleteImageIds: [],
                stock:
                    initialTotal > 0
                        ? initialTotal
                        : (product?.stock_quantity ?? product?.stock ?? 0),
                foot_numbers: product?.foot_numbers || '',
                color: product?.color || '',
                category_id:
                    product?.category_id || product?.category?.id || '',
                gender: product?.gender || 'unisex',
                sizeStocks: initialSizeStocks,
                product_id: product?.product_id || '',
            });
            setErrors({});
        }
    }, [product, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        console.log('=== SUBMITTING PRODUCT ===');
        console.log('Product (edit mode):', product);
        console.log('Form Data:', formData);
        console.log(
            'URL:',
            product ? `/api/products/${product.id}` : '/api/products',
        );
        console.log('Method:', product ? 'PUT (via POST)' : 'POST');

        try {
            const url = product
                ? `/api/products/${product.id}`
                : '/api/products';

            // Always use POST for FormData, but add _method for updates
            const method = 'POST';

            // Use FormData for file upload
            const payload = new FormData();

            // For updates, add the _method field to simulate PUT
            if (product) {
                payload.append('_method', 'PUT');
            }

            payload.append('name', formData.name);
            payload.append('description', formData.description);
            payload.append('price', formData.price);
            payload.append('stock', formData.stock.toString());
            payload.append('foot_numbers', formData.foot_numbers);
            payload.append('color', formData.color);
            payload.append('category_id', formData.category_id.toString());
            payload.append('gender', formData.gender);

            // Add product_id if provided
            if (formData.product_id) {
                payload.append('product_id', formData.product_id);
            }

            // Add multiple image files if selected
            if (formData.imageFiles.length > 0) {
                formData.imageFiles.forEach((file) => {
                    payload.append('images[]', file);
                });
            } else if (formData.imageFile) {
                // Legacy single image support
                payload.append('image', formData.imageFile);
            }

            // Add IDs of images to delete
            if (formData.deleteImageIds.length > 0) {
                formData.deleteImageIds.forEach((id) => {
                    payload.append('delete_images[]', id.toString());
                });
            }

            // Attach size-specific stocks if provided
            if (Object.keys(formData.sizeStocks).length > 0) {
                // Convert to the format backend expects: {"38": {"quantity": 10}, "39": {"quantity": 20}}
                const sizeStocksObject: Record<string, { quantity: number }> =
                    {};
                Object.entries(formData.sizeStocks).forEach(
                    ([size, quantity]) => {
                        sizeStocksObject[size] = { quantity: Number(quantity) };
                    },
                );
                payload.append('size_stocks', JSON.stringify(sizeStocksObject));
                // Keep total stock in sync
                payload.set(
                    'stock',
                    String(
                        Object.values(formData.sizeStocks).reduce(
                            (s, v) => s + v,
                            0,
                        ),
                    ),
                );
            }

            console.log('Request payload with file:', formData.imageFile);
            console.log('Sending to:', url, 'Method:', method);
            console.log('FormData contents:', {
                name: formData.name,
                price: formData.price,
                stock: formData.stock,
                product_id: formData.product_id,
                size_stocks: payload.get('size_stocks'),
                _method: payload.get('_method'),
            });

            const response = await fetch(url, {
                method,
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: payload, // Send FormData
            });

            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                const action = product ? 'updated' : 'created';
                toast.success(`Product ${action} successfully!`);
                onSave();
                onClose(); // Close the modal after successful save
            } else {
                console.error('=== API ERROR ===');
                console.error('Status:', response.status);
                console.error('Status Text:', response.statusText);
                console.error('Response Data:', data);
                console.error('Validation Errors:', data.errors);

                if (data.errors) {
                    setErrors(data.errors);
                    // Show more specific error messages
                    const errorMessages = Object.entries(data.errors)
                        .map(
                            ([field, messages]: [string, any]) =>
                                `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`,
                        )
                        .join('\n');
                    toast.error(`Validation errors:\n${errorMessages}`);
                } else {
                    const errorMessage =
                        data.message ||
                        `Error ${response.status}: ${response.statusText}`;
                    toast.error(errorMessage);
                }
            }
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('Network error occurred while saving the product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (
        field: keyof FormData,
        value: string | number,
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: [] }));
        }
    };

    // Helper function to parse sizes from foot_numbers string
    const parseSizes = (sizeString: string): string[] => {
        return sizeString
            .split(',')
            .map((size) => size.trim())
            .filter((size) => size.length > 0);
    };

    // Helper function to handle size stock changes
    const handleSizeStockChange = (size: string, stock: number) => {
        setFormData((prev) => {
            const newSizeStocks = {
                ...prev.sizeStocks,
                [size]: stock,
            };
            const total = Object.values(newSizeStocks).reduce(
                (s, v) => s + v,
                0,
            );
            return {
                ...prev,
                sizeStocks: newSizeStocks,
                stock: total,
            };
        });
    };

    // Helper function to remove a size from stock tracking
    const removeSizeStock = (size: string) => {
        setFormData((prev) => {
            const newSizeStocks = { ...prev.sizeStocks };
            delete newSizeStocks[size];
            const total = Object.values(newSizeStocks).reduce(
                (s, v) => s + v,
                0,
            );
            return {
                ...prev,
                sizeStocks: newSizeStocks,
                stock: total,
            };
        });
    };

    // Get sizes from foot_numbers
    const availableSizes = parseSizes(formData.foot_numbers);

    // Helper function to auto-populate size stocks based on general stock quantity
    const autoPopulateSizeStocks = () => {
        if (availableSizes.length === 0) return;

        const total = Number(formData.stock) || 0;
        const base = Math.floor(total / availableSizes.length);
        const remainder = total % availableSizes.length;

        const newSizeStocks: Record<string, number> = {};
        availableSizes.forEach((size, idx) => {
            newSizeStocks[size] = base + (idx < remainder ? 1 : 0);
        });

        setFormData((prev) => ({
            ...prev,
            sizeStocks: newSizeStocks,
            stock: Object.values(newSizeStocks).reduce((s, v) => s + v, 0),
        }));
    };

    // Calculate total stock from individual size stocks
    const totalSizeStock = Object.values(formData.sizeStocks).reduce(
        (sum, stock) => sum + stock,
        0,
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative my-2 w-full max-w-2xl rounded-xl bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                        <h2 className="text-base font-bold text-gray-900">
                            {product ? 'Edit Product' : 'Create New Product'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {/* Name - Full Width */}
                            <div className="sm:col-span-3">
                                <label className="mb-1 block text-xs font-semibold text-gray-700">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-200 focus:outline-none"
                                    placeholder="Enter product name"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-0.5 text-xs text-red-600">
                                        {errors.name[0]}
                                    </p>
                                )}
                            </div>

                            {/* Product ID */}
                            <div className="sm:col-span-3">
                                <label className="mb-1 block text-xs font-semibold text-gray-700">
                                    Product ID
                                </label>
                                <input
                                    type="text"
                                    value={formData.product_id}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'product_id',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-200 focus:outline-none"
                                    placeholder="e.g., SHOE-001"
                                />
                                {errors.product_id && (
                                    <p className="mt-0.5 text-xs text-red-600">
                                        {errors.product_id[0]}
                                    </p>
                                )}
                            </div>

                            {/* Category */}
                            <div className="sm:col-span-3">
                                <label className="mb-1 block text-xs font-semibold text-gray-700">
                                    Category *
                                </label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'category_id',
                                            parseInt(e.target.value) || '',
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-200 focus:outline-none"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && (
                                    <p className="mt-0.5 text-xs text-red-600">
                                        {errors.category_id[0]}
                                    </p>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-700">
                                    Price *
                                </label>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'price',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pr-3 pl-7 text-sm transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-200 focus:outline-none"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                {errors.price && (
                                    <p className="mt-0.5 text-xs text-red-600">
                                        {errors.price[0]}
                                    </p>
                                )}
                            </div>

                            {/* Stock Quantity */}
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-700">
                                    Stock *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'stock',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-200 focus:outline-none"
                                    placeholder="0"
                                    required
                                />
                                {errors.stock && (
                                    <p className="mt-0.5 text-xs text-red-600">
                                        {errors.stock[0]}
                                    </p>
                                )}
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-700">
                                    Gender *
                                </label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'gender',
                                            e.target.value as any,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-200 focus:outline-none"
                                    required
                                >
                                    <option value="unisex">Unisex</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                                {errors.gender && (
                                    <p className="mt-0.5 text-xs text-red-600">
                                        {errors.gender[0]}
                                    </p>
                                )}
                            </div>

                            {/* Color */}
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-700">
                                    Color
                                </label>
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'color',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-200 focus:outline-none"
                                    placeholder="e.g., Red, Blue"
                                />
                                {errors.color && (
                                    <p className="mt-0.5 text-xs text-red-600">
                                        {errors.color[0]}
                                    </p>
                                )}
                            </div>

                            {/* Foot Numbers */}
                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-xs font-semibold text-gray-700">
                                    Available Sizes
                                </label>
                                <input
                                    type="text"
                                    value={formData.foot_numbers}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'foot_numbers',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-200 focus:outline-none"
                                    placeholder="e.g., 38, 39, 40, 41, 42"
                                />
                                {errors.foot_numbers && (
                                    <p className="mt-0.5 text-xs text-red-600">
                                        {errors.foot_numbers[0]}
                                    </p>
                                )}
                            </div>

                            {/* Size-Specific Stock Management */}
                            {availableSizes.length > 0 && (
                                <div className="sm:col-span-3">
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <label className="block text-xs font-semibold text-gray-700">
                                            Stock per Size
                                        </label>
                                        <button
                                            type="button"
                                            onClick={autoPopulateSizeStocks}
                                            className="rounded border border-blue-300 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                                        >
                                            Auto-fill
                                        </button>
                                    </div>
                                    <div className="max-h-32 space-y-1.5 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2">
                                        {availableSizes.map((size) => (
                                            <div
                                                key={size}
                                                className="flex items-center justify-between rounded border border-gray-200 bg-white p-2"
                                            >
                                                <div className="flex flex-1 items-center gap-2">
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">
                                                        {size}
                                                    </span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={
                                                            formData.sizeStocks[
                                                                size
                                                            ] || 0
                                                        }
                                                        onChange={(e) =>
                                                            handleSizeStockChange(
                                                                size,
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                            )
                                                        }
                                                        className="w-16 rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-200 focus:outline-none"
                                                        placeholder="0"
                                                    />
                                                    <span className="text-xs text-gray-500">
                                                        units
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeSizeStock(size)
                                                    }
                                                    className="ml-2 rounded px-1.5 py-0.5 text-base font-bold text-red-500 transition-colors hover:bg-red-50"
                                                    title={`Remove size ${size}`}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {totalSizeStock > 0 && (
                                        <p className="mt-1 text-xs font-medium text-blue-700">
                                            📦 Total: {totalSizeStock} units
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Description */}
                            <div className="sm:col-span-3">
                                <label className="mb-1 block text-xs font-semibold text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    rows={2}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-200 focus:outline-none"
                                    placeholder="Product description..."
                                />
                                {errors.description && (
                                    <p className="mt-0.5 text-xs text-red-600">
                                        {errors.description[0]}
                                    </p>
                                )}
                            </div>

                            {/* Multiple Image Upload */}
                            <div className="sm:col-span-3">
                                <label className="mb-1 block text-xs font-semibold text-gray-700">
                                    Product Images (Max 4)
                                </label>

                                {/* Image Previews Grid */}
                                <div className="grid grid-cols-4 gap-2">
                                    {/* Existing Images */}
                                    {formData.existingImages
                                        .filter(
                                            (img) =>
                                                !formData.deleteImageIds.includes(
                                                    img.id,
                                                ),
                                        )
                                        .map((img) => (
                                            <div
                                                key={img.id}
                                                className="relative h-20 overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-50"
                                            >
                                                <img
                                                    src={img.thumb}
                                                    alt="Product"
                                                    className="h-full w-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            deleteImageIds: [
                                                                ...prev.deleteImageIds,
                                                                img.id,
                                                            ],
                                                        }));
                                                    }}
                                                    className="absolute top-0.5 right-0.5 rounded-full bg-red-500 p-0.5 text-white transition-all hover:bg-red-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}

                                    {/* New Images */}
                                    {formData.imageFiles.map((file, index) => (
                                        <div
                                            key={`new-${index}`}
                                            className="relative h-20 overflow-hidden rounded-lg border-2 border-green-400 bg-gray-50"
                                        >
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        imageFiles:
                                                            prev.imageFiles.filter(
                                                                (_, i) =>
                                                                    i !== index,
                                                            ),
                                                    }));
                                                }}
                                                className="absolute top-0.5 right-0.5 rounded-full bg-red-500 p-0.5 text-white transition-all hover:bg-red-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                            <span className="absolute bottom-0.5 left-0.5 rounded bg-green-500 px-1 py-0.5 text-xs font-semibold text-white">
                                                New
                                            </span>
                                        </div>
                                    ))}

                                    {/* Upload Button */}
                                    {formData.existingImages.length -
                                        formData.deleteImageIds.length +
                                        formData.imageFiles.length <
                                        4 && (
                                        <label className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-rose-500 hover:bg-rose-50">
                                            <Upload className="h-5 w-5 text-gray-400" />
                                            <span className="mt-0.5 text-xs font-medium text-gray-600">
                                                Add
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={(e) => {
                                                    const files = Array.from(
                                                        e.target.files || [],
                                                    );
                                                    const currentCount =
                                                        formData.existingImages
                                                            .length -
                                                        formData.deleteImageIds
                                                            .length +
                                                        formData.imageFiles
                                                            .length;
                                                    const availableSlots =
                                                        4 - currentCount;

                                                    if (
                                                        files.length >
                                                        availableSlots
                                                    ) {
                                                        toast.error(
                                                            `You can only add ${availableSlots} more image(s)`,
                                                        );
                                                        return;
                                                    }

                                                    // Validate files
                                                    const validFiles: File[] =
                                                        [];
                                                    const allowedTypes = [
                                                        'image/jpeg',
                                                        'image/png',
                                                        'image/jpg',
                                                        'image/gif',
                                                        'image/webp',
                                                    ];

                                                    for (const file of files) {
                                                        if (
                                                            file.size >
                                                            50 * 1024 * 1024
                                                        ) {
                                                            toast.error(
                                                                `${file.name}: Image must be less than 50MB`,
                                                            );
                                                            continue;
                                                        }
                                                        if (
                                                            !allowedTypes.includes(
                                                                file.type,
                                                            )
                                                        ) {
                                                            toast.error(
                                                                `${file.name}: Invalid image type`,
                                                            );
                                                            continue;
                                                        }
                                                        validFiles.push(file);
                                                    }

                                                    if (validFiles.length > 0) {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            imageFiles: [
                                                                ...prev.imageFiles,
                                                                ...validFiles,
                                                            ],
                                                        }));
                                                    }

                                                    e.target.value = '';
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>

                                {errors.images && (
                                    <p className="mt-0.5 text-xs text-red-600">
                                        {errors.images[0]}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex justify-end gap-2 border-t border-gray-200 pt-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md transition-all hover:from-rose-700 hover:to-pink-700 hover:shadow-lg focus:ring-1 focus:ring-rose-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting
                                    ? 'Saving...'
                                    : product
                                      ? 'Update Product'
                                      : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
