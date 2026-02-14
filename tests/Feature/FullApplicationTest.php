<?php

use App\Models\Banner;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductSizeStock;
use App\Models\User;
use App\Mail\MultiOrderPlaced;
use App\Mail\OrderPlaced;
use App\Mail\OrderStatusUpdated;
use App\Mail\OrderNotificationAdmin;
use App\Mail\MultiOrderNotificationAdmin;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

// Clean up orphaned transactions from controller early-returns
afterEach(function () {
    while (DB::transactionLevel() > 1) {
        DB::rollBack();
    }
});

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function admin(): User
{
    return User::factory()->create(['is_admin' => true]);
}

function regularUser(): User
{
    return User::factory()->create(['is_admin' => false]);
}

function sampleCategory(array $overrides = []): Category
{
    return Category::create(array_merge([
        'name' => 'Cat ' . uniqid(),
        'slug' => 'cat-' . uniqid(),
        'is_active' => true,
    ], $overrides));
}

function sampleProduct(array $overrides = []): Product
{
    $cat = sampleCategory();

    return Product::create(array_merge([
        'name' => 'Prod ' . uniqid(),
        'description' => 'A product',
        'price' => 49.99,
        'stock_quantity' => 50,
        'category_id' => $cat->id,
    ], $overrides));
}

function sampleOrder(array $overrides = []): Order
{
    $product = sampleProduct();

    $order = Order::create(array_merge([
        'customer_full_name' => 'Test Customer',
        'customer_email' => 'test@example.com',
        'customer_phone' => '+383 49 111 222',
        'customer_address' => 'Test Address',
        'customer_city' => 'Prizren',
        'customer_country' => 'kosovo',
        'product_id' => $product->id,
        'product_name' => $product->name,
        'product_price' => $product->price,
        'quantity' => 1,
        'total_amount' => $product->price + 2.40,
    ], $overrides));

    $order->payment_method = 'cash';
    $order->status = 'pending';
    $order->save();

    return $order;
}

// ═══════════════════════════════════════════════════════════════
//  1. PUBLIC PAGES & API
// ═══════════════════════════════════════════════════════════════

it('homepage returns 200', function () {
    $this->get('/')->assertStatus(200);
});

it('products API returns paginated JSON', function () {
    sampleProduct();

    $response = $this->getJson('/api/products');

    $response->assertStatus(200)
        ->assertJsonStructure(['data']);
});

it('products API supports search filter', function () {
    $product = sampleProduct(['name' => 'UniqueShirt123']);

    $response = $this->getJson('/api/products?search=UniqueShirt123');

    $response->assertStatus(200);
    $response->assertJsonFragment(['name' => 'UniqueShirt123']);
});

it('products API supports category filter', function () {
    $cat = sampleCategory();
    sampleProduct(['category_id' => $cat->id, 'name' => 'CatFilterProd']);

    $response = $this->getJson("/api/products?category={$cat->id}");

    $response->assertStatus(200);
});

it('products API supports price range filter', function () {
    sampleProduct(['price' => 100.00, 'name' => 'ExpensiveShirt']);

    $response = $this->getJson('/api/products?price_min=80&price_max=120');

    $response->assertStatus(200);
});

it('products API supports sorting', function () {
    $response = $this->getJson('/api/products?sort_by=price-asc');

    $response->assertStatus(200);
});

it('single product API returns product', function () {
    $product = sampleProduct();

    $response = $this->getJson("/api/products/{$product->id}");

    $response->assertStatus(200);
});

it('single product API returns 404 for missing product', function () {
    $this->getJson('/api/products/99999')->assertStatus(404);
});

it('categories API returns list', function () {
    sampleCategory();

    $this->getJson('/api/categories')->assertStatus(200);
});

it('category tree API returns 200', function () {
    $this->getJson('/api/categories/tree')->assertStatus(200);
});

it('single category API returns category with products', function () {
    $cat = sampleCategory();

    $response = $this->getJson("/api/categories/{$cat->id}");

    $response->assertStatus(200)
        ->assertJson(['success' => true]);
});

it('category API returns 404 for missing category', function () {
    $this->getJson('/api/categories/99999')->assertStatus(404);
});

it('active campaigns API returns 200', function () {
    $this->getJson('/api/campaigns/active')->assertStatus(200);
});

it('active banners API returns 200', function () {
    $this->getJson('/api/banners/active')->assertStatus(200);
});

// ═══════════════════════════════════════════════════════════════
//  2. AUTHENTICATION
// ═══════════════════════════════════════════════════════════════

