<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductSizeStock;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ProductsController extends Controller
{
    /**
     * Display a listing of the products with filtering, sorting, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Product::with(['category', 'sizeStocks', 'media']);

            // Apply filters
            if ($request->has('search') && ! empty($request->search)) {
                $query->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('description', 'like', '%'.$request->search.'%');
            }

            if ($request->has('category') && ! empty($request->category)) {
                $query->where('category_id', $request->category);
            }

            if ($request->has('price_min') && is_numeric($request->price_min)) {
                $query->where('price', '>=', $request->price_min);
            }

            if ($request->has('price_max') && is_numeric($request->price_max)) {
                $query->where('price', '<=', $request->price_max);
            }

            if ($request->has('stock') && ! empty($request->stock)) {
                $query->where('stock', $request->stock);
            }

            if ($request->has('color') && ! empty($request->color)) {
                $query->where('color', 'like', '%'.$request->color.'%');
            }

            if ($request->has('foot_numbers') && ! empty($request->foot_numbers)) {
                $query->where('foot_numbers', 'like', '%'.$request->foot_numbers.'%');
            }

            if ($request->has('gender') && ! empty($request->gender)) {
                if (is_array($request->gender)) {
                    $query->whereIn('gender', $request->gender);
                } else {
                    $query->where('gender', $request->gender);
                }
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            // Handle frontend sorting format
            if ($sortBy === 'price-asc') {
                $sortBy = 'price';
                $sortOrder = 'asc';
            } elseif ($sortBy === 'price-desc') {
                $sortBy = 'price';
                $sortOrder = 'desc';
            } elseif ($sortBy === 'rating') {
                $sortBy = 'created_at'; // Since we don't have rating, use created_at
                $sortOrder = 'desc';
            } elseif ($sortBy === 'newest') {
                $sortBy = 'created_at';
                $sortOrder = 'desc';
            }

            $allowedSortFields = ['name', 'price', 'stock', 'color', 'created_at'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            // Handle multiple categories filter
            if ($request->has('category') && is_array($request->category)) {
                $query->whereIn('category_id', $request->category);
            }

            // Pagination
            $perPage = min($request->get('per_page', 20), 100); // Max 100 items per page
            $products = $query->paginate($perPage);

            // Add campaign prices to products and format sizeStocks
            $products->getCollection()->transform(function ($product) {
                $activeCampaign = \App\Models\Campaign::where('product_id', $product->id)
                    ->where('is_active', true)
                    ->where('start_date', '<=', now())
                    ->where('end_date', '>=', now())
                    ->first();

                if ($activeCampaign) {
                    $product->campaign_price = $activeCampaign->price;
                    $product->campaign_id = $activeCampaign->id;
                    $product->campaign_name = $activeCampaign->name;
                    $product->campaign_end_date = $activeCampaign->end_date;
                }

                // Add media library image URL and all images
                $product->image_url = $product->image_url; // Uses accessor from model
                $product->all_images = $product->all_images; // Get all images array

                // Format sizeStocks as key-value object for frontend
                if ($product->relationLoaded('sizeStocks') && $product->sizeStocks->count() > 0) {
                    $formattedSizeStocks = $product->sizeStocks->mapWithKeys(function ($sizeStock) {
                        return [$sizeStock->size => [
                            'quantity' => $sizeStock->quantity,
                            'stock_status' => $sizeStock->stock_status,
                        ]];
                    })->toArray();
                    $product->sizeStocks = $formattedSizeStocks;
                } else {
                    $product->sizeStocks = null; // No size-specific stock
                }

                return $product;
            });

            // Return paginated data in the format expected by frontend
            return response()->json($products, 200);

        } catch (Exception $e) {
            Log::error('Error fetching products: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve products',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:products',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0|max:999999.99',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:51200',
                'images' => 'nullable|array|max:4',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:51200',
                'stock' => 'nullable|integer|min:0',
                'size_stocks' => 'nullable|string',
                'foot_numbers' => 'nullable|string|max:255',
                'color' => 'nullable|string|max:255',
                'category_id' => 'required|exists:categories,id',
                'gender' => 'required|string|in:male,female,unisex',
                'product_id' => 'nullable|string|max:255|unique:products',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            DB::beginTransaction();

            $product = Product::create([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'image' => null,
                'stock_quantity' => $request->stock ?? 0,
                'foot_numbers' => $request->foot_numbers,
                'color' => $request->color,
                'category_id' => $request->category_id,
                'gender' => $request->gender,
                'product_id' => $request->product_id ?? null,
            ]);

            // NOTE: media files will be handled AFTER commit below to ensure
            // conversions and media records are fully available when returning
            // the response (avoids race conditions with transactions).

            // Handle size-specific stocks
            if ($request->has('size_stocks') && ! empty($request->size_stocks)) {
                $sizeStocksData = json_decode($request->size_stocks, true);
                if (is_array($sizeStocksData)) {
                    foreach ($sizeStocksData as $size => $data) {
                        if (isset($data['quantity']) && $data['quantity'] > 0) {
                            ProductSizeStock::create([
                                'product_id' => $product->id,
                                'size' => $size,
                                'quantity' => $data['quantity'],
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            // After commit, process any uploaded media so conversions are generated
            if ($request->hasFile('images')) {
                $images = $request->file('images');
                foreach (array_slice($images, 0, 4) as $image) {
                    $product->addMedia($image)
                        ->toMediaCollection('images');
                }
            } elseif ($request->hasFile('image')) {
                // Backward compatibility with single image upload
                $product->addMediaFromRequest('image')
                    ->toMediaCollection('images');
            }

            $product->load(['category', 'sizeStocks', 'media']);

            // Format response with sizeStocks as associative array and include media
            $productData = $product->toArray();
            $productData['sizeStocks'] = $product->sizeStocks->mapWithKeys(function ($stock) {
                return [$stock->size => [
                    'quantity' => $stock->quantity,
                    'stock_status' => $stock->stock_status,
                ]];
            })->toArray();

            // Include media urls so frontend has immediate access
            $productData['all_images'] = $product->all_images;
            $productData['image_url'] = $product->image_url;

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => $productData,
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error creating product: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create product',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Display the specified product.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $product = Product::with(['category', 'sizeStocks', 'media'])->find($id);

            if (! $product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found',
                ], 404);
            }

            // Format product data with sizeStocks as object
            $productData = $product->toArray();

            // Format sizeStocks as key-value object for frontend
            if (isset($productData['size_stocks']) && count($productData['size_stocks']) > 0) {
                $formattedSizeStocks = [];
                foreach ($productData['size_stocks'] as $sizeStock) {
                    $formattedSizeStocks[$sizeStock['size']] = [
                        'quantity' => $sizeStock['quantity'],
                        'stock_status' => $sizeStock['stock_status'] ?? 'in stock',
                    ];
                }
                $productData['sizeStocks'] = $formattedSizeStocks;
            } else {
                $productData['sizeStocks'] = null;
            }

            // Remove the size_stocks array format
            unset($productData['size_stocks']);

            return response()->json([
                'success' => true,
                'message' => 'Product retrieved successfully',
                'data' => $productData,
            ], 200);

        } catch (Exception $e) {
            Log::error('Error fetching product: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'product_id' => $id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve product',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $product = Product::find($id);

            if (! $product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found',
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255|unique:products,name,'.$id,
                'description' => 'sometimes|nullable|string',
                'price' => 'sometimes|required|numeric|min:0|max:999999.99',
                'image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif,webp|max:51200',
                'images' => 'sometimes|nullable|array|max:4',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:51200',
                'delete_images' => 'sometimes|nullable|array',
                'delete_images.*' => 'integer',
                'stock' => 'sometimes|nullable|integer|min:0',
                'size_stocks' => 'sometimes|nullable|string',
                'foot_numbers' => 'sometimes|nullable|string|max:255',
                'color' => 'sometimes|nullable|string|max:255',
                'category_id' => 'sometimes|required|exists:categories,id',
                'gender' => 'sometimes|required|string|in:male,female,unisex',
                'product_id' => 'sometimes|nullable|string|max:255|unique:products,product_id,'.$id,
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            DB::beginTransaction();

            // Map stock input to stock_quantity
            $updateData = $request->only(['name', 'description', 'price', 'foot_numbers', 'color', 'category_id', 'gender', 'product_id']);
            if ($request->has('stock')) {
                $updateData['stock_quantity'] = $request->stock;
            }
            $product->update($updateData);

            // We'll process deletions/uploads after the transaction commits.

            // Handle size-specific stocks update
            if ($request->has('size_stocks')) {
                // Delete existing size stocks
                $product->sizeStocks()->delete();

                // Create new size stocks
                if (! empty($request->size_stocks)) {
                    $sizeStocksData = json_decode($request->size_stocks, true);
                    if (is_array($sizeStocksData)) {
                        foreach ($sizeStocksData as $size => $data) {
                            if (isset($data['quantity']) && $data['quantity'] > 0) {
                                ProductSizeStock::create([
                                    'product_id' => $product->id,
                                    'size' => $size,
                                    'quantity' => $data['quantity'],
                                ]);
                            }
                        }
                    }
                }
            }

            DB::commit();

            // Process image deletions (if any) AFTER commit so deletes are final
            if ($request->has('delete_images') && is_array($request->delete_images)) {
                foreach ($request->delete_images as $mediaId) {
                    $media = $product->getMedia('images')->where('id', $mediaId)->first();
                    if ($media) {
                        $media->delete();
                    }
                }
            }

            // Process uploaded images AFTER commit to ensure conversions run and
            // media records are visible when we refresh and return the product.
            if ($request->hasFile('images')) {
                $currentImageCount = $product->getMedia('images')->count();
                $remainingSlots = 4 - $currentImageCount;

                if ($remainingSlots > 0) {
                    $images = $request->file('images');
                    foreach (array_slice($images, 0, $remainingSlots) as $image) {
                        $product->addMedia($image)
                            ->toMediaCollection('images');
                    }
                }
            } elseif ($request->hasFile('image')) {
                // Backward compatibility with single image upload
                $currentImageCount = $product->getMedia('images')->count();
                if ($currentImageCount < 4) {
                    $product->addMediaFromRequest('image')
                        ->toMediaCollection('images');
                }
            }

            // Clear cached media relations and refresh the product
            $product->unsetRelation('media');
            $product->refresh();
            $product->load(['category', 'sizeStocks', 'media']);

            // Format response with sizeStocks as associative array
            $productData = $product->toArray();
            $productData['sizeStocks'] = $product->sizeStocks->mapWithKeys(function ($stock) {
                return [$stock->size => [
                    'quantity' => $stock->quantity,
                    'stock_status' => $stock->stock_status,
                ]];
            })->toArray();

            // Force include all_images with fresh data
            $productData['all_images'] = $product->all_images;
            $productData['image_url'] = $product->image_url;

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => $productData,
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error updating product: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'product_id' => $id,
                'request' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update product',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $product = Product::find($id);

            if (! $product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found',
                ], 404);
            }

            $product->delete();

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully',
            ], 200);

        } catch (Exception $e) {
            Log::error('Error deleting product: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'product_id' => $id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Bulk delete products.
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_ids' => 'required|array|min:1',
                'product_ids.*' => 'exists:products,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $deletedCount = Product::whereIn('id', $request->product_ids)->delete();

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} products",
                'deleted_count' => $deletedCount,
            ], 200);

        } catch (Exception $e) {
            Log::error('Error bulk deleting products: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete products',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Update product stock status.
     */
    public function updateStock(Request $request, string $id): JsonResponse
    {
        try {
            $product = Product::find($id);

            if (! $product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found',
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'stock' => 'nullable|integer|min:0',
                'size_stocks' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            DB::beginTransaction();

            // Update stock_quantity if provided
            if ($request->has('stock')) {
                $product->update(['stock_quantity' => $request->stock]);
            }

            // Handle size-specific stocks update
            if ($request->has('size_stocks')) {
                // Delete existing size stocks
                $product->sizeStocks()->delete();

                // Create new size stocks
                if (! empty($request->size_stocks)) {
                    $sizeStocksData = json_decode($request->size_stocks, true);
                    if (is_array($sizeStocksData)) {
                        foreach ($sizeStocksData as $size => $data) {
                            if (isset($data['quantity']) && $data['quantity'] > 0) {
                                ProductSizeStock::create([
                                    'product_id' => $product->id,
                                    'size' => $size,
                                    'quantity' => $data['quantity'],
                                ]);
                            }
                        }
                    }
                }
            }

            DB::commit();

            $product->load('sizeStocks');

            return response()->json([
                'success' => true,
                'message' => 'Product stock updated successfully',
                'data' => $product,
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error updating product stock: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'product_id' => $id,
                'request' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update product stock',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
