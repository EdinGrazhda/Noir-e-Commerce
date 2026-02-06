<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductSizeStock;
use App\Mail\OrderPlaced;
use App\Mail\OrderNotificationAdmin;
use App\Mail\OrderStatusUpdated;
use App\Jobs\SendOrderStatusUpdateEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\ImageUrlNormalizer;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::with('product');

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('unique_id', 'like', "%{$search}%")
                    ->orWhere('batch_id', 'like', "%{$search}%")
                    ->orWhere('customer_full_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%")
                    ->orWhere('product_name', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Apply country filter
        if ($request->filled('country')) {
            $query->where('customer_country', $request->country);
        }

        // Apply payment method filter
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        // Apply date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Get all filtered orders
        $allOrders = $query->get();
        
        // Group orders by batch_id (or individual orders if no batch_id)
        $groupedOrders = [];
        $processedBatchIds = [];
        
        foreach ($allOrders as $order) {
            if ($order->batch_id && !in_array($order->batch_id, $processedBatchIds)) {
                // This is a multi-order - get all orders with same batch_id
                $batchOrders = $allOrders->where('batch_id', $order->batch_id)->values()->all();
                $processedBatchIds[] = $order->batch_id;
                
                // Create a grouped order representation
                $groupedOrders[] = [
                    'id' => $order->id,
                    'is_batch' => true,
                    'batch_id' => $order->batch_id,
                    'unique_id' => $order->batch_id,
                    'customer_full_name' => $order->customer_full_name,
                    'customer_email' => $order->customer_email,
                    'customer_phone' => $order->customer_phone,
                    'customer_address' => $order->customer_address,
                    'customer_city' => $order->customer_city,
                    'customer_country' => $order->customer_country,
                    'status' => $order->status,
                    'payment_method' => $order->payment_method,
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                    'total_amount' => collect($batchOrders)->sum('total_amount'),
                    'orders' => $batchOrders,
                ];
            } elseif (!$order->batch_id) {
                // Single order without batch
                $groupedOrders[] = [
                    'id' => $order->id,
                    'is_batch' => false,
                    'batch_id' => null,
                    'unique_id' => $order->unique_id,
                    'customer_full_name' => $order->customer_full_name,
                    'customer_email' => $order->customer_email,
                    'customer_phone' => $order->customer_phone,
                    'customer_address' => $order->customer_address,
                    'customer_city' => $order->customer_city,
                    'customer_country' => $order->customer_country,
                    'product_id' => $order->product_id,
                    'product_name' => $order->product_name,
                    'product_price' => $order->product_price,
                    'product_image' => $order->product_image,
                    'product_size' => $order->product_size,
                    'product_color' => $order->product_color,
                    'quantity' => $order->quantity,
                    'total_amount' => $order->total_amount,
                    'status' => $order->status,
                    'payment_method' => $order->payment_method,
                    'notes' => $order->notes,
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                    'product' => $order->product,
                ];
            }
        }
        
        // Manually paginate the grouped results
        $perPage = 15;
        $currentPage = $request->get('page', 1);
        $offset = ($currentPage - 1) * $perPage;
        $paginatedOrders = array_slice($groupedOrders, $offset, $perPage);
        $totalOrders = count($groupedOrders);

        return Inertia::render('admin/orders/index', [
            'orders' => $paginatedOrders,
            'pagination' => [
                'current_page' => $currentPage,
                'last_page' => ceil($totalOrders / $perPage),
                'per_page' => $perPage,
                'total' => $totalOrders,
                'from' => $offset + 1,
                'to' => min($offset + $perPage, $totalOrders),
            ],
            'filters' => $request->only(['search', 'status', 'country', 'payment_method', 'date_from', 'date_to', 'sort_by', 'sort_order']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_full_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_address' => 'required|string|max:1000',
            'customer_city' => 'required|string|max:100',
            'customer_country' => 'required|in:albania,kosovo,macedonia',
            'product_id' => 'required|exists:products,id',
            'product_price' => 'required|numeric|min:0',
            'product_size' => 'nullable|string|max:50',
            'product_color' => 'nullable|string|max:50',
            'quantity' => 'required|integer|min:1|max:100',
            'total_amount' => 'required|numeric|min:0',
            'shipping_fee' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $product = Product::with('sizeStocks')->findOrFail($request->product_id);
            
            Log::info('Order Creation - Product Details', [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'sizeStocks_count' => $product->sizeStocks()->count(),
                'sizeStocks_data' => $product->sizeStocks->toArray(),
                'requested_size' => $request->product_size,
                'requested_quantity' => $request->quantity,
                'shipping_fee' => $request->shipping_fee,
                'total_amount' => $request->total_amount,
            ]);
            
            // Check if product has size-specific stock tracking
            if ($product->sizeStocks()->count() > 0) {
                // Product uses per-size stock tracking
                if (empty($request->product_size)) {
                    Log::warning('Order Creation - Size required but not provided');
                    return response()->json([
                        'message' => 'Product size is required for this product',
                    ], 422);
                }

                // Find and lock the size stock for update
                $sizeStock = ProductSizeStock::where('product_id', $product->id)
                    ->where('size', $request->product_size)
                    ->lockForUpdate()
                    ->first();

                if (!$sizeStock) {
                    Log::warning('Order Creation - Size not found', [
                        'requested_size' => $request->product_size,
                        'available_sizes' => $product->sizeStocks->pluck('size')->toArray(),
                    ]);
                    
                    return response()->json([
                        'message' => 'Selected size is not available',
                        'requested_size' => $request->product_size,
                        'available_sizes' => $product->sizeStocks->pluck('size')->toArray(),
                    ], 422);
                }

                if ($sizeStock->quantity < $request->quantity) {
                    return response()->json([
                        'message' => "Insufficient stock for size {$request->product_size}. Only {$sizeStock->quantity} available.",
                    ], 422);
                }

                // Decrement the size-specific stock
                $sizeStock->quantity -= $request->quantity;
                $sizeStock->save();
            } else {
                // Product uses total stock tracking (backward compatibility)
                if ($product->stock_quantity < $request->quantity) {
                    return response()->json([
                        'message' => "Insufficient stock. Only {$product->stock_quantity} available.",
                    ], 422);
                }

                $product->update(['stock_quantity' => $product->stock_quantity - $request->quantity]);
            }
            
            // Use the total amount sent from frontend (includes shipping fee)
            $productPrice = $request->product_price;
            $totalAmount = $request->total_amount;
            $shippingFee = $request->shipping_fee;

            // Resolve and normalize product image (prefer medialibrary URL, then product.image)
            $productImage = ImageUrlNormalizer::fromProduct($product);

            // Generate or reuse batch_id for multi-orders
            $batchId = $request->batch_id ?? null;
            
            $order = Order::create([
                'batch_id' => $batchId,
                'customer_full_name' => $request->customer_full_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'customer_address' => $request->customer_address,
                'customer_city' => $request->customer_city,
                'customer_country' => $request->customer_country,
                'product_id' => $request->product_id,
                'product_name' => $product->name,
                'product_price' => $productPrice,
                'product_image' => $productImage,
                'product_size' => $request->product_size,
                'product_color' => $request->product_color,
                'quantity' => $request->quantity,
                'total_amount' => $totalAmount,
                'payment_method' => 'cash',
                'notes' => $request->notes,
            ]);

            DB::commit();

            // Check if this is part of a multi-order batch
            // Look for recent orders from same customer (within last 10 seconds)
            $recentOrders = Order::where('customer_email', $order->customer_email)
                ->where('created_at', '>=', now()->subSeconds(10))
                ->orderBy('created_at', 'asc')
                ->get();

            // Only send emails if this is the last order or if it's been more than 3 seconds since last order
            $shouldSendEmails = true;
            $isMultiOrder = $recentOrders->count() > 1;
            
            // Flag this order to prevent duplicate emails if more orders come quickly
            cache()->put("order_batch_{$order->customer_email}", $order->id, now()->addSeconds(5));

            // Delay email sending to allow batching (wait 3 seconds for potential additional orders)
            if ($request->has('is_batch_order') && $request->is_batch_order) {
                $shouldSendEmails = false;
                
                // Schedule email check after delay
                dispatch(function() use ($order) {
                    $this->sendBatchedEmails($order);
                })->delay(now()->addSeconds(3));
            }

            if ($shouldSendEmails && !$request->has('is_batch_order')) {
                try {
                    if ($isMultiOrder) {
                        // Send multi-order email with all related orders
                        $totalAmount = $recentOrders->sum('total_amount');
                        Mail::to($order->customer_email)->send(new \App\Mail\MultiOrderPlaced($recentOrders, $totalAmount));
                        Mail::to(config('mail.admin_email'))->send(new \App\Mail\MultiOrderNotificationAdmin($recentOrders, $totalAmount));
                    } else {
                        // Send single order email
                        Mail::to($order->customer_email)->send(new OrderPlaced($order));
                        Mail::to(config('mail.admin_email'))->send(new OrderNotificationAdmin($order));
                    }
                    
                    Log::info('Order emails sent successfully', [
                        'order_id' => $order->id,
                        'is_multi_order' => $isMultiOrder,
                        'customer_email' => $order->customer_email,
                    ]);
                } catch (\Exception $emailException) {
                    Log::error('Failed to send order emails: ' . $emailException->getMessage(), [
                        'order_id' => $order->id,
                        'trace' => $emailException->getTraceAsString(),
                    ]);
                }
            }

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order->load('product'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating order: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'message' => 'Failed to create order',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load('product'));
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Store the previous status for email notification
        $previousStatus = $order->status;
        $newStatus = $request->status;

        $updateData = [
            'status' => $newStatus,
            'notes' => $request->notes,
        ];

        // Set timestamps based on status
        if ($newStatus === 'confirmed' && $order->status !== 'confirmed') {
            $updateData['confirmed_at'] = now();
        } elseif ($newStatus === 'shipped' && $order->status !== 'shipped') {
            $updateData['shipped_at'] = now();
        } elseif ($newStatus === 'delivered' && $order->status !== 'delivered') {
            $updateData['delivered_at'] = now();
        }

        $order->update($updateData);

        // Send email notification if status actually changed
        if ($previousStatus !== $newStatus) {
            try {
                // Load product relationship for the email
                $order->load('product');
                
                // Log attempt with mail configuration
                Log::info("Attempting to send order status update email", [
                    'order_id' => $order->id,
                    'unique_id' => $order->unique_id,
                    'customer_email' => $order->customer_email,
                    'previous_status' => $previousStatus,
                    'new_status' => $newStatus,
                    'mail_driver' => config('mail.default'),
                    'mail_from' => config('mail.from.address'),
                ]);
                
                // Send email immediately (not queued) since queue worker may not be running
                Mail::to($order->customer_email)->send(
                    new OrderStatusUpdated($order, $previousStatus, $newStatus)
                );

                Log::info("✅ Order status update email sent successfully", [
                    'order_id' => $order->id,
                    'customer_email' => $order->customer_email,
                    'previous_status' => $previousStatus,
                    'new_status' => $newStatus,
                ]);
            } catch (\Exception $e) {
                // Log the error but don't fail the status update
                Log::error("❌ Failed to send order status update email", [
                    'order_id' => $order->id,
                    'customer_email' => $order->customer_email,
                    'previous_status' => $previousStatus,
                    'new_status' => $newStatus,
                    'error_message' => $e->getMessage(),
                    'error_file' => $e->getFile(),
                    'error_line' => $e->getLine(),
                    'mail_driver' => config('mail.default'),
                    'mail_host' => config('mail.mailers.smtp.host'),
                    'mail_port' => config('mail.mailers.smtp.port'),
                    'mail_from' => config('mail.from.address'),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        return response()->json([
            'message' => 'Order updated successfully',
            'order' => $order->load('product'),
        ]);
    }

    public function destroy(Order $order): JsonResponse
    {
        $order->delete();

        return response()->json([
            'message' => 'Order deleted successfully',
        ]);
    }

    public function checkout(Product $product): Response
    {
        // Debug: Log the product data
        Log::info('Checkout accessed for product', [
            'product_id' => $product->id,
            'product_name' => $product->name,
        ]);

        try {
            // Load product with category and size stocks
            $product->load(['category', 'sizeStocks']);
            
            // Format sizeStocks as associative array for frontend
            $productData = $product->toArray();
            if ($product->sizeStocks->isNotEmpty()) {
                $productData['sizeStocks'] = $product->sizeStocks->mapWithKeys(function ($stock) {
                    return [$stock->size => [
                        'quantity' => $stock->quantity,
                        'stock_status' => $stock->stock_status
                    ]];
                })->toArray();
            }
            
            return Inertia::render('checkout/index', [
                'product' => $productData,
            ]);
        } catch (\Exception $e) {
            Log::error('Checkout error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // For debugging, throw the exception to see the actual error
            throw $e;
        }
    }

    public function success(Request $request)
    {
        $orderId = $request->query('order_id');

        if (! $orderId) {
            // If no order ID provided, redirect to home
            return redirect()->route('home');
        }

        $order = Order::where('unique_id', $orderId)->with('product')->first();

        if (! $order) {
            // If order not found, redirect to home
            return redirect()->route('home');
        }

        return Inertia::render('order/success', [
            'order' => $order,
        ]);
    }

    /**
     * Send batched emails for multiple orders from same customer
     */
    private function sendBatchedEmails($order)
    {
        try {
            // Get all recent orders from this customer (within last 5 seconds)
            $recentOrders = Order::where('customer_email', $order->customer_email)
                ->where('created_at', '>=', now()->subSeconds(5))
                ->get();

            if ($recentOrders->count() > 1) {
                // Multiple orders - send grouped email
                $totalAmount = $recentOrders->sum('total_amount');
                Mail::to($order->customer_email)->send(new \App\Mail\MultiOrderPlaced($recentOrders, $totalAmount));
                Mail::to(config('mail.admin_email'))->send(new \App\Mail\MultiOrderNotificationAdmin($recentOrders, $totalAmount));
                
                Log::info('Batched order emails sent', [
                    'order_count' => $recentOrders->count(),
                    'customer_email' => $order->customer_email,
                ]);
            } else {
                // Single order - send regular email
                Mail::to($order->customer_email)->send(new OrderPlaced($order));
                Mail::to(config('mail.admin_email'))->send(new OrderNotificationAdmin($order));
                
                Log::info('Single order email sent', [
                    'order_id' => $order->id,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send batched emails: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
