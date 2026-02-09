<?php

use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Order;
use App\Models\ProductSizeStock;

function makeCategory(array $overrides = []): Category
{
    return Category::create(array_merge([
        'name' => 'Order Test Category',
        'slug' => 'order-test-' . uniqid(),
        'is_active' => true,
    ], $overrides));
}

function makeProduct(array $overrides = []): Product
{
    $category = makeCategory();

    return Product::create(array_merge([
        'name' => 'Order Test Product ' . uniqid(),
        'description' => 'Test product for orders',
        'price' => 49.99,
        'stock_quantity' => 50,
        'category_id' => $category->id,
    ], $overrides));
}

function makeAdmin(): User
{
    return User::factory()->create(['is_admin' => true]);
}

// ─── Order Creation (Public) ───────────────────────────────────

it('can place an order successfully', function () {
    $product = makeProduct();

    // Add size stock
    ProductSizeStock::create([
        'product_id' => $product->id,
        'size' => '42',
        'quantity' => 10,
    ]);

    $response = $this->postJson('/api/orders', [
        'customer_full_name' => 'John Doe',
        'customer_email' => 'john@example.com',
        'customer_phone' => '+383 49 123 456',
        'customer_address' => 'Rr. 27 Shote Galica',
        'customer_city' => 'Prizren',
        'customer_country' => 'kosovo',
        'product_id' => $product->id,
        'product_price' => 49.99,
        'product_size' => '42',
        'quantity' => 1,
        'total_amount' => 52.99,
        'shipping_fee' => 3.00,
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('orders', [
        'customer_full_name' => 'John Doe',
        'customer_email' => 'john@example.com',
    ]);
});

it('rejects order with missing required fields', function () {
    $response = $this->postJson('/api/orders', []);

    $response->assertStatus(422);
    $response->assertJsonStructure(['errors']);
});

it('rejects order with invalid email', function () {
    $product = makeProduct();

    $response = $this->postJson('/api/orders', [
        'customer_full_name' => 'John Doe',
        'customer_email' => 'not-an-email',
        'customer_phone' => '+383 49 123 456',
        'customer_address' => 'Test Address',
        'customer_city' => 'Prizren',
        'customer_country' => 'kosovo',
        'product_id' => $product->id,
        'product_price' => 49.99,
        'quantity' => 1,
        'total_amount' => 49.99,
        'shipping_fee' => 0,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['customer_email']);
});

it('rejects order with invalid country', function () {
    $product = makeProduct();

    $response = $this->postJson('/api/orders', [
        'customer_full_name' => 'John Doe',
        'customer_email' => 'john@example.com',
        'customer_phone' => '+383 49 123 456',
        'customer_address' => 'Test Address',
        'customer_city' => 'Prizren',
        'customer_country' => 'germany',  // not in allowed list
        'product_id' => $product->id,
        'product_price' => 49.99,
        'quantity' => 1,
        'total_amount' => 49.99,
        'shipping_fee' => 0,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['customer_country']);
});

it('rejects order for non-existent product', function () {
    $response = $this->postJson('/api/orders', [
        'customer_full_name' => 'John Doe',
        'customer_email' => 'john@example.com',
        'customer_phone' => '+383 49 123 456',
        'customer_address' => 'Test Address',
        'customer_city' => 'Prizren',
        'customer_country' => 'kosovo',
        'product_id' => 99999,
        'product_price' => 49.99,
        'quantity' => 1,
        'total_amount' => 49.99,
        'shipping_fee' => 0,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['product_id']);
});

// ─── Order Admin Operations ────────────────────────────────────

it('admin can view orders via API', function () {
    $admin = makeAdmin();

    $response = $this->actingAs($admin)->getJson('/api/orders');

    $response->assertStatus(200);
});

it('guest cannot view orders via API', function () {
    $response = $this->getJson('/api/orders');

    $response->assertStatus(401);
});

it('admin can update order status', function () {
    $admin = makeAdmin();
    $product = makeProduct();

    $order = Order::create([
        'customer_full_name' => 'Jane Doe',
        'customer_email' => 'jane@example.com',
        'customer_phone' => '+383 48 111 222',
        'customer_address' => 'Test Address',
        'customer_city' => 'Prishtina',
        'customer_country' => 'kosovo',
        'product_id' => $product->id,
        'product_name' => $product->name,
        'product_price' => $product->price,
        'quantity' => 1,
        'total_amount' => $product->price,
        'payment_method' => 'cash',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->putJson("/api/orders/{$order->id}", [
        'status' => 'confirmed',
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'status' => 'confirmed',
    ]);
});

it('admin can delete an order', function () {
    $admin = makeAdmin();
    $product = makeProduct();

    $order = Order::create([
        'customer_full_name' => 'Delete Me',
        'customer_email' => 'delete@example.com',
        'customer_phone' => '+383 48 333 444',
        'customer_address' => 'Delete Address',
        'customer_city' => 'Prizren',
        'customer_country' => 'kosovo',
        'product_id' => $product->id,
        'product_name' => $product->name,
        'product_price' => $product->price,
        'quantity' => 1,
        'total_amount' => $product->price,
        'payment_method' => 'cash',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->deleteJson("/api/orders/{$order->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('orders', ['id' => $order->id]);
});

// ─── Stock Deduction ───────────────────────────────────────────

it('deducts stock when order is placed', function () {
    $product = makeProduct();

    ProductSizeStock::create([
        'product_id' => $product->id,
        'size' => '41',
        'quantity' => 10,
    ]);

    $this->postJson('/api/orders', [
        'customer_full_name' => 'Stock Test',
        'customer_email' => 'stock@example.com',
        'customer_phone' => '+383 49 555 666',
        'customer_address' => 'Stock Address',
        'customer_city' => 'Prizren',
        'customer_country' => 'kosovo',
        'product_id' => $product->id,
        'product_price' => 49.99,
        'product_size' => '41',
        'quantity' => 2,
        'total_amount' => 99.98,
        'shipping_fee' => 0,
    ]);

    $this->assertDatabaseHas('product_size_stocks', [
        'product_id' => $product->id,
        'size' => '41',
        'quantity' => 8,  // 10 - 2
    ]);
});

it('rejects order when stock is insufficient', function () {
    $product = makeProduct();

    ProductSizeStock::create([
        'product_id' => $product->id,
        'size' => '43',
        'quantity' => 1,
    ]);

    $response = $this->postJson('/api/orders', [
        'customer_full_name' => 'No Stock',
        'customer_email' => 'nostock@example.com',
        'customer_phone' => '+383 49 777 888',
        'customer_address' => 'Test Address',
        'customer_city' => 'Prizren',
        'customer_country' => 'kosovo',
        'product_id' => $product->id,
        'product_price' => 49.99,
        'product_size' => '43',
        'quantity' => 5,  // Only 1 in stock
        'total_amount' => 249.95,
        'shipping_fee' => 0,
    ]);

    $response->assertStatus(422);
});
