<?php

namespace App\Console\Commands;

use App\Models\Banner;
use App\Models\Product;
use Illuminate\Console\Command;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class RegenerateMediaConversions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:regenerate {--model= : The model to regenerate conversions for (Product, Banner, or all)} {--force : Force regeneration even if conversions exist}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Regenerate media conversions (thumbnails, previews) for products and banners';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $model = $this->option('model');
        
        if (!$model || $model === 'all') {
            $this->info('Regenerating conversions for all models...');
            $this->regenerateProductConversions();
            $this->newLine();
            $this->regenerateBannerConversions();
        } elseif ($model === 'Product') {
            $this->regenerateProductConversions();
        } elseif ($model === 'Banner') {
            $this->regenerateBannerConversions();
        } else {
            $this->error('Unsupported model. Use --model=Product, --model=Banner, or --model=all');
            return 1;
        }
        
        return 0;
    }

    private function regenerateProductConversions()
    {
        $this->info('Regenerating product image conversions...');
        $this->newLine();
        
        // Use Spatie's built-in regeneration
        $this->call('media-library:regenerate', [
            '--only-missing' => !$this->option('force'),
        ]);
        
        $this->newLine();
        $this->info('✅ Product conversions regeneration complete!');
    }

    private function regenerateBannerConversions()
    {
        $this->info('Regenerating banner image conversions...');
        $this->newLine();
        
        // Use Spatie's built-in regeneration
        $this->call('media-library:regenerate', [
            '--only-missing' => !$this->option('force'),
        ]);
        
        $this->newLine();
        $this->info('✅ Banner conversions regeneration complete!');
    }
}
