import { Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Banner {
    id: number;
    header: string;
    description?: string;
    image_url?: string;
    has_image: boolean;
}

interface BannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    banner?: Banner | null;
    onSave: () => void;
}

export function BannerModal({
    isOpen,
    onClose,
    banner,
    onSave,
}: BannerModalProps) {
    const [formData, setFormData] = useState({
        header: '',
        description: '',
        image: null as File | null,
        remove_image: false,
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Reset form when modal opens/closes or banner changes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                header: banner?.header || '',
                description: banner?.description || '',
                image: null,
                remove_image: false,
            });
            setPreviewUrl(banner?.image_url || null);
        }
    }, [isOpen, banner]);

    if (!isOpen) return null;

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (50MB)
            if (file.size > 50 * 1024 * 1024) {
                toast.error('Image size must be less than 50MB');
                return;
            }

            // Validate file type
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/jpg',
                'image/gif',
                'image/webp',
            ];
            if (!allowedTypes.includes(file.type)) {
                toast.error(
                    'Please select a valid image file (JPEG, PNG, JPG, GIF, WebP)',
                );
                return;
            }

            setFormData((prev) => ({
                ...prev,
                image: file,
                remove_image: false,
            }));

            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setFormData((prev) => ({
            ...prev,
            image: null,
            remove_image: true,
        }));
        setPreviewUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.header.trim()) {
            toast.error('Header is required');
            return;
        }

        setIsLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('header', formData.header);
            formDataToSend.append('description', formData.description);

            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            if (formData.remove_image) {
                formDataToSend.append('remove_image', '1');
            }

            // For Laravel, when updating with FormData, we need to use POST with _method override
            const url = banner ? `/api/banners/${banner.id}` : '/api/banners';
            let method = 'POST';

            // Add method override for Laravel to handle PUT requests with FormData
            if (banner) {
                formDataToSend.append('_method', 'PUT');
            }

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
                body: formDataToSend,
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Banner save response:', result);
                toast.success(
                    banner
                        ? 'Banner updated successfully!'
                        : 'Banner created successfully!',
                );
                onSave();
            } else {
                const errorData = await response.json();
                console.error('Banner save error:', errorData);
                const errorMessage =
                    errorData.message || 'Something went wrong';
                toast.error(errorMessage);

                if (errorData.errors) {
                    Object.values(errorData.errors).forEach((errors: any) => {
                        errors.forEach((error: string) => toast.error(error));
                    });
                }
            }
        } catch (error) {
            console.error('Error saving banner:', error);
            toast.error('Network error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            header: banner?.header || '',
            description: banner?.description || '',
            image: null,
            remove_image: false,
        });
        setPreviewUrl(banner?.image_url || null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">
                            {banner ? 'Edit Banner' : 'Create New Banner'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="rounded-lg bg-white/20 p-2 text-white transition-all duration-200 hover:bg-white/30"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="space-y-6">
                        {/* Header Input */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Header *
                            </label>
                            <input
                                type="text"
                                name="header"
                                value={formData.header}
                                onChange={handleInputChange}
                                placeholder="Enter banner header..."
                                className="w-full rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none"
                                required
                            />
                        </div>

                        {/* Description Input */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter banner description..."
                                rows={3}
                                className="w-full resize-none rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Banner Image
                            </label>

                            {previewUrl ? (
                                <div className="space-y-4">
                                    <div className="relative overflow-hidden rounded-xl border-2 border-gray-300">
                                        <img
                                            src={previewUrl}
                                            alt="Banner preview"
                                            className="h-48 w-full object-cover"
                                            onError={(e) => {
                                                console.error(
                                                    'Error loading image preview:',
                                                    e,
                                                );
                                                setPreviewUrl(null);
                                                toast.error(
                                                    'Failed to load image preview',
                                                );
                                            }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 hover:opacity-100">
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="replace-image"
                                        />
                                        <label
                                            htmlFor="replace-image"
                                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 transition-colors duration-200 hover:bg-blue-200"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Replace Image
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    />
                                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-all duration-200 hover:border-blue-500 hover:bg-blue-50">
                                        <Upload className="mb-4 h-12 w-12 text-gray-400" />
                                        <p className="mb-2 text-sm font-semibold text-gray-700">
                                            Click to upload image
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            JPEG, PNG, JPG, GIF, WebP up to 8MB
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    resetForm();
                                    onClose();
                                }}
                                className="flex-1 rounded-2xl border-2 border-gray-300 bg-white px-6 py-4 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:from-blue-600 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isLoading
                                    ? 'Saving...'
                                    : banner
                                      ? 'Update Banner'
                                      : 'Create Banner'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
