<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add custom logo upload flag to products table
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('allows_custom_logo')->default(false)->after('gender');
        });

        // Add custom logo path to orders table
        Schema::table('orders', function (Blueprint $table) {
            $table->string('custom_logo')->nullable()->after('product_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('allows_custom_logo');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('custom_logo');
        });
    }
};
