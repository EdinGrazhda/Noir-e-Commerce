<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 650px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 0;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .header {
            background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #ffffff;
            padding: 40px 30px;
            text-align: center;
            border-bottom: 3px solid #000000;
        }
        .header h1 {
            margin: 0 0 8px 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
            text-transform: uppercase;
        }
        .header p {
            margin: 0;
            opacity: 0.9;
            font-size: 14px;
            letter-spacing: 0.5px;
            font-weight: 300;
        }
        .content {
            padding: 40px 30px;
        }
        .success-message {
            background: #f8f8f8;
            border-left: 3px solid #000000;
            padding: 16px 20px;
            margin-bottom: 30px;
            border-radius: 0;
        }
        .success-message strong {
            color: #000000;
            font-weight: 600;
            display: block;
            margin-bottom: 4px;
        }
        .customer-info {
            background: #fafafa;
            padding: 25px;
            border-radius: 0;
            margin: 25px 0;
            border: 1px solid #e5e5e5;
        }
        .customer-info h2 {
            color: #000000;
            margin-top: 0;
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid #000000;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e5e5;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: 600;
            color: #666666;
            font-size: 14px;
        }
        .value {
            color: #1a1a1a;
            font-weight: 500;
            font-size: 14px;
        }
        .product-card {
            background: #ffffff;
            border: 2px solid #000000;
            border-radius: 0;
            padding: 0;
            margin: 30px 0;
            overflow: hidden;
        }
        .card-header {
            background: #000000;
            color: white;
            padding: 16px 25px;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .product-content {
            padding: 25px;
        }
        .product-info {
            width: 100%;
        }
        .product-name {
            font-size: 20px;
            font-weight: 700;
            color: #000000;
            margin: 0 0 16px 0;
            letter-spacing: -0.3px;
        }
        .product-specs {
            display: grid;
            gap: 10px;
        }
        .spec-row {
            display: flex;
            font-size: 14px;
            padding: 8px 0;
        }
        .spec-label {
            font-weight: 600;
            color: #666666;
            width: 110px;
            flex-shrink: 0;
        }
        .spec-value {
            color: #1a1a1a;
            font-weight: 500;
        }
        .summary-box {
            background: #1a1a1a;
            color: white;
            padding: 25px;
            border-radius: 0;
            margin: 30px 0;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 15px;
            font-weight: 500;
        }
        .summary-total {
            border-top: 2px solid rgba(255, 255, 255, 0.2);
            margin-top: 12px;
            padding-top: 16px;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .shipping-box {
            background: #fafafa;
            border-left: 3px solid #000000;
            padding: 25px;
            border-radius: 0;
            margin: 30px 0;
        }
        .shipping-box h3 {
            color: #000000;
            margin: 0 0 18px 0;
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .shipping-grid {
            display: grid;
            gap: 10px;
        }
        .shipping-row {
            display: flex;
            font-size: 14px;
            padding: 8px 0;
        }
        .shipping-label {
            font-weight: 600;
            color: #666666;
            width: 110px;
            flex-shrink: 0;
        }
        .shipping-value {
            color: #1a1a1a;
            font-weight: 500;
        }
        .footer {
            background: #1a1a1a;
            padding: 30px;
            text-align: center;
            color: #ffffff;
            font-size: 13px;
        }
        .footer a {
            color: #ffffff;
            text-decoration: none;
            font-weight: 600;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 0;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-pending {
            background: #f5f5f5;
            color: #666666;
            border: 1px solid #d0d0d0;
        }
        .status-processing {
            background: #1a1a1a;
            color: #ffffff;
        }
        .status-completed {
            background: #000000;
            color: #ffffff;
        }
        .info-box {
            margin-top: 30px;
            padding: 20px;
            background: #f8f8f8;
            border-radius: 0;
            border-left: 3px solid #000000;
            font-size: 14px;
            line-height: 1.6;
        }
        .info-box strong {
            display: block;
            margin-bottom: 8px;
            color: #000000;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmed</h1>
            <p>Thank you for your purchase</p>
        </div>

        <div class="content">
            <div class="success-message">
                <strong>✓ Order Confirmed!</strong>
                Your order has been received and is being processed.
            </div>

            <div class="customer-info">
                <h2>Order Details</h2>
                <div class="info-row">
                    <span class="label">Order Number:</span>
                    <span class="value">#{{ $order->order_number }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Order Date:</span>
                    <span class="value">{{ $order->created_at->format('F d, Y - H:i') }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Status:</span>
                    <span class="value">
                        <span class="status-badge status-{{ $order->status }}">
                            {{ ucfirst($order->status) }}
                        </span>
                    </span>
                </div>
            </div>

            <div class="product-card">
                <div class="card-header">
                    Your Product
                </div>
                <div class="product-content">
                    <div class="product-info">
                        <h3 class="product-name">{{ $order->product_name }}</h3>
                        <div class="product-specs">
                            @if($order->product_size)
                            <div class="spec-row">
                                <span class="spec-label">Size:</span>
                                <span class="spec-value">{{ strtoupper($order->product_size) }}</span>
                            </div>
                            @endif
                            @if($order->product_color)
                            <div class="spec-row">
                                <span class="spec-label">Color:</span>
                                <span class="spec-value">{{ $order->product_color }}</span>
                            </div>
                            @endif
                            <div class="spec-row">
                                <span class="spec-label">Quantity:</span>
                                <span class="spec-value">{{ $order->quantity }}</span>
                            </div>
                            <div class="spec-row">
                                <span class="spec-label">Unit Price:</span>
                                <span class="spec-value">€{{ number_format($order->product_price, 2) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="summary-box">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>€{{ number_format($order->product_price * $order->quantity, 2) }}</span>
                </div>
                @if($order->shipping_fee > 0)
                <div class="summary-row">
                    <span>{{ $order->customer_country === 'kosovo' ? 'COD Postman Fee:' : 'Shipping:' }}</span>
                    <span>€{{ number_format($order->shipping_fee, 2) }}</span>
                </div>
                @endif
                <div class="summary-row summary-total">
                    <span>Total Amount:</span>
                    <span>€{{ number_format($order->total_amount, 2) }}</span>
                </div>
            </div>

            <div class="shipping-box">
                <h3>Shipping Information</h3>
                <div class="shipping-grid">
                    <div class="shipping-row">
                        <span class="shipping-label">Name:</span>
                        <span class="shipping-value">{{ $order->customer_full_name }}</span>
                    </div>
                    <div class="shipping-row">
                        <span class="shipping-label">Email:</span>
                        <span class="shipping-value">{{ $order->customer_email }}</span>
                    </div>
                    <div class="shipping-row">
                        <span class="shipping-label">Phone:</span>
                        <span class="shipping-value">{{ $order->customer_phone }}</span>
                    </div>
                    <div class="shipping-row">
                        <span class="shipping-label">Country:</span>
                        <span class="shipping-value">{{ ucfirst($order->customer_country) }}</span>
                    </div>
                    <div class="shipping-row">
                        <span class="shipping-label">City:</span>
                        <span class="shipping-value">{{ $order->customer_city }}</span>
                    </div>
                    <div class="shipping-row">
                        <span class="shipping-label">Address:</span>
                        <span class="shipping-value">{{ $order->customer_address }}</span>
                    </div>
                </div>
            </div>

            <div class="info-box">
                <strong>What's Next?</strong>
                We'll send you another email with tracking information once your order ships. 
                If you have any questions, feel free to contact us at any time.
            </div>
        </div>

        <div class="footer">
            <p style="margin: 0 0 12px 0; font-weight: 700; font-size: 16px; letter-spacing: 2px; text-transform: uppercase;">NOIR eCommerce</p>
            <p style="margin: 12px 0;">
                Need help? Contact us at 
                <a href="mailto:info@noirclothes.shop">info@noirclothes.shop</a>
            </p>
            <p style="margin-top: 20px; font-size: 11px; opacity: 0.7;">
                This is an automated email. Please do not reply directly to this message.
            </p>
        </div>
    </div>
</body>
</html>
