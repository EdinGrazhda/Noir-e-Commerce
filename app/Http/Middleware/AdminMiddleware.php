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
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }
            return redirect()->route('login');
        }

        // Check if user is admin
        if (!$user->is_admin) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthorized.',
                ], 403);
            }
            abort(403, 'Unauthorized.');
        }

        return $next($request);
    }
}
