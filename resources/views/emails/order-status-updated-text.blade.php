Order Status Update - NOIR

Hi {{ $order->customer_full_name }},

Your order #{{ $order->order_number }} status has been updated.

Previous Status: {{ ucfirst($previousStatus) }}
New Status: {{ ucfirst($newStatus) }}

ORDER DETAILS
- Product: {{ $order->product_name }}
- Quantity: {{ $order->quantity }}
@if($order->shipping_fee > 0)- {{ $order->customer_country === 'kosovo' ? 'COD Postman Fee' : 'Shipping Fee' }}: €{{ number_format($order->shipping_fee, 2) }}
@endif
- Total Amount: €{{ number_format($order->total_amount, 2) }}

@if($newStatus === 'confirmed')
Your order has been confirmed and will be processed shortly.
@elseif($newStatus === 'processing')
Your order is being prepared for shipping.
@elseif($newStatus === 'shipped')
Your order is on its way! Estimated delivery: 2-5 business days.
@elseif($newStatus === 'delivered')
Your order has been delivered. We hope you enjoy your purchase!
@elseif($newStatus === 'cancelled')
Your order has been cancelled. If you have questions, please contact us.
@endif

Need help? Contact us at info@noirclothes.shop

NOIR - Premium Clothing
This email was sent to {{ $order->customer_email }} regarding order #{{ $order->order_number }}.
