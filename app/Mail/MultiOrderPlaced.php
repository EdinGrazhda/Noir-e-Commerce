<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Symfony\Component\Mime\Email;

class MultiOrderPlaced extends Mailable
{
    use Queueable, SerializesModels;

    public $orders;
    public $customerInfo;
    public $totalAmount;
    public $productImageCids = [];

    /**
     * Create a new message instance.
     */
    public function __construct($orders, $totalAmount)
    {
        $this->orders = collect($orders);
        $this->totalAmount = $totalAmount;
        
        // Get customer info from first order (all orders have same customer)
        $firstOrder = $this->orders->first();
        $this->customerInfo = [
            'name' => $firstOrder->customer_full_name,
            'email' => $firstOrder->customer_email,
            'phone' => $firstOrder->customer_phone,
            'address' => $firstOrder->customer_address,
            'city' => $firstOrder->customer_city,
            'country' => $firstOrder->customer_country,
        ];
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $orderCount = $this->orders->count();
        return new Envelope(
            subject: "Order Confirmation - {$orderCount} Items Ordered",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.multi-order-placed',
            text: 'emails.multi-order-placed-text',
            with: [
                'orders' => $this->orders,
                'customerInfo' => $this->customerInfo,
                'totalAmount' => $this->totalAmount,
                'productImageCids' => $this->productImageCids,
            ],
        );
    }

    /**
     * Build the message and embed product images inline.
     */
    public function build()
    {
        $this->replyTo('info@noirclothes.shop', 'NOIR')
             ->withSymfonyMessage(function (Email $message) {
                // Anti-spam: List-Unsubscribe header
                $message->getHeaders()->addTextHeader(
                    'List-Unsubscribe',
                    '<mailto:info@noirclothes.shop?subject=unsubscribe>'
                );

                // Embed each product image
                foreach ($this->orders as $order) {
                    $imagePath = $this->resolveProductImagePath($order);
                    
                    if ($imagePath && file_exists($imagePath)) {
                        // Embed the image and store CID reference for this order
                        $cid = $message->embed(fopen($imagePath, 'r'), basename($imagePath));
                        $this->productImageCids[$order->id] = $cid;
                    }
                }
            });

        return $this;
    }

    /**
     * Resolve the product image file path for a given order.
     */
    private function resolveProductImagePath($order)
    {
        // First, try to get image from product relationship via medialibrary
        if ($order->product && $order->product->hasMedia('images')) {
            $media = $order->product->getFirstMedia('images');
            if ($media) {
                return $media->getPath();
            }
        }

        // Fallback: if product_image is stored in order, try to resolve path
        if (!empty($order->product_image)) {
            // Handle full URLs or storage paths
            $imagePath = $order->product_image;

            // If it's a URL, try to convert to local path
            if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
                // Extract path from URL (remove domain)
                $path = parse_url($imagePath, PHP_URL_PATH);
                
                // Try storage/app/public path
                $storagePath = storage_path('app/public' . $path);
                if (file_exists($storagePath)) {
                    return $storagePath;
                }

                // Try public path
                $publicPath = public_path($path);
                if (file_exists($publicPath)) {
                    return $publicPath;
                }
            } else {
                // It's a relative path, try storage/public
                $storagePath = storage_path('app/public/' . ltrim($imagePath, '/'));
                if (file_exists($storagePath)) {
                    return $storagePath;
                }

                // Try public path
                $publicPath = public_path(ltrim($imagePath, '/'));
                if (file_exists($publicPath)) {
                    return $publicPath;
                }
            }
        }

        return null;
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
