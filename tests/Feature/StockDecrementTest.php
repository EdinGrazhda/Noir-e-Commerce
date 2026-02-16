<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductSizeStock;

function stockTestCategory(array $overrides = []): Category
{
    return Category::create(array_merge([
        'name' => 'Stock Test Category',
        'slug' => 'stock-test-' . uniqid(),
        'is_active' => true,
    ], $overrides));
}

function createProductWithSizes(array $sizes): Product
{
    $category = stockTestCategory();

    $product = Product::create([
        'name' => 'Stock Test Product ' . uniqid(),
        'description' => 'A product for stock decrement testing',
        'price' => 29.99,
        'stock_quantity' => 0,
        'category_id' => $category->id,
    ]);

    foreach ($sizes as $size => $quantity) {
        ProductSizeStock::create([
            'product_id' => $product->id,
            'size' => (string) $size,
            'quantity' => $quantity,
        ]);
    }

    return $product;
}

function placeOrder(Product $product, string $size, int $quantity = 1): \Illuminate\Testing\TestResponse
{
    return test()->postJson('/api/orders', [
        'customer_full_name' => 'Test Customer',
        'customer_email' => 'stock-test-' . uniqid() . '@example.com',
        'customer_phone' => '+383 49 000 000',
        'customer_address' => 'Test Address 123',
        'customer_city' => 'Prishtina',
        'customer_country' => 'kosovo',
        'product_id' => $product->id,
        'product_price' => $product->price,
        'product_size' => $size,
        'quantity' => $quantity,
        'total_amount' => ($product->price * $quantity) + 2.40,
        'shipping_fee' => 2.40,
    ]);
}

// ─── Stock Decrement on Purchase ────────────────────────────────

it('decrements size stock when an order is placed', function () {
    $product = createProductWithSizes(['42' => 5, '43' => 3]);

    $response = placeOrder($product, '42', 1);
    $response->assertStatus(201);

    // Size 42 should now have 4 instead of 5
    $sizeStock = ProductSizeStock::where('product_id', $product->id)
        ->where('size', '42')
        ->first();

    expect($sizeStock->quantity)->toBe(4);
});

it('decrements stock by the ordered quantity', function () {
    $product = createProductWithSizes(['40' => 10]);

    $response = placeOrder($product, '40', 3);
    $response->assertStatus(201);

    $sizeStock = ProductSizeStock::where('product_id', $product->id)
        ->where('size', '40')
        ->first();

    // 10 - 3 = 7
    expect($sizeStock->quantity)->toBe(7);
});

it('does not affect other sizes when one size is ordered', function () {
    $product = createProductWithSizes(['41' => 5, '42' => 8, '43' => 3]);

    placeOrder($product, '42', 2);

    // Size 42 should be decremented
    expect(
        ProductSizeStock::where('product_id', $product->id)->where('size', '42')->value('quantity')
    )->toBe(6);

    // Sizes 41 and 43 should remain untouched
    expect(
        ProductSizeStock::where('product_id', $product->id)->where('size', '41')->value('quantity')
    )->toBe(5);

    expect(
        ProductSizeStock::where('product_id', $product->id)->where('size', '43')->value('quantity')
    )->toBe(3);
});

// ─── Stock Reaches Zero ─────────────────────────────────────────

it('allows purchasing the last item of a size (stock goes to zero)', function () {
    $product = createProductWithSizes(['44' => 1]);

    $response = placeOrder($product, '44', 1);
    $response->assertStatus(201);

    $sizeStock = ProductSizeStock::where('product_id', $product->id)
        ->where('size', '44')
        ->first();

    expect($sizeStock->quantity)->toBe(0);
});

it('rejects order when size is out of stock (quantity = 0)', function () {
    $product = createProductWithSizes(['44' => 0]);

    $response = placeOrder($product, '44', 1);

    $response->assertStatus(422);
    $response->assertJsonFragment(['message' => 'Insufficient stock for size 44. Only 0 available.']);
});

