<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
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
            max-width: 650px;
            margin: 20px auto;
            background: #fff;
            border-radius: 0;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            color: #fff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        .header p {
            margin: 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .success-message {
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin-bottom: 25px;
            border-radius: 0;
        }
        .success-message p {
            margin: 0;
            color: #2e7d32;
            font-size: 16px;
        }
        .customer-info {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 0;
            margin: 20px 0;
        }
        .customer-info h2 {
            color: #000000;
            margin-top: 0;
            font-size: 18px;
            border-bottom: 2px solid #000000;
            padding-bottom: 10px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
        }
        .label {
            font-weight: bold;
            color: #666;
        }
        .value {
            color: #333;
        }
        .products-section {
            margin: 25px 0;
        }
        .products-section h2 {
            color: #000000;
            font-size: 20px;
            margin-bottom: 15px;
        }
        .product-card {
            background: #fff;
            border: 2px solid #000000;
            border-radius: 0;
            padding: 15px;
            margin-bottom: 15px;
            display: flex;
            gap: 15px;
        }
        .product-image {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 0;
            flex-shrink: 0;
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
            color: #333;
            margin: 0;
        }
        .order-id {
            font-size: 11px;
            color: #666;
            background: #f0f0f0;
            padding: 3px 8px;
            border-radius: 3px;
        }
        .product-info {
            font-size: 14px;
            color: #666;
            margin: 5px 0;
        }
        .product-price {
            font-size: 16px;
            font-weight: bold;
            color: #000000;
            margin-top: 8px;
        }
        .summary-box {
            background: #f9f9f9;
            border: 2px solid #000000;
            border-radius: 0;
            padding: 20px;
            margin: 25px 0;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 15px;
        }
        .summary-row.total {
            border-top: 2px solid #000000;
            margin-top: 10px;
            padding-top: 15px;
            font-size: 20px;
            font-weight: bold;
            color: #000000;
        }
        .payment-info {
            background: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0;
        }
        .payment-info h3 {
            margin-top: 0;
            color: #f57c00;
            font-size: 16px;
        }
        .payment-info p {
            margin: 5px 0;
            color: #666;
        }
        .footer {
            background: #f9f9f9;
            padding: 25px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .footer a {
            color: #000000;
            text-decoration: none;
            font-weight: bold;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .social-links {
            margin: 15px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #000000;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>✓ Order Confirmed!</h1>
            <p>Thank you for your purchase</p>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Success Message -->
            <div class="success-message">
                <p>Your order has been successfully placed! We're preparing {{ count($orders) }} {{ count($orders) === 1 ? 'item' : 'items' }} for delivery.</p>
            </div>

            <!-- Customer Information -->
            <div class="customer-info">
                <h2>Delivery Information</h2>
                <div class="info-row">
                    <span class="label">Name:</span>
                    <span class="value">{{ $customerInfo['name'] }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Email:</span>
                    <span class="value">{{ $customerInfo['email'] }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Phone:</span>
                    <span class="value">{{ $customerInfo['phone'] }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Address:</span>
                    <span class="value">{{ $customerInfo['address'] }}, {{ $customerInfo['city'] }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Country:</span>
                    <span class="value">{{ ucfirst($customerInfo['country']) }}</span>
                </div>
            </div>

            <!-- Products -->
            <div class="products-section">
                <h2>Your Items ({{ count($orders) }})</h2>
                
                @foreach($orders as $order)
                <div class="product-card">
                    @if(isset($productImageCids[$order->id]))
                        <img src="cid:{{ $productImageCids[$order->id] }}" alt="{{ $order->product_name }}" class="product-image">
                    @endif
                    
                    <div class="product-details">
                        <div class="product-header">
                            <h3 class="product-name">{{ $order->product_name }}</h3>
                            <span class="order-id">#{{ $order->order_number }}</span>
                        </div>
                        
                        <div class="product-info">
                            @if($order->product_size)
                                <strong>Size:</strong> {{ $order->product_size }} &nbsp;
                            @endif
                            @if($order->product_color)
                                <strong>Color:</strong> {{ $order->product_color }}
                            @endif
                        </div>
                        
                        <div class="product-info">
                            <strong>Quantity:</strong> {{ $order->quantity }}
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
                    <span>Subtotal:</span>
                    <span>€{{ number_format($orders->sum('product_price') * $orders->sum('quantity'), 2) }}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping:</span>
                    <span>
                        @if($orders->sum('shipping_fee') == 0)
                            <span style="color: #4caf50; font-weight: bold;">FREE</span>
                        @else
                            €{{ number_format($orders->sum('shipping_fee'), 2) }}
                        @endif
                    </span>
                </div>
                <div class="summary-row total">
                    <span>Total Amount:</span>
                    <span>€{{ number_format($totalAmount, 2) }}</span>
                </div>
            </div>

            <!-- Payment Info -->
            <div class="payment-info">
                <h3>💰 Payment Method</h3>
                <p><strong>Cash on Delivery (COD)</strong></p>
                <p>You will pay €{{ number_format($totalAmount, 2) }} when you receive your order.</p>
            </div>

            <!-- Next Steps -->
            <div style="background: #e3f2fd; padding: 15px; border-radius: 0; margin: 20px 0;">
                <h3 style="color: #1976d2; margin-top: 0; font-size: 16px;">📌 What's Next?</h3>
                <ol style="margin: 10px 0; padding-left: 20px; color: #666;">
                    <li>We'll prepare your items for delivery</li>
                    <li>You'll receive tracking updates via email</li>
                    <li>Your order will arrive within 3-5 business days</li>
                    <li>Pay cash when you receive your delivery</li>
                </ol>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>NOIR eCommerce</strong> - Premium Footwear Collection</p>
            <p>Questions? Contact us at <a href="mailto:support@noir-ecommerce.com">support@noir-ecommerce.com</a></p>
            <p style="margin-top: 15px; font-size: 12px; color: #999;">
                This is an automated message. Please do not reply directly to this email.
            </p>
        </div>
    </div>
</body>
</html>
