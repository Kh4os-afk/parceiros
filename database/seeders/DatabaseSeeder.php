<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Filial;
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

         \App\Models\User::firstOrCreate(
             ['id' => 1],[
             'name' => 'Administrador',
             'email' => 'ti@barataodacarne.com.br',
             'email_verified_at' => now(),
             'password' =>  Hash::make('admb4r4t40**'),
             'remember_token' => Str::random(10),
         ]);

        \App\Models\User::firstOrCreate(
            ['id' => 2],[
            'name' => 'Santo Remedio',
            'email' => 'santoremedio@barataodacarne.com.br',
            'email_verified_at' => now(),
            'password' =>  Hash::make('baratao@2024'),
            'remember_token' => Str::random(10),
        ]);

        $filiais = ['Betânia', 'Barreira', 'Grande Vitoria', 'Cidade de Deus', 'Torquato Flores', 'Japiim', 'Parque Dez', 'Bola do Produtos', 'Torres', 'Shopping Cidade Leste'];
        foreach ($filiais as $filial) {
            Filial::firstOrCreate(['filial' => $filial]);
        }

    }
}
