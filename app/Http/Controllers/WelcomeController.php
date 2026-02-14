<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    /**
     * Display the welcome page with SSR data.
     */
    public function index(): Response
    {
        // Fetch initial products for SSR (40 products for better initial load)
        $products = Product::with([
                'category:id,name,slug',
                'sizeStocks:id,product_id,size,quantity',
                'media'
            ])
            ->select([
                'id',
                'name',
                'description',
                'price',
                'image',
                'stock_quantity',
                'foot_numbers',
                'color',
                'gender',
                'category_id',
                'created_at',
                'product_id',
                'allows_custom_logo'
            ])
            ->orderBy('created_at', 'desc')
            ->paginate(40);

        // Fetch active campaigns in bulk to avoid N+1 queries
        $productIds = $products->pluck('id')->toArray();
        $activeCampaigns = Campaign::whereIn('product_id', $productIds)
            ->where('is_active', true)
            ->where('start_date', '<=', today())
            ->where('end_date', '>=', today())
            ->get()
            ->keyBy('product_id');

        // Transform products data with campaign prices and formatted size stocks
        $products->getCollection()->transform(function ($product) use ($activeCampaigns) {
            // Add campaign price if product is in an active campaign
            if (isset($activeCampaigns[$product->id])) {
                $activeCampaign = $activeCampaigns[$product->id];
                $product->campaign_price = $activeCampaign->price;
                $product->campaign_id = $activeCampaign->id;
                $product->campaign_name = $activeCampaign->name;
                $product->campaign_end_date = $activeCampaign->end_date;
            }

            // Add media library image URL (uses accessor from Product model)
            $product->image_url = $product->image_url;
            
            // Ensure allows_custom_logo is included
            $product->allows_custom_logo = (bool) $product->allows_custom_logo;

            // Format sizeStocks as key-value object for frontend
            // Only include sizes with stock > 0
            if ($product->relationLoaded('sizeStocks') && $product->sizeStocks->count() > 0) {
                $formattedSizeStocks = $product->sizeStocks
                    ->filter(fn($stock) => $stock->quantity > 0)
                    ->mapWithKeys(function ($sizeStock) {
                        return [$sizeStock->size => [
                            'quantity' => $sizeStock->quantity
                        ]];
                    })
                    ->toArray();
                
                $product->sizeStocks = $formattedSizeStocks ?: null;
            } else {
                $product->sizeStocks = null;
            }

            return $product;
        });

        // Fetch categories for filters
        $categories = Category::select(['id', 'name', 'slug'])->get();

        // Fetch active campaigns with their product for display
        $campaigns = Campaign::with([
                'product' => function($query) {
                    $query->with([
                            'category:id,name,slug',
                            'sizeStocks:id,product_id,size,quantity'
                        ])
                        ->select([
                            'id',
                            'name',
                            'description',
                            'price',
                            'image',
                            'stock_quantity',
                            'foot_numbers',
                            'color',
                            'gender',
                            'category_id',
                            'created_at',
                            'product_id',
                            'allows_custom_logo'
                        ]);
                }
            ])
            ->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->get();

        // Return Inertia response with SSR data
        return Inertia::render('welcome', [
            'initialProducts' => $products,
            'categories' => $categories,
            'campaigns' => $campaigns,
        ]);
    }
}
