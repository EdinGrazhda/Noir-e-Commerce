<?php

use App\Models\User;

it('login page loads', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

it('register page loads', function () {
    $response = $this->get('/giris');

    $response->assertStatus(200);
});

it('user can login with valid credentials', function () {
    $user = User::factory()->withoutTwoFactor()->create([
        'password' => bcrypt('password123'),
    ]);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password123',
    ]);

    $this->assertAuthenticated();
});

it('user cannot login with wrong password', function () {
    $user = User::factory()->withoutTwoFactor()->create([
        'password' => bcrypt('password123'),
    ]);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

it('user can register via the registration form', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
});

it('user can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
});

it('authenticated user is redirected from login page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/login');

    $response->assertRedirect();
});
