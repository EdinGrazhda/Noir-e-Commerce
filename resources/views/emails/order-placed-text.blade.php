Order Confirmation - NOIR

Hi {{ $order->customer_full_name }},

Thank you for your order! Here are your order details:

Order Number: {{ $order->order_number }}

PRODUCT DETAILS
- Product: {{ $order->product_name }}
@if($order->product_size)- Size: {{ strtoupper($order->product_size) }}
@endif
@if($order->product_color)- Color: {{ $order->product_color }}
@endif
- Quantity: {{ $order->quantity }}
- Unit Price: €{{ number_format($order->product_price, 2) }}

ORDER SUMMARY
- Subtotal: €{{ number_format($order->product_price * $order->quantity, 2) }}
@if($order->shipping_fee > 0)- {{ $order->customer_country === 'kosovo' ? 'COD Postman Fee' : 'Shipping' }}: €{{ number_format($order->shipping_fee, 2) }}
@endif
- Total Amount: €{{ number_format($order->total_amount, 2) }}

SHIPPING INFORMATION
- Name: {{ $order->customer_full_name }}
- Email: {{ $order->customer_email }}
- Phone: {{ $order->customer_phone }}
- Address: {{ $order->customer_address }}
- City: {{ $order->customer_city }}
- Country: {{ ucfirst($order->customer_country) }}

Payment Method: Cash on Delivery
You will pay €{{ number_format($order->total_amount, 2) }} when you receive your order.

Need help? Contact us at info@noirclothes.shop

NOIR - Premium Clothing
This is an automated email. Please do not reply directly to this message.
