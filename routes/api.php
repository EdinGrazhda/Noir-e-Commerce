<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ProductsController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\CampaignController;
use App\Http\Controllers\API\BannerController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\DashboardController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Dashboard statistics - Admin only
Route::middleware(['auth:sanctum,web', 'admin'])->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'stats'])->name('api.dashboard.stats');
});

// Products API routes
Route::prefix('products')->group(function () {
    // Public routes - anyone can view products
    Route::get('/', [ProductsController::class, 'index'])->name('api.products.index');
    Route::get('/{id}', [ProductsController::class, 'show'])->name('api.products.show');
    
    // Admin only routes - create, update, delete (supports both web session and sanctum token)
    Route::middleware(['auth:sanctum,web', 'admin'])->group(function () {
        Route::post('/', [ProductsController::class, 'store'])->name('api.products.store');
        Route::put('/{id}', [ProductsController::class, 'update'])->name('api.products.update');
        Route::delete('/{id}', [ProductsController::class, 'destroy'])->name('api.products.destroy');
        Route::post('/bulk-update', [ProductsController::class, 'bulkUpdate'])->name('api.products.bulk-update');
        Route::post('/bulk-delete', [ProductsController::class, 'bulkDelete'])->name('api.products.bulk-delete');
    });
});

// Categories API routes
Route::prefix('categories')->group(function () {
    // Public routes - anyone can view categories
    Route::get('/', [CategoryController::class, 'index'])->name('api.categories.index');
    Route::get('/tree', [CategoryController::class, 'tree'])->name('api.categories.tree');
    Route::get('/{id}', [CategoryController::class, 'show'])->name('api.categories.show');
    
    // Admin only routes - create, update, delete
    Route::middleware(['auth:sanctum,web', 'admin'])->group(function () {
        Route::post('/', [CategoryController::class, 'store'])->name('api.categories.store');
        Route::put('/{id}', [CategoryController::class, 'update'])->name('api.categories.update');
        Route::delete('/{id}', [CategoryController::class, 'destroy'])->name('api.categories.destroy');
    });
});

// Campaigns API routes
Route::prefix('campaigns')->group(function () {
    // Public routes - anyone can view active campaigns
    Route::get('/active', [CampaignController::class, 'active'])->name('api.campaigns.active');
    
    // Admin only routes - full CRUD
    Route::middleware(['auth:sanctum,web', 'admin'])->group(function () {
        Route::get('/', [CampaignController::class, 'index'])->name('api.campaigns.index');
        Route::post('/', [CampaignController::class, 'store'])->name('api.campaigns.store');
        Route::get('/{id}', [CampaignController::class, 'show'])->name('api.campaigns.show');
        Route::put('/{id}', [CampaignController::class, 'update'])->name('api.campaigns.update');
        Route::delete('/{id}', [CampaignController::class, 'destroy'])->name('api.campaigns.destroy');
    });
});

// Banners API routes
Route::prefix('banners')->group(function () {
    // Public routes - anyone can view active banners
    Route::get('/active', [BannerController::class, 'active'])->name('api.banners.active');
    
    // Admin only routes - full CRUD
    Route::middleware(['auth:sanctum,web', 'admin'])->group(function () {
        Route::get('/', [BannerController::class, 'index'])->name('api.banners.index');
        Route::post('/', [BannerController::class, 'store'])->name('api.banners.store');
        Route::get('/{id}', [BannerController::class, 'show'])->name('api.banners.show');
        Route::put('/{id}', [BannerController::class, 'update'])->name('api.banners.update');
        Route::delete('/{id}', [BannerController::class, 'destroy'])->name('api.banners.destroy');
    });
});

// Orders API routes
Route::prefix('orders')->group(function () {
    // Public route - anyone can create an order (customers placing orders)
    Route::post('/', [OrderController::class, 'store'])->name('api.orders.store');
    
    // Admin only routes - view, update, delete orders
    Route::middleware(['auth:sanctum,web', 'admin'])->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('api.orders.index');
        Route::get('/{order}', [OrderController::class, 'show'])->name('api.orders.show');
        Route::put('/{order}', [OrderController::class, 'update'])->name('api.orders.update');
        Route::delete('/{order}', [OrderController::class, 'destroy'])->name('api.orders.destroy');
    });
});

