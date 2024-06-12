<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

         \App\Models\User::create([
             'name' => 'Administrador',
             'email' => 'ti@barataodacarne.com.br',
             'email_verified_at' => now(),
             'password' =>  Hash::make('admb4r4t40**'),
             'remember_token' => Str::random(10),
         ]);

    }
}