it('rejects order when requested quantity exceeds available stock', function () {
    $product = createProductWithSizes(['42' => 2]);

    $response = placeOrder($product, '42', 5);

    $response->assertStatus(422);
    $response->assertJson(['message' => 'Insufficient stock for size 42. Only 2 available.']);
});

// ─── Size Marked Unavailable in API When Stock = 0 ─────────────

it('marks size as unavailable in product API when stock reaches zero', function () {
    // Size 41 has stock, size 42 will be bought out
    $product = createProductWithSizes(['41' => 5, '42' => 1]);

    // Buy the last item of size 42
    placeOrder($product, '42', 1);

    // Fetch product details from the public API
    $response = test()->getJson("/api/products/{$product->id}");
    $response->assertStatus(200);

    $sizeStocks = $response->json('data.sizeStocks');

    // Size 41 should still be available
    expect($sizeStocks['41']['available'])->toBeTrue();

    // Size 42 should be marked as NOT available (stock = 0)
    expect($sizeStocks['42']['available'])->toBeFalse();
});

it('marks all sizes as unavailable in API when product is fully sold out', function () {
    $product = createProductWithSizes(['41' => 1, '42' => 1]);

    // Buy out both sizes
    placeOrder($product, '41', 1);
    placeOrder($product, '42', 1);

    // Fetch product details from the public API
    $response = test()->getJson("/api/products/{$product->id}");
    $response->assertStatus(200);

    $sizeStocks = $response->json('data.sizeStocks');

    // Both sizes should be unavailable
    expect($sizeStocks['41']['available'])->toBeFalse();
    expect($sizeStocks['42']['available'])->toBeFalse();
});

// ─── Size Disappears From Welcome/Storefront When Empty ─────────

it('filters out zero-stock sizes from storefront product data', function () {
    // This tests the WelcomeController logic that only shows sizes with stock > 0
    $product = createProductWithSizes(['41' => 5, '42' => 1, '43' => 0]);

    // Buy the last item of size 42
    placeOrder($product, '42', 1);

    // Reload product with sizeStocks (same as WelcomeController does)
    $product = Product::with('sizeStocks')->find($product->id);

    // Apply the same filtering logic the WelcomeController uses
    $formattedSizeStocks = $product->sizeStocks
        ->filter(fn($stock) => $stock->quantity > 0)
        ->mapWithKeys(fn($stock) => [$stock->size => ['quantity' => $stock->quantity]])
        ->toArray();

    // Size 41 should still be visible (has stock)
    expect($formattedSizeStocks)->toHaveKey('41');

    // Size 42 should be gone (just bought last item, quantity = 0)
    expect($formattedSizeStocks)->not->toHaveKey('42');

    // Size 43 should also be gone (was already 0)
    expect($formattedSizeStocks)->not->toHaveKey('43');
});

it('returns empty sizes on storefront when product is fully sold out', function () {
    $product = createProductWithSizes(['41' => 1, '42' => 1]);

    placeOrder($product, '41', 1);
    placeOrder($product, '42', 1);

    $product = Product::with('sizeStocks')->find($product->id);

    $formattedSizeStocks = $product->sizeStocks
        ->filter(fn($stock) => $stock->quantity > 0)
        ->mapWithKeys(fn($stock) => [$stock->size => ['quantity' => $stock->quantity]])
        ->toArray();

    // No sizes should remain
    expect($formattedSizeStocks)->toBeEmpty();
});

// ─── Multiple Orders Decrement Correctly ────────────────────────

it('decrements stock correctly across multiple sequential orders', function () {
    $product = createProductWithSizes(['43' => 10]);

    placeOrder($product, '43', 2); // 10 -> 8
    placeOrder($product, '43', 3); // 8  -> 5
    placeOrder($product, '43', 1); // 5  -> 4

    $remaining = ProductSizeStock::where('product_id', $product->id)
        ->where('size', '43')
        ->value('quantity');

    expect($remaining)->toBe(4);
});
