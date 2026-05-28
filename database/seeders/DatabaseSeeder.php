<?php

namespace Database\Seeders;

use App\Models\Empresa;
use App\Models\Filial;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Empresas
        $baratao = Empresa::firstOrCreate(
            ['slug' => 'baratao'],
            ['nome' => 'Baratão da Carne', 'ativo' => true]
        );

        // Usuários
        User::firstOrCreate(
            ['email' => 'ti@barataodacarne.com.br'],
            [
                'name'              => 'Administrador',
                'email_verified_at' => now(),
                'password'          => Hash::make('admb4r4t40**'),
                'remember_token'    => Str::random(10),
                'role'              => 'admin',
                'empresa_id'        => null,
            ]
        );
        // Filiais da empresa Baratão
        $filiais = [
            ['id' => 3,  'filial' => 'Betânia'],
            ['id' => 4,  'filial' => 'Barreira'],
            ['id' => 5,  'filial' => 'Grande Vitoria'],
            ['id' => 6,  'filial' => 'Cidade de Deus'],
            ['id' => 7,  'filial' => 'Torquato Flores'],
            ['id' => 8,  'filial' => 'Japiim'],
            ['id' => 9,  'filial' => 'Parque Dez'],
            ['id' => 10, 'filial' => 'Bola do Produtos'],
            ['id' => 12, 'filial' => 'Torres'],
            ['id' => 13, 'filial' => 'Alvorada'],
            ['id' => 14, 'filial' => 'Shopping Cidade Leste'],
        ];

        foreach ($filiais as $f) {
            Filial::firstOrCreate(
                ['id' => $f['id']],
                ['filial' => $f['filial'], 'empresa_id' => $baratao->id]
            );
        }
    }
}
