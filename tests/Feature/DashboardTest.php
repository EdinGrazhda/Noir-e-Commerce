<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated admin users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create(['is_admin' => true]));

    $this->get(route('dashboard'))->assertOk();
});

test('non-admin users cannot visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create(['is_admin' => false]));

    $this->get(route('dashboard'))->assertStatus(403);
});