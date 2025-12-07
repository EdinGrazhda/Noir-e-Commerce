<?php

namespace App\Console\Commands;

use App\Mail\OrderPlaced;
use App\Mail\OrderStatusUpdated;
use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmail extends Command
{
    protected $signature = 'test:email {--type=status : Type of email to test (placed|status)} {--email= : Override recipient email}';

    protected $description = 'Test email sending functionality';

    public function handle()
    {
        $this->info('=== Email Configuration ===');
        $this->info('Mail Driver: '.config('mail.default'));
        $this->info('Mail Host: '.config('mail.mailers.smtp.host'));
        $this->info('Mail Port: '.config('mail.mailers.smtp.port'));
        $this->info('Mail From: '.config('mail.from.address'));
        $this->info('');

        // Get the latest order to test with
        $order = Order::with('product')->latest()->first();

        if (! $order) {
            $this->error('No orders found in database. Create an order first.');

            return 1;
        }

        $testEmail = $this->option('email') ?: $order->customer_email;
        $emailType = $this->option('type');

        $this->info("Using order: #{$order->id} ({$order->unique_id})");
        $this->info("Product: {$order->product_name}");
        $this->info("Sending to: {$testEmail}");
        $this->info("Email type: {$emailType}");
        $this->info('');

        try {
            if ($emailType === 'status') {
                $this->info('Sending order status update email (pending → confirmed)...');
                Mail::to($testEmail)->send(
                    new OrderStatusUpdated($order, 'pending', 'confirmed')
                );
            } else {
                $this->info('Sending order placed email...');
                Mail::to($testEmail)->send(new OrderPlaced($order));
            }

            $this->info('');
            $this->info('✅ Email sent successfully!');
            $this->info('');
            $this->info('Next steps:');
            $this->info('1. Check the inbox for: '.$testEmail);
            $this->info('2. Check spam/junk folder');
            $this->info('3. If using log driver, check: storage/logs/laravel.log');
            $this->info('4. If using SMTP, check mail server logs');

            return 0;
        } catch (\Exception $e) {
            $this->error('');
            $this->error('❌ Failed to send email!');
            $this->error('');
            $this->error('Error Message: '.$e->getMessage());
            $this->error('Error File: '.$e->getFile().':'.$e->getLine());
            $this->error('');
            $this->error('Stack Trace:');
            $this->error($e->getTraceAsString());
            $this->error('');
            $this->error('Common issues:');
            $this->error('- MAIL_MAILER set to "log" (check .env)');
            $this->error('- Invalid SMTP credentials');
            $this->error('- Firewall blocking SMTP port');
            $this->error('- Missing or invalid MAIL_FROM_ADDRESS');

            return 1;
        }
    }
}
