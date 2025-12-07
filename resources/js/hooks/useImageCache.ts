import { useEffect, useState } from 'react';

interface ImageCacheEntry {
    url: string;
    dataUrl?: string;
    timestamp: number;
}

const CACHE_KEY = 'andshoes_image_cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CACHE_SIZE = 50; // Store up to 50 images

class ImageCache {
    private cache: Map<string, ImageCacheEntry>;
    private isInitialized = false;

    constructor() {
        this.cache = new Map();
    }

    init() {
        if (this.isInitialized) return;
        
        try {
            const stored = localStorage.getItem(CACHE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                const now = Date.now();
                
                // Filter out expired entries
                Object.entries(parsed).forEach(([url, entry]: [string, any]) => {
                    if (now - entry.timestamp < CACHE_EXPIRY) {
                        this.cache.set(url, entry);
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to load image cache:', error);
        }
        
        this.isInitialized = true;
    }

    get(url: string): ImageCacheEntry | undefined {
        return this.cache.get(url);
    }

    set(url: string, dataUrl?: string) {
        // Limit cache size
        if (this.cache.size >= MAX_CACHE_SIZE) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }

        this.cache.set(url, {
            url,
            dataUrl,
            timestamp: Date.now(),
        });

        this.persist();
    }

    private persist() {
        try {
            const obj: Record<string, ImageCacheEntry> = {};
            this.cache.forEach((value, key) => {
                obj[key] = value;
            });
            localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
        } catch (error) {
            console.warn('Failed to persist image cache:', error);
        }
    }

    preload(urls: string[]) {
        urls.forEach((url) => {
            if (!this.cache.has(url)) {
                const img = new Image();
                img.src = url;
                img.onload = () => this.set(url);
            }
        });
    }
}

const imageCache = new ImageCache();

/**
 * Hook to cache and preload images for better performance
 * Images are stored in browser cache and localStorage for instant display on repeat visits
 */
export function useImageCache(imageUrl: string, priority: boolean = false) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [cachedUrl, setCachedUrl] = useState<string | undefined>();

    useEffect(() => {
        imageCache.init();

        // Check if image is in cache
        const cached = imageCache.get(imageUrl);
        if (cached) {
            setCachedUrl(cached.dataUrl || imageUrl);
            setIsLoaded(true);
            return;
        }

        // Load image
        const img = new Image();
        
        // Priority images load immediately, others load lazily
        if (priority) {
            img.fetchPriority = 'high';
        }

        img.onload = () => {
            imageCache.set(imageUrl);
            setCachedUrl(imageUrl);
            setIsLoaded(true);
        };

        img.onerror = () => {
            setIsLoaded(true);
        };

        img.src = imageUrl;

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [imageUrl, priority]);

    return { isLoaded, cachedUrl: cachedUrl || imageUrl };
}

/**
 * Preload images for the next page or visible products
 */
export function useImagePreloader(imageUrls: string[]) {
    useEffect(() => {
        if (imageUrls.length === 0) return;

        imageCache.init();
        
        // Preload in the background after a short delay
        const timer = setTimeout(() => {
            imageCache.preload(imageUrls);
        }, 100);

        return () => clearTimeout(timer);
    }, [imageUrls]);
}
