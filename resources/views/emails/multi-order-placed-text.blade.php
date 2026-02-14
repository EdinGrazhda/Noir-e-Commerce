Order Confirmation - {{ $orders->count() }} Items - NOIR

Hi {{ $customerInfo['name'] }},

Thank you for your order! Here are your order details:

@foreach($orders as $index => $order)
ITEM {{ $index + 1 }}: {{ $order->product_name }}
@if($order->product_size)- Size: {{ strtoupper($order->product_size) }}
@endif
@if($order->product_color)- Color: {{ $order->product_color }}
@endif
- Quantity: {{ $order->quantity }}
- Price: €{{ number_format($order->product_price, 2) }} x {{ $order->quantity }} = €{{ number_format($order->total_amount, 2) }}

@endforeach
ORDER SUMMARY
- Subtotal: €{{ number_format($orders->sum(function($o) { return $o->product_price * $o->quantity; }), 2) }}
@if($orders->sum('shipping_fee') > 0)- {{ $orders->first()->customer_country === 'kosovo' ? 'COD Postman Fee' : 'Shipping' }}: €{{ number_format($orders->sum('shipping_fee'), 2) }}
@endif
- Total Amount: €{{ number_format($totalAmount, 2) }}

SHIPPING INFORMATION
- Name: {{ $customerInfo['name'] }}
- Address: {{ $customerInfo['address'] }}, {{ $customerInfo['city'] }}
- Country: {{ ucfirst($customerInfo['country']) }}
- Phone: {{ $customerInfo['phone'] }}

Payment Method: Cash on Delivery
You will pay €{{ number_format($totalAmount, 2) }} when you receive your order.

Need help? Contact us at info@noirclothes.shop

NOIR - Premium Clothing
This is an automated email. Please do not reply directly to this message.
