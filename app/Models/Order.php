<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Order extends Model
{
    protected $fillable = [
        'unique_id',
        'batch_id',
        'customer_full_name',
        'customer_email',
        'customer_phone',
        'customer_address',
        'customer_city',
        'customer_country',
        'product_id',
        'product_name',
        'product_price',
        'product_image',
        'product_size',
        'product_color',
        'custom_logo',
        'quantity',
        'total_amount',
        'payment_method',
        'status',
        'notes',
        'confirmed_at',
        'shipped_at',
        'delivered_at',
    ];

    protected $casts = [
        'product_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($order) {
            if (empty($order->unique_id)) {
                $order->unique_id = 'ORD-' . strtoupper(Str::random(8));
            }
        });
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'bg-yellow-100 text-yellow-800',
            'confirmed' => 'bg-blue-100 text-blue-800',
            'processing' => 'bg-purple-100 text-purple-800',
            'shipped' => 'bg-indigo-100 text-indigo-800',
            'delivered' => 'bg-green-100 text-green-800',
            'cancelled' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function getCountryLabelAttribute(): string
    {
        return match($this->customer_country) {
            'albania' => 'Albania',
            'kosovo' => 'Kosovo',
            'macedonia' => 'Macedonia',
            default => ucfirst($this->customer_country),
        };
    }

    // Accessor for email compatibility (order_number)
    public function getOrderNumberAttribute(): string
    {
        return $this->unique_id;
    }

    // Accessor for email compatibility (customer_name)
    public function getCustomerNameAttribute(): string
    {
        return $this->customer_full_name;
    }

    // Accessor for email compatibility (size)
    public function getSizeAttribute(): string
    {
        return $this->product_size ?? 'N/A';
    }

    // Accessor for email compatibility (price as total)
    public function getPriceAttribute(): float
    {
        return (float) $this->total_amount;
    }
}
