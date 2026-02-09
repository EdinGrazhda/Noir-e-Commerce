<?php

use App\Models\Campaign;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;

// ─── Helpers ───────────────────────────────────────────────────

function createAdmin(): User
{
    return User::factory()->create(['is_admin' => true]);
}

function createRegularUser(): User
{
    return User::factory()->create(['is_admin' => false]);
}

function createCategory(array $overrides = []): Category
{
    return Category::create(array_merge([
        'name' => 'Test Category',
        'slug' => 'test-category-'.uniqid(),
        'is_active' => true,
    ], $overrides));
}

function createProduct(array $overrides = []): Product
{
    $category = createCategory();

    return Product::create(array_merge([
        'name' => 'Test Product '.uniqid(),
        'description' => 'Test description',
        'price' => 29.99,
        'stock_quantity' => 10,
        'category_id' => $category->id,
    ], $overrides));
}

// ─── Products Admin Page ───────────────────────────────────────

it('admin can access products page', function () {
    $admin = createAdmin();

    $response = $this->actingAs($admin)->get('/admin/products');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('admin/products/index')
    );
});

it('guest cannot access products page', function () {
    $response = $this->get('/admin/products');

    $response->assertRedirect('/login');
});

it('non-admin user is blocked from admin products page', function () {
    $user = createRegularUser();

    $response = $this->actingAs($user)->get('/admin/products');

    $response->assertStatus(403);
});

it('admin can create a product via API', function () {
    $admin = createAdmin();
    $category = createCategory();

    $response = $this->actingAs($admin)->postJson('/api/products', [
        'name' => 'New Product',
        'description' => 'A new test product',
        'price' => 39.99,
        'stock_quantity' => 20,
        'category_id' => $category->id,
        'gender' => 'unisex',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('products', ['name' => 'New Product']);
});

it('admin can update a product via API', function () {
    $admin = createAdmin();
    $product = createProduct();

    $response = $this->actingAs($admin)->putJson("/api/products/{$product->id}", [
        'name' => 'Updated Product Name',
        'price' => 59.99,
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'name' => 'Updated Product Name',
    ]);
});

it('admin can delete a product via API', function () {
    $admin = createAdmin();
    $product = createProduct();

    $response = $this->actingAs($admin)->deleteJson("/api/products/{$product->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

it('non-admin cannot create a product', function () {
    $user = createRegularUser();
    $category = createCategory();

    $response = $this->actingAs($user)->postJson('/api/products', [
        'name' => 'Unauthorized Product',
        'description' => 'Should not be created',
        'price' => 10.00,
        'category_id' => $category->id,
    ]);

    $response->assertStatus(403);
});

it('non-admin cannot delete a product', function () {
    $user = createRegularUser();
    $product = createProduct();

    $response = $this->actingAs($user)->deleteJson("/api/products/{$product->id}");

    $response->assertStatus(403);
});

// ─── Categories Admin Page ─────────────────────────────────────

it('admin can access categories page', function () {
    $admin = createAdmin();

    $response = $this->actingAs($admin)->get('/admin/categories');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('admin/categories/index')
    );
});

it('admin can create a category via API', function () {
    $admin = createAdmin();

    $response = $this->actingAs($admin)->postJson('/api/categories', [
        'name' => 'New Category',
        'slug' => 'new-category',
        'is_active' => true,
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('categories', ['name' => 'New Category']);
});

it('admin can update a category via API', function () {
    $admin = createAdmin();
    $category = createCategory();

    $response = $this->actingAs($admin)->putJson("/api/categories/{$category->id}", [
        'name' => 'Updated Category',
        'slug' => 'updated-category',
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('categories', ['name' => 'Updated Category']);
});

it('admin can delete a category via API', function () {
    $admin = createAdmin();
    $category = createCategory();

    $response = $this->actingAs($admin)->deleteJson("/api/categories/{$category->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

// ─── Orders Admin Page ─────────────────────────────────────────

it('admin can access orders page', function () {
    $admin = createAdmin();

    $response = $this->actingAs($admin)->get('/admin/orders');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('admin/orders/index')
    );
});

it('guest cannot access orders page', function () {
    $response = $this->get('/admin/orders');

    $response->assertRedirect('/login');
});

// ─── Campaigns Admin Page ──────────────────────────────────────

it('admin can access campaigns page', function () {
    $admin = createAdmin();

    $response = $this->actingAs($admin)->get('/admin/campaigns');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('admin/campaigns/index')
    );
});

it('guest cannot access campaigns page', function () {
    $response = $this->get('/admin/campaigns');

    $response->assertRedirect('/login');
});

it('admin can create a campaign via API', function () {
    $admin = createAdmin();
    $product = createProduct();

    $response = $this->actingAs($admin)->postJson('/api/campaigns', [
        'name' => 'Summer Sale',
        'description' => 'Big summer discounts',
        'price' => 19.99,
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(30)->toDateString(),
        'product_id' => $product->id,
        'is_active' => true,
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('campaigns', ['name' => 'Summer Sale']);
});

it('admin can delete a campaign via API', function () {
    $admin = createAdmin();
    $product = createProduct();

    $campaign = Campaign::create([
        'name' => 'To Delete',
        'description' => 'Will be deleted',
        'price' => 15.00,
        'start_date' => now(),
        'end_date' => now()->addDays(7),
        'product_id' => $product->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin)->deleteJson("/api/campaigns/{$campaign->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('campaigns', ['id' => $campaign->id]);
});

// ─── Banners Admin Page ────────────────────────────────────────

it('admin can access banners page', function () {
    $admin = createAdmin();

    $response = $this->actingAs($admin)->get('/admin/banners');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('admin/banners/index')
    );
});

it('guest cannot access banners page', function () {
    $response = $this->get('/admin/banners');

    $response->assertRedirect('/login');
});

// ─── Dashboard ─────────────────────────────────────────────────

it('admin can access dashboard', function () {
    $admin = createAdmin();

    $response = $this->actingAs($admin)->get('/dashboard');

    $response->assertStatus(200);
});

it('guest cannot access dashboard', function () {
    $response = $this->get('/dashboard');

    $response->assertRedirect('/login');
});
