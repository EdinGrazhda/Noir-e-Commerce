<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Exception;

class BannerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $banners = Banner::orderBy('created_at', 'desc')->get()->map(function ($banner) {
                return [
                    'id' => $banner->id,
                    'header' => $banner->header,
                    'description' => $banner->description,
                    'image_url' => $banner->image_url,
                    'has_image' => $banner->has_image,
                    'created_at' => $banner->created_at,
                    'updated_at' => $banner->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $banners,
                'message' => 'Banners retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve banners.'
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'header' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:51200', // 50MB limit
            ]);

            $imagePath = null;

            // Handle image upload if provided
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('banners', 'public');
            }

            $banner = Banner::create([
                'header' => $validated['header'],
                'description' => $validated['description'] ?? null,
                'image_path' => $imagePath,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $banner->id,
                    'header' => $banner->header,
                    'description' => $banner->description,
                    'image_url' => $banner->image_url,
                    'has_image' => $banner->has_image,
                    'created_at' => $banner->created_at,
                    'updated_at' => $banner->updated_at,
                ],
                'message' => 'Banner created successfully'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create banner: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $banner = Banner::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $banner->id,
                    'header' => $banner->header,
                    'description' => $banner->description,
                    'image_url' => $banner->image_url,
                    'has_image' => $banner->has_image,
                    'created_at' => $banner->created_at,
                    'updated_at' => $banner->updated_at,
                ],
                'message' => 'Banner retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Banner not found'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $banner = Banner::findOrFail($id);

            $validated = $request->validate([
                'header' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:51200', // 50MB limit
                'remove_image' => 'boolean'
            ]);

            // Update banner fields
            if (isset($validated['header'])) {
                $banner->header = $validated['header'];
            }
            if ($request->has('description')) {
                $banner->description = $validated['description'];
            }

            $banner->save();

            // Handle image removal
            if ($request->boolean('remove_image')) {
                $banner->deleteImage();
                $banner->image_path = null;
            }

            // Handle new image upload
            if ($request->hasFile('image')) {
                // Delete old image first
                $banner->deleteImage();
                
                // Upload new image
                $imagePath = $request->file('image')->store('banners', 'public');
                $banner->image_path = $imagePath;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $banner->id,
                    'header' => $banner->header,
                    'description' => $banner->description,
                    'image_url' => $banner->image_url,
                    'has_image' => $banner->has_image,
                    'created_at' => $banner->created_at,
                    'updated_at' => $banner->updated_at,
                ],
                'message' => 'Banner updated successfully'
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update banner: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $banner = Banner::findOrFail($id);

            // Delete the image file before deleting the banner
            $banner->deleteImage();
            
            $banner->delete();

            return response()->json([
                'success' => true,
                'message' => 'Banner deleted successfully'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete banner: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active banners for frontend display
     */
    public function active(): JsonResponse
    {
        try {
            $banners = Banner::whereNotNull('image_path')
                ->orderBy('created_at', 'desc')
                ->take(5) // Limit to 5 most recent banners
                ->get()
                ->map(function ($banner) {
                    return [
                        'id' => $banner->id,
                        'header' => $banner->header,
                        'description' => $banner->description,
                        'image_url' => $banner->image_url,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $banners,
                'message' => 'Active banners retrieved successfully'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve active banners: ' . $e->getMessage()
            ], 500);
        }
    }
}