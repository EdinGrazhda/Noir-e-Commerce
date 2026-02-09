<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CampaignController extends Controller
{
    /**
     * Display a listing of campaigns with filters and pagination
     */
    public function index(Request $request)
    {
        $query = Campaign::with('product');

        // Search filter
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        // Product filter
        if ($request->has('product_id') && $request->product_id) {
            $query->where('product_id', $request->product_id);
        }

        // Active status filter
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->is_active);
        }

        // Sorting
        $allowedSortFields = ['created_at', 'name', 'start_date', 'end_date', 'price', 'is_active'];
        $sortBy = in_array($request->get('sort_by'), $allowedSortFields) ? $request->get('sort_by') : 'created_at';
        $sortOrder = $request->get('sort_order') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $campaigns = $query->paginate(10);

        return response()->json([
            'campaigns' => $campaigns->items(),
            'pagination' => [
                'current_page' => $campaigns->currentPage(),
                'last_page' => $campaigns->lastPage(),
                'per_page' => $campaigns->perPage(),
                'total' => $campaigns->total(),
                'from' => $campaigns->firstItem(),
                'to' => $campaigns->lastItem(),
            ],
        ]);
    }

    /**
     * Store a newly created campaign
     */
    public function store(Request $request)
    {
        Log::info('Campaign Store Request:', $request->all());

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'product_id' => 'required|exists:products,id',
            'banner_image' => 'nullable|string|max:500',
            'banner_color' => 'nullable|string|max:20',
            'is_active' => 'nullable|boolean',
        ], [
            'name.required' => 'Campaign name is required.',
            'price.required' => 'Campaign price is required.',
            'price.numeric' => 'Price must be a valid number.',
            'start_date.required' => 'Start date is required.',
            'end_date.required' => 'End date is required.',
            'end_date.after_or_equal' => 'End date must be after or equal to start date.',
            'product_id.required' => 'Please select a product.',
            'product_id.exists' => 'Selected product does not exist.',
        ]);

        if ($validator->fails()) {
            Log::error('Campaign Validation Failed:', $validator->errors()->toArray());

            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Verify product exists and get its price for validation
            $product = Product::findOrFail($request->product_id);
            Log::info('Product found:', ['id' => $product->id, 'price' => $product->price]);

            if ($request->price >= $product->price) {
                Log::warning('Campaign price validation failed');

                return response()->json([
                    'message' => 'Campaign price must be lower than the original product price.',
                    'errors' => [
                        'price' => ['Campaign price must be lower than $'.$product->price],
                    ],
                ], 422);
            }

            $campaign = Campaign::create([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'product_id' => $request->product_id,
                'banner_image' => $request->banner_image,
                'banner_color' => $request->banner_color ?? '#ef4444',
                'is_active' => $request->is_active ?? true,
            ]);

            Log::info('Campaign created successfully:', ['id' => $campaign->id]);

            // Load the product relationship
            $campaign->load('product');

            return response()->json([
                'message' => 'Campaign created successfully!',
                'campaign' => $campaign,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Campaign creation error:', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error creating campaign',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Display the specified campaign
     */
    public function show($id)
    {
        try {
            $campaign = Campaign::with('product')->findOrFail($id);

            return response()->json([
                'campaign' => $campaign,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Campaign not found',
            ], 404);
        }
    }

    /**
     * Update the specified campaign
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'product_id' => 'required|exists:products,id',
            'banner_image' => 'nullable|string|max:500',
            'banner_color' => 'nullable|string|max:20',
            'is_active' => 'nullable|boolean',
        ], [
            'name.required' => 'Campaign name is required.',
            'price.required' => 'Campaign price is required.',
            'price.numeric' => 'Price must be a valid number.',
            'start_date.required' => 'Start date is required.',
            'end_date.required' => 'End date is required.',
            'end_date.after_or_equal' => 'End date must be after or equal to start date.',
            'product_id.required' => 'Please select a product.',
            'product_id.exists' => 'Selected product does not exist.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $campaign = Campaign::findOrFail($id);

            // Verify product exists and get its price for validation
            $product = Product::findOrFail($request->product_id);

            // Validate that campaign price is less than product price
            if ($request->price >= $product->price) {
                return response()->json([
                    'message' => 'Campaign price must be lower than the original product price.',
                    'errors' => [
                        'price' => ['Campaign price must be lower than $'.$product->price],
                    ],
                ], 422);
            }

            $campaign->update([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'product_id' => $request->product_id,
                'banner_image' => $request->banner_image,
                'banner_color' => $request->banner_color ?? '#ef4444',
                'is_active' => $request->is_active ?? true,
            ]);

            // Load the product relationship
            $campaign->load('product');

            return response()->json([
                'message' => 'Campaign updated successfully!',
                'campaign' => $campaign,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating campaign',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Remove the specified campaign
     */
    public function destroy($id)
    {
        try {
            $campaign = Campaign::findOrFail($id);
            $campaign->delete();

            return response()->json([
                'message' => 'Campaign deleted successfully!',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting campaign',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get all active campaigns with their products
     */
    public function active()
    {
        try {
            $campaigns = Campaign::with(['product' => function ($query) {
                $query->with(['category', 'sizeStocks', 'media']);
            }])
                ->where('is_active', true)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->orderBy('start_date', 'desc')
                ->get()
                ->map(function ($campaign) {
                    // Convert to array to properly format sizeStocks
                    $campaignData = $campaign->toArray();

                    // Format sizeStocks for the product if it exists
                    if (isset($campaignData['product']['size_stocks']) && is_array($campaignData['product']['size_stocks'])) {
                        $formattedSizeStocks = [];
                        foreach ($campaignData['product']['size_stocks'] as $sizeStock) {
                            $formattedSizeStocks[$sizeStock['size']] = [
                                'quantity' => $sizeStock['quantity'],
                                'stock_status' => $sizeStock['quantity'] === 0 ? 'out of stock' :
                                    ($sizeStock['quantity'] <= 10 ? 'low stock' : 'in stock'),
                            ];
                        }
                        $campaignData['product']['sizeStocks'] = $formattedSizeStocks;
                        // Remove the old size_stocks array format
                        unset($campaignData['product']['size_stocks']);
                    }

                    // Ensure sizeStocks exists even if transformation didn't happen
                    if (! isset($campaignData['product']['sizeStocks']) && isset($campaignData['product']['size_stocks'])) {
                        $formattedSizeStocks = [];
                        foreach ($campaignData['product']['size_stocks'] as $sizeStock) {
                            $formattedSizeStocks[$sizeStock['size']] = [
                                'quantity' => $sizeStock['quantity'],
                                'stock_status' => $sizeStock['quantity'] === 0 ? 'out of stock' :
                                    ($sizeStock['quantity'] <= 10 ? 'low stock' : 'in stock'),
                            ];
                        }
                        $campaignData['product']['sizeStocks'] = $formattedSizeStocks;
                        unset($campaignData['product']['size_stocks']);
                    }

                    return $campaignData;
                });

            return response()->json([
                'data' => $campaigns,
                'message' => 'Active campaigns retrieved successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching active campaigns: '.$e->getMessage());

            return response()->json([
                'data' => [],
                'message' => 'Error fetching active campaigns',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
