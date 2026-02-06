<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Models\Order;
use App\Mail\OrderNotificationAdmin;

class TestAdminEmail extends Command
{
    protected $signature = 'test:admin-email';
    protected $description = 'Test admin order notification email';

    public function handle()
    {
        $this->info('Testing admin email notification...');
        
        // Get the latest order to test with
        $order = Order::with('product')->latest()->first();
        
        if (!$order) {
            $this->error('No orders found in database. Create an order first.');
            return 1;
        }
        
        $this->info("Using order ID: {$order->id}");
        $this->info("Order Number: {$order->order_number}");
        $this->info("Sending to admin: " . config('mail.admin_email'));
        
        try {
            Mail::to(config('mail.admin_email'))->send(new OrderNotificationAdmin($order));
            $this->info('✓ Admin email sent successfully!');
            $this->info('Check the admin inbox: ' . config('mail.admin_email'));
            return 0;
        } catch (\Exception $e) {
            $this->error('✗ Failed to send admin email');
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }
    }
}
