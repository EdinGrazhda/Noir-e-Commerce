<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Symfony\Component\Mime\Email;

class OrderStatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;

    public string $previousStatus;

    public string $newStatus;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order, string $previousStatus, string $newStatus)
    {
        $this->order = $order;
        $this->previousStatus = $previousStatus;
        $this->newStatus = $newStatus;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $statusMessages = [
            'confirmed' => 'Order Confirmed - Noir Clothes',
            'processing' => 'Order is Being Processed - Noir Clothes',
            'shipped' => 'Order Shipped - Noir Clothes',
            'delivered' => 'Order Delivered - Noir Clothes',
            'cancelled' => 'Order Cancelled - Noir Clothes',
        ];

        $subject = $statusMessages[$this->newStatus] ?? 'Order Status Updated - Noir Clothes';

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.order-status-updated',
            text: 'emails.order-status-updated-text',
            with: [
                'order' => $this->order,
                'previousStatus' => $this->previousStatus,
                'newStatus' => $this->newStatus,
            ],
        );
    }

    /**
     * Build the message with anti-spam headers.
     */
    public function build()
    {
        $this->replyTo('info@noirclothes.shop', 'NOIR')
             ->withSymfonyMessage(function (Email $message) {
                $message->getHeaders()->addTextHeader(
                    'List-Unsubscribe',
                    '<mailto:info@noirclothes.shop?subject=unsubscribe>'
                );
            });

        return $this;
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
}
