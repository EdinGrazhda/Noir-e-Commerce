export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    originalPrice?: number; // Original price if product is on campaign
    image: string;
    rating?: number; // Made optional since we're removing ratings
    stock: string; // Changed from number to string - can be 'in stock', 'low stock', 'out of stock'
    foot_numbers?: string; // Available sizes as comma-separated string
    sizeStocks?: Record<string, { quantity: number; stock_status?: string }>; // Size-specific stock with quantity and status
    selectedSize?: string; // Selected size when adding to cart
    color?: string;
    gender?: 'male' | 'female' | 'unisex';
    categories: Category[];
    created_at: string;
    hasActiveCampaign?: boolean; // Flag to indicate if product has an active campaign
    campaign_id?: number; // Campaign ID if product is on campaign
    campaign_name?: string; // Campaign name if product is on campaign
    campaign_end_date?: string; // Campaign end date for countdown timer
    allows_custom_logo?: boolean; // Allow customers to upload custom logos
}

export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
    customLogoDataUrl?: string; // Base64 data URL of uploaded logo
}

export interface Filters {
    search: string;
    categories: number[];
    priceMin: number;
    priceMax: number;
    gender: string[];
    sortBy: 'newest' | 'price-asc' | 'price-desc' | 'rating';
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
