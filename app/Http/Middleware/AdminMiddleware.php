<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ensure we're working with API requests and return JSON
        if (!$request->expectsJson() && $request->is('api/*')) {
            $request->headers->set('Accept', 'application/json');
        }

        // Get authenticated user - at this point, auth middleware has already run
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated. Please log in.',
                'error' => 'Authentication required',
                'debug' => [
                    'guards_checked' => ['sanctum', 'web'],
                    'session_id' => session()->getId(),
                    'has_csrf' => $request->header('X-CSRF-TOKEN') ? 'yes' : 'no'
                ]
            ], 401);
        }

        // Check if user is admin
        if (!$user->is_admin) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
                'error' => 'Insufficient permissions',
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'is_admin' => $user->is_admin
                ]
            ], 403);
        }

        return $next($request);
    }
}
