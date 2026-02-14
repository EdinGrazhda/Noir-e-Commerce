<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Mime\Email;

class OrderPlaced extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $productImageCid;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order)
    {
        // Ensure product relation is loaded so views can call medialibrary methods
        $this->order = $order->loadMissing('product');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Order Confirmation - Order #' . $this->order->order_number,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.order-placed',
            text: 'emails.order-placed-text',
            with: [
                'order' => $this->order,
                'productImageCid' => $this->productImageCid,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    /**
     * Build the message and embed the product image inline.
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

                // Try to get the product image file path
                $imagePath = $this->resolveProductImagePath();
                
                if ($imagePath && file_exists($imagePath)) {
                    // Embed the image and get the CID reference
                    $cid = $message->embed(fopen($imagePath, 'r'), basename($imagePath));
                    $this->productImageCid = $cid;
                }
            });

        return $this;
    }

    /**
     * Resolve the local file path for the product image.
     */
    protected function resolveProductImagePath(): ?string
    {
        // First try to get from Spatie media
        if ($this->order->product && $this->order->product->hasMedia('images')) {
            $media = $this->order->product->getFirstMedia('images');
            if ($media) {
                $path = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $media->getPath());
                if (file_exists($path)) {
                    return $path;
                }
            }
        }

        // Fallback to product.image column (storage path)
        if ($this->order->product && !empty($this->order->product->image)) {
            $storagePath = storage_path('app/public/' . ltrim($this->order->product->image, '/'));
            $storagePath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $storagePath);
            if (file_exists($storagePath)) {
                return $storagePath;
            }
        }

        return null;
    }
}
