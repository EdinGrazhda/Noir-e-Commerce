<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order - Admin Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 700px;
            margin: 20px auto;
            background: #fff;
            border-radius: 0;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .header {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            color: #fff;
            padding: 25px 30px;
        }
        .header h1 {
            margin: 0 0 5px 0;
            font-size: 24px;
        }
        .header p {
            margin: 0;
            opacity: 0.9;
            font-size: 14px;
        }
        .alert {
            background: #ff5722;
            color: white;
            padding: 15px 30px;
            font-weight: bold;
            font-size: 16px;
        }
        .content {
            padding: 30px;
        }
        .customer-section {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0;
        }
        .customer-section h2 {
            margin-top: 0;
            color: #1976d2;
            font-size: 18px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
        .info-item {
            padding: 8px 0;
        }
        .info-label {
            font-weight: bold;
            color: #555;
            font-size: 13px;
        }
        .info-value {
            color: #333;
            font-size: 14px;
            margin-top: 3px;
        }
        .products-section {
            margin: 25px 0;
        }
        .section-title {
            background: #000000;
            color: white;
            padding: 12px 15px;
            margin: 0 0 15px 0;
            border-radius: 0;
            font-size: 16px;
            font-weight: bold;
        }
        .product-card {
            background: #fafafa;
            border: 2px solid #ddd;
            border-radius: 0;
            padding: 15px;
            margin-bottom: 12px;
            display: flex;
            gap: 15px;
        }
        .product-image {
            width: 90px;
            height: 90px;
            object-fit: cover;
            border-radius: 0;
            flex-shrink: 0;
            border: 2px solid #000000;
        }
        .product-details {
            flex: 1;
        }
        .product-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 8px;
        }
        .product-name {
            font-size: 16px;
            font-weight: bold;
            color: #000000;
            margin: 0;
        }
        .order-number {
            background: #000000;
            color: white;
            padding: 4px 10px;
            border-radius: 0;
            font-size: 12px;
            font-weight: bold;
        }
        .product-specs {
            background: white;
            padding: 10px;
            border-radius: 0;
            margin: 8px 0;
            font-size: 13px;
        }
        .spec-item {
            display: inline-block;
            margin-right: 15px;
            color: #666;
        }
        .spec-label {
            font-weight: bold;
            color: #333;
        }
        .product-price {
            font-size: 15px;
            font-weight: bold;
            color: #000000;
            margin-top: 8px;
        }
        .summary-box {
            background: #fff8e1;
            border: 3px solid #ffc107;
            border-radius: 0;
            padding: 20px;
            margin: 25px 0;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 15px;
        }
        .summary-row.total {
            border-top: 2px solid #ffc107;
            margin-top: 12px;
            padding-top: 12px;
            font-size: 22px;
            font-weight: bold;
            color: #000000;
        }
        .action-section {
            background: #e8f5e9;
            border: 2px solid #4caf50;
            border-radius: 0;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        .action-section h3 {
            color: #2e7d32;
            margin-top: 0;
        }
        .action-button {
            display: inline-block;
            background: #000000;
            color: white;
            padding: 12px 30px;
            border-radius: 0;
            text-decoration: none;
            font-weight: bold;
            margin-top: 10px;
        }
        .footer {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 13px;
            border-top: 3px solid #000000;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>New Multi-Item Order Received</h1>
            <p>{{ now()->format('F j, Y - H:i:s') }}</p>
        </div>

        <div class="alert">
            ACTION REQUIRED: {{ count($orders) }} items ordered - Total: €{{ number_format($totalAmount, 2) }}
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Customer Information -->
            <div class="customer-section">
                <h2>Customer Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Full Name</div>
                        <div class="info-value">{{ $customerInfo['name'] }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">{{ $customerInfo['email'] }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Phone</div>
                        <div class="info-value">{{ $customerInfo['phone'] }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Country</div>
                        <div class="info-value">{{ ucfirst($customerInfo['country']) }}</div>
                    </div>
                    <div class="info-item" style="grid-column: 1 / -1;">
                        <div class="info-label">Delivery Address</div>
                        <div class="info-value">{{ $customerInfo['address'] }}, {{ $customerInfo['city'] }}</div>
                    </div>
                </div>
            </div>

            <!-- Products -->
            <div class="products-section">
                <div class="section-title">Order Items ({{ count($orders) }} products)</div>
                
                @foreach($orders as $order)
                <div class="product-card">
                    @if(isset($productImageCids[$order->id]))
                        <img src="cid:{{ $productImageCids[$order->id] }}" alt="{{ $order->product_name }}" class="product-image">
                    @endif
                    
                    <div class="product-details">
                        <div class="product-header">
                            <h3 class="product-name">{{ $order->product_name }}</h3>
                            <span class="order-number">#{{ $order->order_number }}</span>
                        </div>
                        
                        <div class="product-specs">
                            @if($order->product_size)
                                <span class="spec-item">
                                    <span class="spec-label">Size:</span> {{ $order->product_size }}
                                </span>
                            @endif
                            @if($order->product_color)
                                <span class="spec-item">
                                    <span class="spec-label">Color:</span> {{ $order->product_color }}
                                </span>
                            @endif
                            <span class="spec-item">
                                <span class="spec-label">Qty:</span> {{ $order->quantity }}
                            </span>
                            <span class="spec-item">
                                <span class="spec-label">Status:</span> <span style="color: #ff9800;">{{ ucfirst($order->status) }}</span>
                            </span>
                        </div>
                        
                        <div class="product-price">
                            €{{ number_format($order->product_price, 2) }} × {{ $order->quantity }} = €{{ number_format($order->total_amount, 2) }}
                        </div>
                    </div>
                </div>
                @endforeach
            </div>

            <!-- Order Summary -->
            <div class="summary-box">
                <div class="summary-row">
                    <span><strong>Total Items:</strong></span>
                    <span>{{ $orders->sum('quantity') }} items ({{ count($orders) }} products)</span>
                </div>
                <div class="summary-row">
                    <span><strong>Products Subtotal:</strong></span>
                    <span>€{{ number_format($orders->sum('product_price') * $orders->sum('quantity'), 2) }}</span>
                </div>
                <div class="summary-row">
                    <span><strong>Shipping Fee:</strong></span>
                    <span>
                        @if($orders->sum('shipping_fee') == 0)
                            <span style="color: #4caf50; font-weight: bold;">FREE (Kosovo)</span>
                        @else
                            €{{ number_format($orders->sum('shipping_fee'), 2) }}
                        @endif
                    </span>
                </div>
                <div class="summary-row total">
                    <span>TOTAL AMOUNT:</span>
                    <span>€{{ number_format($totalAmount, 2) }}</span>
                </div>
            </div>

            <!-- Payment Info -->
            <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; border-radius: 0; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #f57c00; font-size: 15px;">💰 Payment Method</h3>
                <p style="margin: 5px 0; color: #666;"><strong>Cash on Delivery (COD)</strong></p>
                <p style="margin: 5px 0; color: #666;">Customer will pay €{{ number_format($totalAmount, 2) }} upon delivery</p>
            </div>

            <!-- Action Required -->
            <div class="action-section">
                <h3>Next Steps</h3>
                <ol style="text-align: left; color: #666; margin: 15px 0;">
                    <li>Prepare {{ count($orders) }} items for packaging</li>
                    <li>Verify product availability and quality</li>
                    <li>Update order status in admin panel</li>
                    <li>Arrange delivery within 3-5 business days</li>
                    <li>Send tracking information to customer</li>
                </ol>
                <a href="{{ url('/admin/orders') }}" class="action-button">View in Admin Panel →</a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>NOIR eCommerce Admin Panel</strong></p>
            <p>This is an automated admin notification</p>
            <p style="margin-top: 10px; font-size: 12px; color: #999;">
                Generated at {{ now()->format('Y-m-d H:i:s') }}
            </p>
        </div>
    </div>
</body>
</html>