it('guest is redirected from dashboard', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

it('admin can reach dashboard', function () {
    $this->actingAs(admin())->get('/dashboard')->assertStatus(200);
});

it('non-admin is forbidden from dashboard', function () {
    $this->actingAs(regularUser())->get('/dashboard')->assertStatus(403);
});

// ═══════════════════════════════════════════════════════════════
//  3. ADMIN – PRODUCTS CRUD (API)
// ═══════════════════════════════════════════════════════════════

it('admin can create product', function () {
    $a = admin();
    $cat = sampleCategory();

    $this->actingAs($a)->postJson('/api/products', [
        'name' => 'AdminProd',
        'description' => 'desc',
        'price' => 25.00,
        'stock_quantity' => 5,
        'category_id' => $cat->id,
        'gender' => 'unisex',
    ])->assertStatus(201);

    $this->assertDatabaseHas('products', ['name' => 'AdminProd']);
});

it('admin can update product', function () {
    $a = admin();
    $p = sampleProduct();

    $this->actingAs($a)->putJson("/api/products/{$p->id}", [
        'name' => 'Renamed',
        'price' => 88.00,
    ])->assertStatus(200);

    $this->assertDatabaseHas('products', ['id' => $p->id, 'name' => 'Renamed']);
});

it('admin can delete product', function () {
    $a = admin();
    $p = sampleProduct();

    $this->actingAs($a)->deleteJson("/api/products/{$p->id}")->assertStatus(200);
    $this->assertDatabaseMissing('products', ['id' => $p->id]);
});

it('non-admin cannot create product', function () {
    $u = regularUser();
    $cat = sampleCategory();

    $this->actingAs($u)->postJson('/api/products', [
        'name' => 'Blocked',
        'price' => 10,
        'category_id' => $cat->id,
    ])->assertStatus(403);
});

it('guest cannot create product', function () {
    $this->postJson('/api/products', ['name' => 'x'])->assertStatus(401);
});

// ═══════════════════════════════════════════════════════════════
//  4. ADMIN – CATEGORIES CRUD (API)
// ═══════════════════════════════════════════════════════════════

it('admin can create category', function () {
    $this->actingAs(admin())->postJson('/api/categories', [
        'name' => 'Shoes',
        'slug' => 'shoes-' . uniqid(),
        'is_active' => true,
    ])->assertStatus(201);
});

it('admin can update category', function () {
    $a = admin();
    $cat = sampleCategory();

    $this->actingAs($a)->putJson("/api/categories/{$cat->id}", [
        'name' => 'Renamed Cat',
        'slug' => 'renamed-cat-' . uniqid(),
    ])->assertStatus(200);

    $this->assertDatabaseHas('categories', ['id' => $cat->id, 'name' => 'Renamed Cat']);
});

it('admin can delete category without products', function () {
    $a = admin();
    $cat = sampleCategory();

    $this->actingAs($a)->deleteJson("/api/categories/{$cat->id}")->assertStatus(200);
    $this->assertDatabaseMissing('categories', ['id' => $cat->id]);
});

it('admin cannot delete category that has products', function () {
    $a = admin();
    $cat = sampleCategory();
    Product::create([
        'name' => 'InCat',
        'description' => 'x',
        'price' => 10,
        'stock_quantity' => 1,
        'category_id' => $cat->id,
    ]);

    $this->actingAs($a)->deleteJson("/api/categories/{$cat->id}")->assertStatus(422);
});

it('category creation rejects duplicate name', function () {
    $a = admin();
    $slug = 'dup-' . uniqid();

    $this->actingAs($a)->postJson('/api/categories', [
        'name' => 'Duplicate',
        'slug' => $slug,
    ])->assertStatus(201);

    $this->actingAs($a)->postJson('/api/categories', [
        'name' => 'Duplicate',
        'slug' => 'dup2-' . uniqid(),
    ])->assertStatus(422);
});

// ═══════════════════════════════════════════════════════════════
//  5. ADMIN – CAMPAIGNS CRUD (API)
// ═══════════════════════════════════════════════════════════════

it('admin can create campaign', function () {
    $a = admin();
    $p = sampleProduct();

    $this->actingAs($a)->postJson('/api/campaigns', [
        'name' => 'Flash Sale',
        'price' => 19.99,
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(7)->toDateString(),
        'product_id' => $p->id,
        'is_active' => true,
    ])->assertStatus(201);

    $this->assertDatabaseHas('campaigns', ['name' => 'Flash Sale']);
});

it('campaign price must be lower than product price', function () {
    $a = admin();
    $p = sampleProduct(['price' => 30.00]);

    $this->actingAs($a)->postJson('/api/campaigns', [
        'name' => 'Bad Price',
        'price' => 35.00, // higher than product
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(7)->toDateString(),
        'product_id' => $p->id,
    ])->assertStatus(422);
});

it('campaign rejects end_date before start_date', function () {
    $a = admin();
    $p = sampleProduct();

    $this->actingAs($a)->postJson('/api/campaigns', [
        'name' => 'Bad Date',
        'price' => 10.00,
        'start_date' => now()->addDays(5)->toDateString(),
        'end_date' => now()->toDateString(),
        'product_id' => $p->id,
    ])->assertStatus(422);
});

it('admin can update campaign', function () {
    $a = admin();
    $p = sampleProduct();

    $campaign = Campaign::create([
        'name' => 'Old',
        'price' => 15.00,
        'start_date' => now(),
        'end_date' => now()->addDays(7),
        'product_id' => $p->id,
        'is_active' => true,
    ]);

    $this->actingAs($a)->putJson("/api/campaigns/{$campaign->id}", [
        'name' => 'Updated Sale',
        'price' => 20.00,
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(14)->toDateString(),
        'product_id' => $p->id,
    ])->assertStatus(200);

    $this->assertDatabaseHas('campaigns', ['id' => $campaign->id, 'name' => 'Updated Sale']);
});

it('admin can delete campaign', function () {
    $a = admin();
    $p = sampleProduct();

    $campaign = Campaign::create([
        'name' => 'Gone',
        'price' => 10.00,
        'start_date' => now(),
        'end_date' => now()->addDays(1),
        'product_id' => $p->id,
    ]);

    $this->actingAs($a)->deleteJson("/api/campaigns/{$campaign->id}")->assertStatus(200);
    $this->assertDatabaseMissing('campaigns', ['id' => $campaign->id]);
});

it('guest cannot manage campaigns', function () {
    $this->getJson('/api/campaigns')->assertStatus(401);
    $this->postJson('/api/campaigns', [])->assertStatus(401);
});

it('non-admin cannot manage campaigns', function () {
    $u = regularUser();

    $this->actingAs($u)->getJson('/api/campaigns')->assertStatus(403);
    $this->actingAs($u)->postJson('/api/campaigns', [])->assertStatus(403);
});

// ═══════════════════════════════════════════════════════════════
//  6. ADMIN – BANNERS CRUD (API)
// ═══════════════════════════════════════════════════════════════

it('admin can list banners', function () {
    $this->actingAs(admin())->getJson('/api/banners')->assertStatus(200)
        ->assertJson(['success' => true]);
});

it('admin can create banner', function () {
    $this->actingAs(admin())->postJson('/api/banners', [
        'header' => 'Summer Collection',
        'description' => 'New arrivals',
    ])->assertStatus(201)
      ->assertJson(['success' => true]);

    $this->assertDatabaseHas('banners', ['header' => 'Summer Collection']);
});

it('banner creation rejects missing header', function () {
    $this->actingAs(admin())->postJson('/api/banners', [
        'description' => 'No header',
    ])->assertStatus(422);
});

it('admin can view single banner', function () {
    $banner = Banner::create(['header' => 'Test', 'description' => 'Desc']);

    $this->actingAs(admin())->getJson("/api/banners/{$banner->id}")
        ->assertStatus(200)
        ->assertJson(['success' => true]);
});

it('admin can update banner', function () {
    $banner = Banner::create(['header' => 'Old', 'description' => 'Desc']);

    $this->actingAs(admin())->putJson("/api/banners/{$banner->id}", [
        'header' => 'New Header',
    ])->assertStatus(200);

    $this->assertDatabaseHas('banners', ['id' => $banner->id, 'header' => 'New Header']);
});

it('admin can delete banner', function () {
    $banner = Banner::create(['header' => 'Delete Me']);

    $this->actingAs(admin())->deleteJson("/api/banners/{$banner->id}")->assertStatus(200);
    $this->assertDatabaseMissing('banners', ['id' => $banner->id]);
});

it('guest cannot manage banners', function () {
    $this->getJson('/api/banners')->assertStatus(401);
    $this->postJson('/api/banners', [])->assertStatus(401);
});

it('non-admin cannot manage banners', function () {
    $u = regularUser();

    $this->actingAs($u)->getJson('/api/banners')->assertStatus(403);
});

// ═══════════════════════════════════════════════════════════════
//  7. ORDERS – CREATION & VALIDATION
// ═══════════════════════════════════════════════════════════════

it('customer can place order with valid data', function () {
    Mail::fake();
    $product = sampleProduct();
    ProductSizeStock::create(['product_id' => $product->id, 'size' => 'M', 'quantity' => 10]);

    $response = $this->postJson('/api/orders', [
        'customer_full_name' => 'Edin Test',
        'customer_email' => 'edin@test.com',
        'customer_phone' => '+383 49 000 111',
        'customer_address' => 'Main Street 1',
        'customer_city' => 'Prishtina',
        'customer_country' => 'kosovo',
        'product_id' => $product->id,
        'product_price' => $product->price,
        'product_size' => 'M',
        'quantity' => 1,
        'total_amount' => $product->price + 2.40,
        'shipping_fee' => 2.40,
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('orders', ['customer_email' => 'edin@test.com']);
});

it('order rejects invalid country', function () {
    $product = sampleProduct();

    $this->postJson('/api/orders', [
        'customer_full_name' => 'X',
        'customer_email' => 'x@x.com',
        'customer_phone' => '123',
        'customer_address' => 'Addr',
        'customer_city' => 'City',
        'customer_country' => 'germany',
        'product_id' => $product->id,
        'product_price' => 10,
        'quantity' => 1,
        'total_amount' => 10,
        'shipping_fee' => 0,
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['customer_country']);
});

it('order rejects missing required fields', function () {
    $this->postJson('/api/orders', [])->assertStatus(422);
});

it('order rejects invalid email', function () {
    $product = sampleProduct();

    $this->postJson('/api/orders', [
        'customer_full_name' => 'X',
        'customer_email' => 'not-valid',
        'customer_phone' => '123',
        'customer_address' => 'Addr',
        'customer_city' => 'City',
        'customer_country' => 'kosovo',
        'product_id' => $product->id,
        'product_price' => 10,
        'quantity' => 1,
        'total_amount' => 10,
        'shipping_fee' => 0,
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['customer_email']);
});

it('order rejects non-existent product', function () {
    $this->postJson('/api/orders', [
        'customer_full_name' => 'X',
        'customer_email' => 'x@x.com',
        'customer_phone' => '123',
        'customer_address' => 'Addr',
        'customer_city' => 'City',
        'customer_country' => 'kosovo',
        'product_id' => 99999,
        'product_price' => 10,
        'quantity' => 1,
        'total_amount' => 10,
        'shipping_fee' => 0,
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['product_id']);
});

// ═══════════════════════════════════════════════════════════════
//  8. ORDERS – STOCK MANAGEMENT
// ═══════════════════════════════════════════════════════════════

it('order deducts size-specific stock', function () {
    Mail::fake();
    $product = sampleProduct();
    ProductSizeStock::create(['product_id' => $product->id, 'size' => '42', 'quantity' => 10]);

    $this->postJson('/api/orders', [
        'customer_full_name' => 'Stock Test',
        'customer_email' => 'stock@test.com',
        'customer_phone' => '+383 49 222 333',
        'customer_address' => 'Addr',
        'customer_city' => 'Prizren',
        'customer_country' => 'kosovo',
        'product_id' => $product->id,
        'product_price' => $product->price,
        'product_size' => '42',
        'quantity' => 3,
        'total_amount' => ($product->price * 3) + 2.40,
        'shipping_fee' => 2.40,
    ])->assertStatus(201);

    $this->assertDatabaseHas('product_size_stocks', [
        'product_id' => $product->id,
        'size' => '42',
        'quantity' => 7,
    ]);
});

it('order is rejected when stock is insufficient', function () {
    $product = sampleProduct();
    ProductSizeStock::create(['product_id' => $product->id, 'size' => 'L', 'quantity' => 2]);

    $this->postJson('/api/orders', [
        'customer_full_name' => 'No Stock',
        'customer_email' => 'no@stock.com',
        'customer_phone' => '123',
        'customer_address' => 'Addr',
        'customer_city' => 'Prizren',
        'customer_country' => 'kosovo',
        'product_id' => $product->id,
        'product_price' => $product->price,
        'product_size' => 'L',
        'quantity' => 10,
        'total_amount' => $product->price * 10,
        'shipping_fee' => 2.40,
    ])->assertStatus(422);
});

it('order is rejected for unavailable size', function () {
    $product = sampleProduct();
    ProductSizeStock::create(['product_id' => $product->id, 'size' => 'S', 'quantity' => 5]);

    $this->postJson('/api/orders', [
        'customer_full_name' => 'Wrong Size',
        'customer_email' => 'wrong@size.com',
        'customer_phone' => '123',
        'customer_address' => 'Addr',
        'customer_city' => 'Prizren',
        'customer_country' => 'kosovo',
        'product_id' => $product->id,
        'product_price' => $product->price,
        'product_size' => 'XXL',
        'quantity' => 1,
        'total_amount' => $product->price,
        'shipping_fee' => 2.40,
    ])->assertStatus(422);
});

// ═══════════════════════════════════════════════════════════════
//  9. ORDERS – SHIPPING FEE PER COUNTRY
// ═══════════════════════════════════════════════════════════════

it('applies €2.40 shipping fee for Kosovo orders', function () {
    Mail::fake();
    $product = sampleProduct();
    ProductSizeStock::create(['product_id' => $product->id, 'size' => 'M', 'quantity' => 10]);

    $response = $this->postJson('/api/orders', [
        'customer_full_name' => 'Kosovo Buyer',
        'customer_email' => 'ks@test.com',
        'customer_phone' => '123',
        'customer_address' => 'Addr',
        'customer_city' => 'Prishtina',
        'customer_country' => 'kosovo',
        'product_id' => $product->id,
        'product_price' => $product->price,
        'product_size' => 'M',
        'quantity' => 1,
        'total_amount' => $product->price + 2.40,
        'shipping_fee' => 2.40,
    ]);

    $response->assertStatus(201);
    $order = Order::where('customer_email', 'ks@test.com')->first();
    expect((float) $order->total_amount)->toBe($product->price + 2.40);
});

it('applies €5.00 shipping fee for Albania orders', function () {
    Mail::fake();
    $product = sampleProduct();
    ProductSizeStock::create(['product_id' => $product->id, 'size' => 'M', 'quantity' => 10]);

    $response = $this->postJson('/api/orders', [
        'customer_full_name' => 'Albania Buyer',
        'customer_email' => 'al@test.com',
        'customer_phone' => '123',
        'customer_address' => 'Addr',
        'customer_city' => 'Tirana',
        'customer_country' => 'albania',
        'product_id' => $product->id,
        'product_price' => $product->price,
        'product_size' => 'M',
        'quantity' => 1,
        'total_amount' => $product->price + 5.00,
        'shipping_fee' => 5.00,
    ]);

    $response->assertStatus(201);
    $order = Order::where('customer_email', 'al@test.com')->first();
    expect((float) $order->total_amount)->toBe($product->price + 5.00);
});

it('applies €5.00 shipping fee for Macedonia orders', function () {
    Mail::fake();
    $product = sampleProduct();
    ProductSizeStock::create(['product_id' => $product->id, 'size' => 'M', 'quantity' => 10]);

    $response = $this->postJson('/api/orders', [
        'customer_full_name' => 'MK Buyer',
        'customer_email' => 'mk@test.com',
        'customer_phone' => '123',
        'customer_address' => 'Addr',
        'customer_city' => 'Skopje',
        'customer_country' => 'macedonia',
        'product_id' => $product->id,
        'product_price' => $product->price,
        'product_size' => 'M',
        'quantity' => 1,
        'total_amount' => $product->price + 5.00,
        'shipping_fee' => 5.00,
    ]);

    $response->assertStatus(201);
    $order = Order::where('customer_email', 'mk@test.com')->first();
    expect((float) $order->total_amount)->toBe($product->price + 5.00);
});

// ═══════════════════════════════════════════════════════════════
//  10. ORDERS – CAMPAIGN PRICE APPLIED
// ═══════════════════════════════════════════════════════════════

it('order uses campaign price when active campaign exists', function () {
    Mail::fake();
    $product = sampleProduct(['price' => 50.00]);
    ProductSizeStock::create(['product_id' => $product->id, 'size' => 'M', 'quantity' => 10]);

    Campaign::create([
        'name' => 'Active Sale',
        'price' => 30.00,
        'start_date' => now()->subDay(),
        'end_date' => now()->addDays(7),
        'product_id' => $product->id,
        'is_active' => true,
    ]);

    $this->postJson('/api/orders', [
        'customer_full_name' => 'Campaign Buyer',
        'customer_email' => 'campaign@test.com',
        'customer_phone' => '123',
        'customer_address' => 'Addr',
        'customer_city' => 'Prizren',
        'customer_country' => 'kosovo',
        'product_id' => $product->id,
        'product_price' => 30.00,
        'product_size' => 'M',
        'quantity' => 1,
        'total_amount' => 32.40,
        'shipping_fee' => 2.40,
    ])->assertStatus(201);

    $order = Order::where('customer_email', 'campaign@test.com')->first();
    // Server recalculates: campaign price (30) + Kosovo shipping (2.40)
    expect((float) $order->total_amount)->toBe(32.40);
    expect((float) $order->product_price)->toBe(30.00);
});

// ═══════════════════════════════════════════════════════════════
//  11. ORDERS – ADMIN OPERATIONS
// ═══════════════════════════════════════════════════════════════

it('admin can list orders via API', function () {
    $this->actingAs(admin())->getJson('/api/orders')->assertStatus(200);
});

it('guest cannot list orders via API', function () {
    $this->getJson('/api/orders')->assertStatus(401);
});

it('non-admin cannot list orders', function () {
    $this->actingAs(regularUser())->getJson('/api/orders')->assertStatus(403);
});

it('admin can view single order', function () {
    $order = sampleOrder();

    $this->actingAs(admin())->getJson("/api/orders/{$order->id}")->assertStatus(200);
});

it('admin can update order status', function () {
    Mail::fake();
    $order = sampleOrder();

    $this->actingAs(admin())->putJson("/api/orders/{$order->id}", [
        'status' => 'confirmed',
    ])->assertStatus(200);

    $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'confirmed']);
});

it('order status update sets confirmed_at timestamp', function () {
    Mail::fake();
    $order = sampleOrder();

    $this->actingAs(admin())->putJson("/api/orders/{$order->id}", [
        'status' => 'confirmed',
    ]);

    $order->refresh();
    expect($order->confirmed_at)->not->toBeNull();
});

it('order status update sets shipped_at timestamp', function () {
    Mail::fake();
    $order = sampleOrder();
    $order->status = 'confirmed';
    $order->save();

    $this->actingAs(admin())->putJson("/api/orders/{$order->id}", [
        'status' => 'shipped',
    ]);

    $order->refresh();
    expect($order->shipped_at)->not->toBeNull();
});

it('order status update sets delivered_at timestamp', function () {
    Mail::fake();
    $order = sampleOrder();
    $order->status = 'shipped';
    $order->save();

    $this->actingAs(admin())->putJson("/api/orders/{$order->id}", [
        'status' => 'delivered',
    ]);

    $order->refresh();
    expect($order->delivered_at)->not->toBeNull();
});

it('order status rejects invalid status value', function () {
    $order = sampleOrder();

    $this->actingAs(admin())->putJson("/api/orders/{$order->id}", [
        'status' => 'exploded',
    ])->assertStatus(422);
});

it('admin can delete order', function () {
    $order = sampleOrder();

    $this->actingAs(admin())->deleteJson("/api/orders/{$order->id}")->assertStatus(200);
    $this->assertDatabaseMissing('orders', ['id' => $order->id]);
});

// ═══════════════════════════════════════════════════════════════
//  12. ORDERS – EMAIL SENDING
// ═══════════════════════════════════════════════════════════════

it('sends customer email when order is placed', function () {
    Mail::fake();
    $product = sampleProduct();
    ProductSizeStock::create(['product_id' => $product->id, 'size' => 'M', 'quantity' => 10]);

    $this->postJson('/api/orders', [
        'customer_full_name' => 'Email Test',
        'customer_email' => 'emailtest@test.com',
        'customer_phone' => '123',
        'customer_address' => 'Addr',
        'customer_city' => 'Prizren',
        'customer_country' => 'kosovo',
        'product_id' => $product->id,
        'product_price' => $product->price,
        'product_size' => 'M',
        'quantity' => 1,
        'total_amount' => $product->price + 2.40,
        'shipping_fee' => 2.40,
    ])->assertStatus(201);

    Mail::assertSent(OrderPlaced::class, function ($mail) {
        return $mail->hasTo('emailtest@test.com');
    });
});

it('sends admin notification email when order is placed', function () {
    Mail::fake();
    $product = sampleProduct();
    ProductSizeStock::create(['product_id' => $product->id, 'size' => 'M', 'quantity' => 10]);

    $this->postJson('/api/orders', [
        'customer_full_name' => 'Admin Email Test',
        'customer_email' => 'adminnotif@test.com',
        'customer_phone' => '123',
        'customer_address' => 'Addr',
        'customer_city' => 'Prizren',
        'customer_country' => 'kosovo',
        'product_id' => $product->id,
        'product_price' => $product->price,
        'product_size' => 'M',
        'quantity' => 1,
        'total_amount' => $product->price + 2.40,
        'shipping_fee' => 2.40,
    ])->assertStatus(201);

    Mail::assertSent(OrderNotificationAdmin::class);
});

it('sends status update email when order status changes', function () {
    Mail::fake();
    $order = sampleOrder();

    $this->actingAs(admin())->putJson("/api/orders/{$order->id}", [
        'status' => 'shipped',
    ])->assertStatus(200);

    Mail::assertSent(OrderStatusUpdated::class, function ($mail) use ($order) {
        return $mail->hasTo($order->customer_email);
    });
});

// ═══════════════════════════════════════════════════════════════
//  13. MAILABLE – MULTI-ORDER PLACED
// ═══════════════════════════════════════════════════════════════

it('MultiOrderPlaced mailable renders with correct data', function () {
    $product = sampleProduct();
    $orders = collect([
        sampleOrder(['customer_country' => 'kosovo']),
        sampleOrder(['customer_country' => 'kosovo']),
    ]);

    $totalAmount = $orders->sum('total_amount');
    $mailable = new MultiOrderPlaced($orders, $totalAmount);

    $mailable->assertSeeInHtml('Order Confirmed');
    $mailable->assertSeeInHtml('Cash on Delivery');
    $mailable->assertSeeInHtml('€2.40');
    $mailable->assertSeeInHtml('COD postman fee');
});

it('MultiOrderPlaced does not show postman fee note for non-Kosovo orders', function () {
    $product = sampleProduct();
    $order = sampleOrder(['customer_country' => 'albania']);

    $mailable = new MultiOrderPlaced(collect([$order]), (float) $order->total_amount);

    $mailable->assertDontSeeInHtml('COD postman fee');
});

it('MultiOrderPlaced has correct subject line', function () {
    $orders = collect([sampleOrder(), sampleOrder()]);
    $mailable = new MultiOrderPlaced($orders, $orders->sum('total_amount'));

    $mailable->assertHasSubject('Order Confirmation - 2 Items Ordered');
});

// ═══════════════════════════════════════════════════════════════
//  14. MAILABLE – SINGLE ORDER PLACED
// ═══════════════════════════════════════════════════════════════

it('OrderPlaced mailable renders correctly', function () {
    $order = sampleOrder();

    $mailable = new OrderPlaced($order);

    $mailable->assertSeeInHtml('Order Confirmed');
    $mailable->assertSeeInHtml($order->customer_full_name);
});

// ═══════════════════════════════════════════════════════════════
//  15. MAILABLE – ORDER STATUS UPDATED
// ═══════════════════════════════════════════════════════════════

it('OrderStatusUpdated mailable renders with status info', function () {
    $order = sampleOrder();

    $mailable = new OrderStatusUpdated($order, 'pending', 'shipped');

    $mailable->assertSeeInHtml($order->customer_full_name);
});

// ═══════════════════════════════════════════════════════════════
//  16. DASHBOARD STATS API
// ═══════════════════════════════════════════════════════════════

it('admin can access dashboard stats', function () {
    $this->actingAs(admin())->getJson('/api/dashboard/stats')->assertStatus(200);
});

it('guest cannot access dashboard stats', function () {
    $this->getJson('/api/dashboard/stats')->assertStatus(401);
});

it('non-admin cannot access dashboard stats', function () {
    $this->actingAs(regularUser())->getJson('/api/dashboard/stats')->assertStatus(403);
});

it('dashboard stats include expected keys', function () {
    $this->actingAs(admin())->getJson('/api/dashboard/stats')
        ->assertStatus(200)
        ->assertJsonStructure([
            'daily' => ['sales', 'orders'],
            'weekly' => ['sales', 'orders'],
            'monthly' => ['sales', 'orders'],
            'total_revenue',
            'total_products',
            'total_customers',
        ]);
});

// ═══════════════════════════════════════════════════════════════
//  17. MODEL TESTS – ORDER
// ═══════════════════════════════════════════════════════════════

it('Order generates unique_id on creation', function () {
    $order = sampleOrder();

    expect($order->unique_id)->toStartWith('ORD-');
    expect(strlen($order->unique_id))->toBe(12); // ORD- + 8 chars
});

it('Order has order_number accessor', function () {
    $order = sampleOrder();

    expect($order->order_number)->toBe($order->unique_id);
});

it('Order has status_color accessor', function () {
    $order = sampleOrder();

    expect($order->status_color)->toContain('yellow'); // pending = yellow
});

it('Order has country_label accessor', function () {
    $order = sampleOrder(['customer_country' => 'kosovo']);

    expect($order->country_label)->toBe('Kosovo');
});

it('Order belongs to product', function () {
    $order = sampleOrder();

    expect($order->product)->toBeInstanceOf(Product::class);
});

// ═══════════════════════════════════════════════════════════════
//  18. MODEL TESTS – PRODUCT
// ═══════════════════════════════════════════════════════════════

it('Product has sizeStocks relationship', function () {
    $product = sampleProduct();
    ProductSizeStock::create(['product_id' => $product->id, 'size' => 'M', 'quantity' => 5]);

    expect($product->sizeStocks)->toHaveCount(1);
});

it('Product total_stock sums all size stock quantities', function () {
    $product = sampleProduct();
    ProductSizeStock::create(['product_id' => $product->id, 'size' => 'S', 'quantity' => 5]);
    ProductSizeStock::create(['product_id' => $product->id, 'size' => 'M', 'quantity' => 10]);
    ProductSizeStock::create(['product_id' => $product->id, 'size' => 'L', 'quantity' => 3]);

    expect($product->fresh()->total_stock)->toBe(18);
});

it('Product stock_status returns correct string', function () {
    $product = sampleProduct();

    // out of stock (no sizeStocks at all)
    expect($product->fresh()->stock_status)->toBe('out of stock');

    // low stock
    ProductSizeStock::create(['product_id' => $product->id, 'size' => 'S', 'quantity' => 3]);
    expect($product->fresh()->stock_status)->toBe('low stock');

    // in stock
    ProductSizeStock::create(['product_id' => $product->id, 'size' => 'M', 'quantity' => 20]);
    expect($product->fresh()->stock_status)->toBe('in stock');
});

it('Product belongs to category', function () {
    $product = sampleProduct();

    expect($product->category)->toBeInstanceOf(Category::class);
});

// ═══════════════════════════════════════════════════════════════
//  19. MODEL TESTS – CATEGORY
// ═══════════════════════════════════════════════════════════════

it('Category has many products', function () {
    $cat = sampleCategory();
    Product::create([
        'name' => 'P1', 'description' => 'x', 'price' => 10,
        'stock_quantity' => 1, 'category_id' => $cat->id,
    ]);
    Product::create([
        'name' => 'P2', 'description' => 'x', 'price' => 20,
        'stock_quantity' => 1, 'category_id' => $cat->id,
    ]);

    expect($cat->products)->toHaveCount(2);
});

// ═══════════════════════════════════════════════════════════════
//  20. MODEL TESTS – CAMPAIGN
// ═══════════════════════════════════════════════════════════════

it('Campaign belongs to product', function () {
    $product = sampleProduct();
    $campaign = Campaign::create([
        'name' => 'Sale',
        'price' => 10,
        'start_date' => now(),
        'end_date' => now()->addDays(7),
        'product_id' => $product->id,
        'is_active' => true,
    ]);

    expect($campaign->product)->toBeInstanceOf(Product::class);
    expect($campaign->product->id)->toBe($product->id);
});

it('Campaign casts dates correctly', function () {
    $product = sampleProduct();
    $campaign = Campaign::create([
        'name' => 'Sale',
        'price' => 10,
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31',
        'product_id' => $product->id,
    ]);

    expect($campaign->start_date)->toBeInstanceOf(\Carbon\Carbon::class);
    expect($campaign->end_date)->toBeInstanceOf(\Carbon\Carbon::class);
});

// ═══════════════════════════════════════════════════════════════
//  21. MODEL TESTS – BANNER
// ═══════════════════════════════════════════════════════════════

it('Banner has image_url accessor', function () {
    $banner = Banner::create(['header' => 'Test', 'image_path' => null]);

    expect($banner->image_url)->toBeNull();
});

it('Banner has_image is false when no image', function () {
    $banner = Banner::create(['header' => 'Test']);

    expect($banner->has_image)->toBeFalse();
});

// ═══════════════════════════════════════════════════════════════
//  22. MODEL TESTS – PRODUCT SIZE STOCK
// ═══════════════════════════════════════════════════════════════

it('ProductSizeStock returns correct stock_status', function () {
    $product = sampleProduct();

    $outOfStock = ProductSizeStock::create(['product_id' => $product->id, 'size' => 'XS', 'quantity' => 0]);
    expect($outOfStock->stock_status)->toBe('out of stock');

    $lowStock = ProductSizeStock::create(['product_id' => $product->id, 'size' => 'S', 'quantity' => 5]);
    expect($lowStock->stock_status)->toBe('low stock');

    $inStock = ProductSizeStock::create(['product_id' => $product->id, 'size' => 'M', 'quantity' => 20]);
    expect($inStock->stock_status)->toBe('in stock');
});

it('ProductSizeStock belongs to product', function () {
    $product = sampleProduct();
    $sizeStock = ProductSizeStock::create(['product_id' => $product->id, 'size' => 'M', 'quantity' => 5]);

    expect($sizeStock->product)->toBeInstanceOf(Product::class);
});

// ═══════════════════════════════════════════════════════════════
//  23. ADMIN WEB PAGES
// ═══════════════════════════════════════════════════════════════

it('admin can access all admin pages', function () {
    $a = admin();

    $this->actingAs($a)->get('/admin/products')->assertStatus(200);
    $this->actingAs($a)->get('/admin/orders')->assertStatus(200);
    $this->actingAs($a)->get('/admin/campaigns')->assertStatus(200);
    $this->actingAs($a)->get('/admin/categories')->assertStatus(200);
    $this->actingAs($a)->get('/admin/banners')->assertStatus(200);
});

it('guest is redirected from all admin pages', function () {
    $this->get('/admin/products')->assertRedirect('/login');
    $this->get('/admin/orders')->assertRedirect('/login');
    $this->get('/admin/campaigns')->assertRedirect('/login');
    $this->get('/admin/categories')->assertRedirect('/login');
    $this->get('/admin/banners')->assertRedirect('/login');
});

it('non-admin gets 403 on all admin pages', function () {
    $u = regularUser();

    $this->actingAs($u)->get('/admin/products')->assertStatus(403);
    $this->actingAs($u)->get('/admin/orders')->assertStatus(403);
    $this->actingAs($u)->get('/admin/campaigns')->assertStatus(403);
    $this->actingAs($u)->get('/admin/categories')->assertStatus(403);
    $this->actingAs($u)->get('/admin/banners')->assertStatus(403);
});

// ═══════════════════════════════════════════════════════════════
//  24. PRODUCTS – BULK OPERATIONS
// ═══════════════════════════════════════════════════════════════

it('admin can bulk delete products', function () {
    $a = admin();
    $p1 = sampleProduct();
    $p2 = sampleProduct();

    $this->actingAs($a)->postJson('/api/products/bulk-delete', [
        'product_ids' => [$p1->id, $p2->id],
    ])->assertStatus(200);

    $this->assertDatabaseMissing('products', ['id' => $p1->id]);
    $this->assertDatabaseMissing('products', ['id' => $p2->id]);
});

it('non-admin cannot bulk delete products', function () {
    $u = regularUser();
    $p = sampleProduct();

    $this->actingAs($u)->postJson('/api/products/bulk-delete', [
        'product_ids' => [$p->id],
    ])->assertStatus(403);
});
