<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    /**
     * Display a listing of banners for admin interface.
     */
    public function index(Request $request): Response
    {
        $query = Banner::query();

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('header', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate results
        $perPage = $request->input('per_page', 15);
        $banners = $query->paginate($perPage);

        // Transform the data to include image URLs
        $banners->getCollection()->transform(function ($banner) {
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

        return Inertia::render('admin/banners/index', [
            'banners' => $banners->items(),
            'pagination' => [
                'current_page' => $banners->currentPage(),
                'last_page' => $banners->lastPage(),
                'per_page' => $banners->perPage(),
                'total' => $banners->total(),
                'from' => $banners->firstItem(),
                'to' => $banners->lastItem(),
            ],
            'filters' => [
                'search' => $request->input('search'),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Banners/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
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

        return redirect()->route('admin.banners.index')
            ->with('success', 'Banner created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Banner $banner): Response
    {
        return Inertia::render('Admin/Banners/Show', [
            'banner' => [
                'id' => $banner->id,
                'header' => $banner->header,
                'description' => $banner->description,
                'image_url' => $banner->image_url,
                'has_image' => $banner->has_image,
                'created_at' => $banner->created_at->format('M d, Y H:i'),
                'updated_at' => $banner->updated_at->format('M d, Y H:i'),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Banner $banner): Response
    {
        return Inertia::render('Admin/Banners/Edit', [
            'banner' => [
                'id' => $banner->id,
                'header' => $banner->header,
                'description' => $banner->description,
                'image_url' => $banner->image_url,
                'has_image' => $banner->has_image,
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Banner $banner): RedirectResponse
    {
        $validated = $request->validate([
            'header' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:51200', // 50MB limit
            'remove_image' => 'boolean'
        ]);

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

        // Update banner fields
        $banner->update([
            'header' => $validated['header'],
            'description' => $validated['description'] ?? null,
            'image_path' => $banner->image_path,
        ]);

        return redirect()->route('admin.banners.index')
            ->with('success', 'Banner updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Banner $banner): RedirectResponse
    {
        // Delete the image file before deleting the banner
        $banner->deleteImage();
        
        $banner->delete();

        return redirect()->route('admin.banners.index')
            ->with('success', 'Banner deleted successfully!');
    }
}
