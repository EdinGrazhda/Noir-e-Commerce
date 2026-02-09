<?php

use App\Http\Controllers\BannerController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [WelcomeController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('admin/products', [ProductsController::class, 'index'])->name('admin.products.index');
    Route::get('admin/campaigns', [CampaignController::class, 'index'])->name('admin.campaigns.index');
    Route::get('admin/orders', [OrderController::class, 'index'])->name('admin.orders.index');
    Route::get('admin/categories', [CategoryController::class, 'index'])->name('admin.categories.index');

    // Banner admin routes
    Route::resource('admin/banners', BannerController::class)->names([
        'index' => 'admin.banners.index',
        'create' => 'admin.banners.create',
        'store' => 'admin.banners.store',
        'show' => 'admin.banners.show',
        'edit' => 'admin.banners.edit',
        'update' => 'admin.banners.update',
        'destroy' => 'admin.banners.destroy',
    ]);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
