<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Product extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
        'stock',
        'stock_quantity',
        'foot_numbers',
        'color',
        'category_id',
        'gender',
        'product_id',
        'allows_custom_logo',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'allows_custom_logo' => 'boolean',
    ];

    protected $appends = ['image_url', 'stock_status', 'total_stock', 'all_images'];

    /**
     * Get size-specific stock records
     */
    public function sizeStocks()
    {
        return $this->hasMany(ProductSizeStock::class);
    }

    /**
     * Get total stock across all sizes
     */
    public function getTotalStockAttribute(): int
    {
        return $this->sizeStocks()->sum('quantity');
    }

    /**
     * Get stock status based on total quantity across all sizes
     * 0 = out of stock
     * 1-10 = low stock
     * 11+ = in stock
     */
    public function getStockStatusAttribute(): string
    {
        $total = $this->total_stock;

        if ($total === 0) {
            return 'out of stock';
        } elseif ($total <= 10) {
            return 'low stock';
        }

        return 'in stock';
    }

    /**
     * Get stock quantity for backward compatibility
     */
    public function getStockQuantityAttribute(): int
    {
        return $this->total_stock;
    }

    /**
     * Register media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->useFallbackUrl('/images/default-campaign.jpg')
            ->useFallbackPath(public_path('/images/default-campaign.jpg'))
            ->registerMediaConversions(function (Media $media) {
                // Thumbnail for admin lists (150x150)
                $this->addMediaConversion('thumb')
                    ->width(150)
                    ->height(150)
                    ->sharpen(5)
                    ->format('webp')
                    ->quality(85)
                    ->nonQueued();

                // Preview for product cards (400x400)
                $this->addMediaConversion('preview')
                    ->width(400)
                    ->height(400)
                    ->sharpen(3)
                    ->format('webp')
                    ->quality(98)
                    ->nonQueued();

                // Medium for product details and welcome page (HD 1920x1080)
                $this->addMediaConversion('medium')
                    ->width(1920)
                    ->height(1080)
                    ->sharpen(3)
                    ->format('webp')
                    ->quality(98)
                    ->nonQueued();

                // Optimized full-size for high-quality display (1920x1920 max)
                // This handles 2K/4K images by resizing them to manageable size
                $this->addMediaConversion('optimized')
                    ->width(1920)
                    ->height(1920)
                    ->format('webp')
                    ->sharpen(0)
                    ->quality(98)
                    ->nonQueued();
            });
    }

    /**
     * Get all product images URLs
     */
    public function getAllImagesAttribute()
    {
        $baseUrl = config('app.url');
        return $this->getMedia('images')->map(function ($media) use ($baseUrl) {
            return [
                'id' => $media->id,
                'url' => str_replace($baseUrl, '', $media->getUrl('optimized')), // High quality for modals
                'preview' => str_replace($baseUrl, '', $media->getUrl('preview')), // Medium quality for cards
                'thumb' => str_replace($baseUrl, '', $media->getUrl('thumb')),
                'original' => str_replace($baseUrl, '', $media->getUrl()),
            ];
        })->toArray();
    }

    /**
     * Get the product's image URL (for backward compatibility)
     */
    public function getImageUrlAttribute()
    {
        // If using media library, get first image - use optimized for best quality
        if ($this->hasMedia('images')) {
            $url = $this->getFirstMediaUrl('images', 'optimized');
            // Convert absolute URL to relative URL to work with any domain
            $url = str_replace(config('app.url'), '', $url);
            return $url;
        }

        // Fallback to default campaign image
        return $this->image ?? '/images/default-campaign.jpg';
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItems::class);
    }
}
