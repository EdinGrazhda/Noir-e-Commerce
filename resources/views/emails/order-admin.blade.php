<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Notification</title>
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
            margin: 0 0 12px 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
            text-transform: uppercase;
        }
        .alert-badge {
            display: inline-block;
            background: #ffffff;
            color: #000000;
            padding: 8px 24px;
            border-radius: 0;
            font-weight: 700;
            font-size: 12px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
        }
        .content {
            padding: 40px 30px;
        }
        .alert-message {
            background: #f8f8f8;
            border-left: 3px solid #000000;
            padding: 18px 20px;
            border-radius: 0;
            margin: 20px 0;
            font-size: 15px;
        }
        .alert-message strong {
            color: #000000;
            font-weight: 700;
        }
        .order-summary {
            background: #fafafa;
            border-left: 3px solid #000000;
            padding: 25px;
            border-radius: 0;
            margin: 30px 0;
        }
        .order-summary h3 {
            color: #000000;
            margin: 0 0 18px 0;
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .info-grid {
            display: grid;
            gap: 10px;
        }
        .info-row {
            display: flex;
            font-size: 14px;
        }
        .label {
            font-weight: 600;
            color: #666;
            width: 140px;
            flex-shrink: 0;
        }
        .value {
            color: #333;
            font-weight: 500;
        }
        .product-card {
            background: #fff;
            border: 2px solid #000000;
            border-radius: 0;
            padding: 0;
            margin: 25px 0;
            overflow: hidden;
        }
        .card-header {
            background: linear-gradient(135deg, #000000 0%, #2d2d2d 100%);
            color: white;
            padding: 15px 20px;
            font-size: 16px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .product-content {
            padding: 20px;
        }
        .product-info {
            width: 100%;
        }
        .product-name {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin: 0 0 12px 0;
        }
        .product-specs {
            display: grid;
            gap: 8px;
        }
        .spec-row {
            display: flex;
            font-size: 14px;
        }
        .spec-label {
            font-weight: 600;
            color: #666;
            width: 100px;
            flex-shrink: 0;
        }
        .spec-value {
            color: #333;
        }
        .summary-box {
            background: linear-gradient(135deg, #28a745 0%, #20883c 100%);
            color: white;
            padding: 20px;
            border-radius: 0;
            margin: 25px 0;
            text-align: center;
        }
        .summary-label {
            font-size: 14px;
            opacity: 0.9;
            margin: 0;
        }
        .summary-amount {
            font-size: 32px;
            font-weight: 700;
            margin: 5px 0;
        }
        .customer-box {
            background: #f8f9fa;
            border-left: 4px solid #000000;
            padding: 20px;
            border-radius: 0;
            margin: 25px 0;
        }
        .customer-box h3 {
            color: #000000;
            margin: 0 0 15px 0;
            font-size: 16px;
            font-weight: 600;
        }
        .customer-grid {
            display: grid;
            gap: 10px;
        }
        .customer-row {
            display: flex;
            font-size: 14px;
        }
        .customer-label {
            font-weight: 600;
            color: #666;
            width: 140px;
            flex-shrink: 0;
        }
        .customer-value {
            color: #333;
        }
        .customer-value a {
            color: #000000;
            text-decoration: none;
            font-weight: 600;
        }
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #000000 0%, #2d2d2d 100%);
            color: #fff !important;
            padding: 14px 35px;
            text-decoration: none;
            border-radius: 0;
            margin: 25px 0;
            font-weight: 600;
            font-size: 15px;
            box-shadow: 0 4px 8px rgba(119, 31, 72, 0.3);
        }
        .footer {
            background: #f8f9fa;
            padding: 25px 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 0;
            font-size: 13px;
            font-weight: 700;
        }
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        .status-processing {
            background: #d1ecf1;
            color: #0c5460;
        }
        .status-completed {
            background: #d4edda;
            color: #155724;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Order Alert!</h1>
            <div class="alert-badge">ACTION REQUIRED</div>
        </div>

        <div class="content">
            <div class="alert-message">
                <strong>New Order Alert!</strong> A customer has just placed an order. Please review and process it promptly.
            </div>

            <div class="order-summary">
                <h3>Order Information</h3>
                <div class="info-grid">
                    <div class="info-row">
                        <span class="label">Order Number:</span>
                        <span class="value"><strong>#{{ $order->order_number }}</strong></span>
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
                    <div class="info-row">
                        <span class="label">Payment Method:</span>
                        <span class="value">{{ ucfirst(str_replace('_', ' ', $order->payment_method)) }}</span>
                    </div>
                </div>
            </div>

            <div class="product-card">
                <div class="card-header">
                    Product Details
                </div>
                <div class="product-content">
                    <div class="product-info">
                        <h3 class="product-name">{{ $order->product_name }}</h3>
                        <div class="product-specs">
                            @if($order->product_size)
                            <div class="spec-row">
                                <span class="spec-label">Size:</span>
                                <span class="spec-value">{{ $order->product_size }}</span>
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
                <p class="summary-label">Total Order Value</p>
                <p class="summary-amount">€{{ number_format($order->total_amount, 2) }}</p>
            </div>

            <div class="customer-box">
                <h3>Customer Information</h3>
                <div class="customer-grid">
                    <div class="customer-row">
                        <span class="customer-label">Full Name:</span>
                        <span class="customer-value">{{ $order->customer_full_name }}</span>
                    </div>
                    <div class="customer-row">
                        <span class="customer-label">Email:</span>
                        <span class="customer-value">
                            <a href="mailto:{{ $order->customer_email }}">{{ $order->customer_email }}</a>
                        </span>
                    </div>
                    <div class="customer-row">
                        <span class="customer-label">Phone:</span>
                        <span class="customer-value">
                            <a href="tel:{{ $order->customer_phone }}">{{ $order->customer_phone }}</a>
                        </span>
                    </div>
                    <div class="customer-row">
                        <span class="customer-label">Country:</span>
                        <span class="customer-value">{{ ucfirst($order->customer_country) }}</span>
                    </div>
                    <div class="customer-row">
                        <span class="customer-label">City:</span>
                        <span class="customer-value">{{ $order->customer_city }}</span>
                    </div>
                    <div class="customer-row">
                        <span class="customer-label">Address:</span>
                        <span class="customer-value">{{ $order->customer_address }}</span>
                    </div>
                    @if($order->notes)
                    <div class="customer-row">
                        <span class="customer-label">Order Notes:</span>
                        <span class="customer-value"><em>{{ $order->notes }}</em></span>
                    </div>
                    @endif
                </div>
            </div>

            <div style="text-align: center;">
                <a href="{{ config('app.url') }}/admin/orders" class="action-button">
                    View in Admin Panel
                </a>
            </div>

            <p style="margin-top: 25px; padding: 18px 20px; background: #fff3cd; border-radius: 0; border-left: 5px solid #ffc107;">
                <strong>Action Required:</strong> Please process this order and update the customer with shipping information as soon as possible.
            </p>
        </div>

        <div class="footer">
            <p style="margin: 0 0 10px 0; font-weight: 600;">
                <strong style="color: #000000;">NOIR eCommerce</strong> Admin Panel
            </p>
            <p style="margin: 10px 0; font-size: 13px;">
                Order Management System
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #999;">
                This is an automated notification for new orders.
            </p>
        </div>
    </div>
</body>
</html>
