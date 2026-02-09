<?php

use App\Models\Product;
use App\Models\Category;
use App\Models\Banner;
use App\Models\Campaign;

it('loads the homepage successfully', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});

it('homepage returns products data', function () {
    $category = Category::create([
        'name' => 'Test Category',
        'slug' => 'test-category',
        'is_active' => true,
    ]);

    $product = Product::create([
        'name' => 'Test Product',
        'description' => 'A test product',
        'price' => 29.99,
        'stock_quantity' => 10,
        'category_id' => $category->id,
    ]);

    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) =>
        $page->component('welcome')
            ->has('initialProducts')
    );
});

it('loads the public products API', function () {
    $response = $this->getJson('/api/products');

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'data',
    ]);
});

it('can view a single product via API', function () {
    $category = Category::create([
        'name' => 'Shoes',
        'slug' => 'shoes',
        'is_active' => true,
    ]);

    $product = Product::create([
        'name' => 'Test Shoe',
        'description' => 'A nice shoe',
        'price' => 49.99,
        'stock_quantity' => 5,
        'category_id' => $category->id,
    ]);

    $response = $this->getJson("/api/products/{$product->id}");

    $response->assertStatus(200);
});

it('returns 404 for non-existent product', function () {
    $response = $this->getJson('/api/products/99999');

    $response->assertStatus(404);
});

it('can list categories via API', function () {
    Category::create([
        'name' => 'T-Shirts',
        'slug' => 't-shirts',
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/categories');

    $response->assertStatus(200);
});

it('can get category tree via API', function () {
    $response = $this->getJson('/api/categories/tree');

    $response->assertStatus(200);
});

it('can get active campaigns via API', function () {
    $response = $this->getJson('/api/campaigns/active');

    $response->assertStatus(200);
});

it('can get active banners via API', function () {
    $response = $this->getJson('/api/banners/active');

    $response->assertStatus(200);
});
