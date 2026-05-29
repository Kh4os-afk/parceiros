<?php

namespace Database\Seeders;

use App\Models\ChangeLog;
use App\Models\Empresa;
use App\Models\Filial;
use App\Models\Partner;
use App\Models\PartnerError;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    // ── Dados das 3 empresas ─────────────────────────────────────────────────

    private array $config = [
        [
            'nome' => 'Baratão da Carne',
            'slug' => 'baratao',
            'user' => ['email' => 'gerente@barataodacarne.com.br', 'name' => 'Gerente Baratão', 'senha' => 'gerente123'],
            'filiais' => ['Betânia', 'Barreira', 'Grande Vitória', 'Cidade de Deus', 'Torquato Flores', 'Japiim'],
            'nomes' => [
                'MARCELO TEIXEIRA AMORIM', 'PATRICIA LIMA RODRIGUES', 'LARISSA MELO CARDOSO',
                'DEIVID ARCANJO FARIAS', 'RENATA GOMES VIEIRA', 'CARLOS EDUARDO SOUZA LIMA',
                'FERNANDA CRISTINA ALVES SANTOS', 'JOÃO MARCOS RIBEIRO SILVA', 'MARIA APARECIDA NASCIMENTO',
                'ANTONIO CARLOS PEREIRA GOMES', 'ROSANA DE OLIVEIRA MATOS', 'DIEGO HENRIQUE CAVALCANTE',
            ],
            'cpf_base' => 100,
            'mat_base' => 1000,
        ],
        [
            'nome' => 'Frigorífico Norte',
            'slug' => 'frigorifico-norte',
            'user' => ['email' => 'gerente@frigorificonorte.com.br', 'name' => 'Gerente Frigorífico Norte', 'senha' => 'gerente123'],
            'filiais' => ['Unidade Centro', 'Unidade Norte', 'Unidade Sul', 'Unidade Leste'],
            'nomes' => [
                'LUCAS GABRIEL TEIXEIRA', 'SIMONE ALMEIDA BARBOSA', 'RAFAEL AUGUSTO CORREIA',
                'JULIANA CRISTINA MARTINS', 'ANDERSON LUIZ FERREIRA', 'CAMILA SOUZA NUNES',
                'WELLINGTON SANTOS PINTO', 'FABIANA ROCHA CARVALHO', 'MARCOS VINICIUS GONCALVES',
                'JESSICA APARECIDA MOREIRA',
            ],
            'cpf_base' => 200,
            'mat_base' => 2000,
        ],
        [
            'nome' => 'Mercado Central',
            'slug' => 'mercado-central',
            'user' => ['email' => 'gerente@mercadocentral.com.br', 'name' => 'Gerente Mercado Central', 'senha' => 'gerente123'],
            'filiais' => ['Matriz', 'Filial Shopping', 'Filial Zona Leste'],
            'nomes' => [
                'THIAGO HENRIQUE AZEVEDO', 'CLAUDIA MENDES FREITAS', 'RODRIGO PEREIRA DA SILVA',
                'VANESSA CRISTINA LIMA', 'LEANDRO FERREIRA BATISTA', 'ADRIANA SOUSA CAMPOS',
                'GABRIEL LUCAS VIEIRA', 'CRISTIANE OLIVEIRA SANTOS',
            ],
            'cpf_base' => 300,
            'mat_base' => 3000,
        ],
    ];

    // ── Limites em reais — máximo R$ 500 ─────────────────────────────────────

    private array $limites = [150, 200, 250, 300, 350, 400, 450, 500];

    // ────────────────────────────────────────────────────────────────────────

    public function run(): void
    {
        // Zerar todas as tabelas de dados
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Sale::truncate();
        ChangeLog::truncate();
        PartnerError::truncate();
        Partner::withoutGlobalScopes()->truncate();
        Filial::withoutGlobalScopes()->truncate();
        User::where('role', '!=', 'admin')->delete();
        Empresa::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        foreach ($this->config as $cfg) {

            // Empresa
            $empresa = Empresa::create([
                'nome'  => $cfg['nome'],
                'slug'  => $cfg['slug'],
                'ativo' => true,
            ]);

            // Usuário gestor
            User::create([
                'name'              => $cfg['user']['name'],
                'email'             => $cfg['user']['email'],
                'email_verified_at' => now(),
                'password'          => Hash::make($cfg['user']['senha']),
                'remember_token'    => Str::random(10),
                'role'              => 'user',
                'empresa_id'        => $empresa->id,
            ]);

            // Filiais
            $filiaisIds = [];
            foreach ($cfg['filiais'] as $nomeFilial) {
                $f = Filial::create(['filial' => $nomeFilial, 'empresa_id' => $empresa->id]);
                $filiaisIds[] = $f->id;
            }

            // Funcionários e compras
            foreach ($cfg['nomes'] as $i => $nome) {
                $cpf      = str_pad((string) ($cfg['cpf_base'] + $i + 1), 11, '0', STR_PAD_LEFT);
                $limcred  = $this->limites[array_rand($this->limites)];
                $bloqueado = ($i % 7 === 0);

                Partner::withoutGlobalScopes()->create([
                    'empresa_id' => $empresa->id,
                    'cpf'        => $cpf,
                    'nome'       => $nome,
                    'matricula'  => $cfg['mat_base'] + $i + 1,
                    'limcred'    => $limcred,
                    'bloqueado'  => $bloqueado,
                    'alterado'   => false,
                ]);

                if ($bloqueado) {
                    continue;
                }

                // Entre 3 e 15 compras nos últimos 6 meses
                $qtd = rand(3, 15);
                for ($j = 0; $j < $qtd; $j++) {
                    $cancelado = rand(1, 12) === 1;
                    Sale::create([
                        'empresa_id' => $empresa->id,
                        'cpf'        => $cpf,
                        'codfilial'  => $filiaisIds[array_rand($filiaisIds)],
                        'caixa'      => rand(1, 5),
                        'numnota'    => rand(100000, 999999),
                        'dtsaida'    => now()->subDays(rand(1, 180))->toDateString(),
                        'vltotal'    => round(rand(1500, 18000) / 100, 2),
                        'qrcodenfce' => 'https://www.sefaz.am.gov.br/nfce/qrcode/' . strtoupper(Str::random(40)),
                        'dtcancel'   => $cancelado ? now()->subDays(rand(0, 15))->toDateString() : null,
                        'dtdevol'    => null,
                    ]);
                }
            }

            // Alguns erros de importação por empresa
            $erros = [
                ['nome' => 'JOSE WILLIAN BRITO', 'cpf' => str_pad($cfg['cpf_base'] . '91', 11, '0', STR_PAD_LEFT), 'erros' => 'CPF inválido'],
                ['nome' => 'MARIA JOSE SANTOS',  'cpf' => str_pad($cfg['cpf_base'] . '92', 11, '0', STR_PAD_LEFT), 'erros' => 'Limite de crédito zerado'],
            ];
            foreach ($erros as $e) {
                PartnerError::create([
                    'empresa_id' => $empresa->id,
                    'cpf'        => $e['cpf'],
                    'nome'       => $e['nome'],
                    'matricula'  => null,
                    'limcred'    => 0,
                    'bloqueado'  => false,
                    'erros'      => $e['erros'],
                ]);
            }
        }
    }
}
