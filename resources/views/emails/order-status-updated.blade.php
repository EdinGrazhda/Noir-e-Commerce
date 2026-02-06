<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update - NOIR eCommerce</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .email-container {
            background-color: white;
            border-radius: 0;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 30px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #000000;
            margin-bottom: 10px;
            text-decoration: none;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .tagline {
            color: #64748b;
            font-size: 14px;
            margin: 0;
        }
        .status-update-section {
            background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
            color: white;
            padding: 30px;
            border-radius: 0;
            text-align: center;
            margin-bottom: 30px;
        }
        .status-update-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
            margin-top: 0;
        }
        .status-change {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        .status-badge {
            padding: 8px 16px;
            border-radius: 0;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-pending { background-color: #f5f5f5; color: #666666; border: 1px solid #d0d0d0; }
        .status-confirmed { background-color: #1a1a1a; color: #ffffff; }
        .status-processing { background-color: #2d2d2d; color: #ffffff; }
        .status-shipped { background-color: #000000; color: #ffffff; }
        .status-delivered { background-color: #000000; color: #ffffff; }
        .status-cancelled { background-color: #f5f5f5; color: #1a1a1a; border: 1px solid #d0d0d0; }
        .arrow {
            color: white;
            font-size: 20px;
            font-weight: bold;
        }
        .order-details {
            background-color: #f8fafc;
            border-radius: 0;
            padding: 25px;
            margin: 30px 0;
        }
        .order-details h3 {
            color: #1f2937;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 18px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
            border-bottom: none;
            font-weight: bold;
            margin-top: 10px;
            padding-top: 15px;
            border-top: 2px solid #d1d5db;
        }
        .detail-label {
            color: #6b7280;
            font-weight: 500;
        }
        .detail-value {
            color: #111827;
            font-weight: 600;
        }
        .status-message {
            padding: 20px;
            margin: 20px 0;
            border-radius: 0;
            border-left: 4px solid #10b981;
            background-color: #f0fdf4;
        }
        .status-message.confirmed {
            border-left-color: #10b981;
            background-color: #f0fdf4;
            color: #166534;
        }
        .status-message.processing {
            border-left-color: #3b82f6;
            background-color: #eff6ff;
            color: #1d4ed8;
        }
        .status-message.shipped {
            border-left-color: #8b5cf6;
            background-color: #f5f3ff;
            color: #6d28d9;
        }
        .status-message.delivered {
            border-left-color: #10b981;
            background-color: #f0fdf4;
            color: #166534;
        }
        .status-message.cancelled {
            border-left-color: #1a1a1a;
            background-color: #f5f5f5;
            color: #1a1a1a;
        }
        .next-steps {
            background-color: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 0;
            padding: 20px;
            margin: 25px 0;
        }
        .next-steps h4 {
            color: #9a3412;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 16px;
        }
        .next-steps p {
            color: #c2410c;
            margin: 8px 0;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
        }
        .footer p {
            margin: 8px 0;
            font-size: 14px;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            color: #000000;
            text-decoration: none;
            margin: 0 10px;
            font-weight: 600;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .email-container {
                padding: 20px;
            }
            .status-change {
                flex-direction: column;
            }
            .arrow {
                transform: rotate(90deg);
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">NOIR eCommerce</div>
            <p class="tagline">Premium Footwear Collection</p>
        </div>

        <!-- Status Update Section -->
        <div class="status-update-section">
            <h2 class="status-update-title">Order Status Updated!</h2>
            <p>Your order #{{ $order->id }} status has been changed.</p>
            
            <div class="status-change">
                <span class="status-badge status-{{ $previousStatus }}">
                    {{ ucfirst($previousStatus) }}
                </span>
                <span class="arrow">→</span>
                <span class="status-badge status-{{ $newStatus }}">
                    {{ ucfirst($newStatus) }}
                </span>
            </div>
        </div>

        <!-- Status-specific Message -->
        @if($newStatus === 'confirmed')
            <div class="status-message confirmed">
                <h4>Great News! Your Order is Confirmed</h4>
                <p>Thank you for your purchase! We've received your payment and confirmed your order. Our team is now preparing your items for shipment.</p>
            </div>
        @elseif($newStatus === 'processing')
            <div class="status-message processing">
                <h4>Your Order is Being Processed</h4>
                <p>We're carefully preparing your order for shipment. This includes quality checks and packaging to ensure your items arrive in perfect condition.</p>
            </div>
        @elseif($newStatus === 'shipped')
            <div class="status-message shipped">
                <h4>Your Order Has Been Shipped!</h4>
                <p>Exciting news! Your order is on its way to you. You should receive it within the next few business days depending on your location.</p>
            </div>
        @elseif($newStatus === 'delivered')
            <div class="status-message delivered">
                <h4>✅ Order Delivered Successfully!</h4>
                <p>Your order has been delivered! We hope you love your new shoes. If you have any issues, please don't hesitate to contact us.</p>
            </div>
        @elseif($newStatus === 'cancelled')
            <div class="status-message cancelled">
                <h4>❌ Order Cancelled</h4>
                <p>Your order has been cancelled. If you didn't request this cancellation or have questions, please contact our customer service team.</p>
            </div>
        @endif

        <!-- Order Details -->
        <div class="order-details">
            <h3>Order Details</h3>
            <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">#{{ $order->id }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Product:</span>
                <span class="detail-value">{{ $order->product_name }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Size:</span>
                <span class="detail-value">{{ $order->size }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">{{ $order->quantity }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Customer:</span>
                <span class="detail-value">{{ $order->customer_name }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Shipping Country:</span>
                <span class="detail-value">
                    @if($order->customer_country === 'albania') 🇦🇱 Albania
                    @elseif($order->customer_country === 'kosovo') 🇽🇰 Kosovo
                    @elseif($order->customer_country === 'macedonia') 🇲🇰 Macedonia
                    @endif
                </span>
            </div>
            @if($order->shipping_fee > 0)
            <div class="detail-row">
                <span class="detail-label">Shipping Fee:</span>
                <span class="detail-value">€{{ number_format($order->shipping_fee, 2) }}</span>
            </div>
            @endif
            <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value">€{{ number_format($order->total_amount, 2) }}</span>
            </div>
        </div>

        <!-- Next Steps -->
        @if($newStatus === 'confirmed')
            <div class="next-steps">
                <h4>What happens next?</h4>
                <p>• We'll process your order within 1-2 business days</p>
                <p>• You'll receive a shipping notification when your order is dispatched</p>
                <p>• Track your order status anytime on our website</p>
            </div>
        @elseif($newStatus === 'processing')
            <div class="next-steps">
                <h4>What happens next?</h4>
                <p>• Your order will be packaged and prepared for shipping</p>
                <p>• You'll receive a shipping notification once it's dispatched</p>
                <p>• Expected processing time: 1-2 business days</p>
            </div>
        @elseif($newStatus === 'shipped')
            <div class="next-steps">
                <h4>Delivery Information</h4>
                <p>• Estimated delivery: 2-5 business days (depending on location)</p>
                <p>• Make sure someone is available to receive the package</p>
                <p>• Contact us if you don't receive it within the expected timeframe</p>
            </div>
        @elseif($newStatus === 'delivered')
            <div class="next-steps">
                <h4>Enjoy Your Purchase!</h4>
                <p>• We hope you love your new shoes!</p>
                <p>• If you have any issues, contact our support within 14 days</p>
                <p>• Consider leaving a review to help other customers</p>
            </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <p>Thank you for choosing <strong>NOIR eCommerce</strong>!</p>
            <p>If you have any questions, feel free to contact our customer service.</p>
            
            <div class="social-links">
                <a href="mailto:support@noir-ecommerce.com">Support</a>
                <a href="{{ config('app.url') }}">Visit Website</a>
            </div>
            
            <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                This email was sent to {{ $order->customer_email }} regarding order #{{ $order->id }}.
                <br>© {{ date('Y') }} NOIR eCommerce. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>