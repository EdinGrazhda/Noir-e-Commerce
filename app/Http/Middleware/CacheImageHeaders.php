<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CacheImageHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only apply to image requests
        if ($this->isImageRequest($request)) {
            // Cache images for 30 days in browser
            $response->header('Cache-Control', 'public, max-age=2592000, immutable');
            $response->header('Expires', gmdate('D, d M Y H:i:s', time() + 2592000) . ' GMT');
            
            // Add ETag for better caching
            if ($response->getContent()) {
                $etag = md5($response->getContent());
                $response->header('ETag', $etag);
                
                // Check if client has cached version
                if ($request->header('If-None-Match') === $etag) {
                    return response('', 304)->withHeaders($response->headers->all());
                }
            }
        }

        return $response;
    }

    /**
     * Determine if the request is for an image.
     */
    private function isImageRequest(Request $request): bool
    {
        $path = $request->path();
        
        // Check if path is for storage images or media library
        return str_contains($path, '/storage/') || 
               str_contains($path, '/media/') ||
               preg_match('/\.(jpg|jpeg|png|gif|webp|svg)$/i', $path);
    }
}
