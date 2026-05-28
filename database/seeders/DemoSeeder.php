<?php

namespace Database\Seeders;

use App\Models\Empresa;
use App\Models\Partner;
use App\Models\PartnerError;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    private array $filiais = [3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14];

    private array $nomes = [
        'ANA PAULA FERREIRA COSTA', 'CARLOS EDUARDO SOUZA LIMA', 'FERNANDA CRISTINA ALVES SANTOS',
        'JOÃO MARCOS RIBEIRO SILVA', 'MARIA APARECIDA NASCIMENTO', 'ANTONIO CARLOS PEREIRA GOMES',
        'ROSANA DE OLIVEIRA MATOS', 'DIEGO HENRIQUE CAVALCANTE', 'PATRICIA LIMA RODRIGUES',
        'LUCAS GABRIEL TEIXEIRA', 'SIMONE ALMEIDA BARBOSA', 'RAFAEL AUGUSTO CORREIA',
        'JULIANA CRISTINA MARTINS', 'ANDERSON LUIZ FERREIRA', 'CAMILA SOUZA NUNES',
        'WELLINGTON SANTOS PINTO', 'FABIANA ROCHA CARVALHO', 'MARCOS VINICIUS GONCALVES',
        'JESSICA APARECIDA MOREIRA', 'THIAGO HENRIQUE AZEVEDO', 'CLAUDIA MENDES FREITAS',
        'RODRIGO PEREIRA DA SILVA', 'VANESSA CRISTINA LIMA', 'LEANDRO FERREIRA BATISTA',
        'ADRIANA SOUSA CAMPOS', 'GABRIEL LUCAS VIEIRA', 'CRISTIANE OLIVEIRA SANTOS',
        'FELIPE AUGUSTO COSTA', 'LARISSA MELO CARDOSO', 'BRUNO HENRIQUE MACEDO',
        'SANDRA FARIA RESENDE', 'GUSTAVO ALVES MONTEIRO', 'RENATA GOMES VIEIRA',
        'MARCELO TEIXEIRA AMORIM', 'ELIZANGELA SOUZA RAMOS', 'PABLO CESAR LEAL',
        'TATIANE ARAUJO CUNHA', 'EDSON RODRIGUES CAVALCANTE', 'ALINE PAIVA SILVEIRA',
        'DEIVID ARCANJO FARIAS', 'ROSIMEIRE TAVARES DUARTE', 'CELSO BRITO MAGALHAES',
    ];

    public function run(): void
    {
        $baratao = Empresa::where('slug', 'baratao')->firstOrFail();

        // Usuário padrão da empresa
        User::firstOrCreate(
            ['email' => 'gerente@barataodacarne.com.br'],
            [
                'name'              => 'Gerente Baratão',
                'email_verified_at' => now(),
                'password'          => Hash::make('gerente123'),
                'remember_token'    => Str::random(10),
                'role'              => 'user',
                'empresa_id'        => $baratao->id,
            ]
        );

        foreach ($this->nomes as $index => $nome) {
            $cpf = $this->cpf($index + 1);

            $partner = Partner::withoutGlobalScopes()->firstOrCreate(
                ['cpf' => $cpf],
                [
                    'empresa_id' => $baratao->id,
                    'nome'       => $nome,
                    'matricula'  => 1000 + $index,
                    'limcred'    => $this->sortearLimite(),
                    'bloqueado'  => $index % 9 === 0,
                    'alterado'   => false,
                ]
            );

            // 2 a 14 compras por funcionário nos últimos 6 meses
            $qtd = rand(2, 14);
            for ($i = 0; $i < $qtd; $i++) {
                $dtsaida = now()->subDays(rand(1, 180))->toDateString();
                $cancelado = rand(1, 15) === 1;

                Sale::create([
                    'empresa_id' => $baratao->id,
                    'cpf'        => $cpf,
                    'codfilial'  => $this->filiais[array_rand($this->filiais)],
                    'caixa'      => rand(1, 6),
                    'numnota'    => rand(100000, 999999),
                    'dtsaida'    => $dtsaida,
                    'vltotal'    => round(rand(2500, 95000) / 100, 2),
                    'qrcodenfce' => 'https://www.sefaz.am.gov.br/nfce/qrcode/' . strtoupper(Str::random(40)),
                    'dtcancel'   => $cancelado ? now()->subDays(rand(0, 10))->toDateString() : null,
                    'dtdevol'    => null,
                ]);
            }
        }

        // Erros de importação para demonstrar a tela de erros
        $erros = [
            ['nome' => 'JOSE WILLIAN BRITO', 'cpf' => '00000000000', 'matricula' => null, 'limcred' => 50000, 'bloqueado' => false, 'erros' => 'CPF inválido'],
            ['nome' => 'MARIA JOSE SANTOS',  'cpf' => '11111111111', 'matricula' => 2001,  'limcred' => 30000, 'bloqueado' => false, 'erros' => 'CPF já cadastrado'],
            ['nome' => 'PEDRO ALVES',         'cpf' => '22222222222', 'matricula' => null,  'limcred' => 0,     'bloqueado' => true,  'erros' => 'Matrícula ausente; Limite zerado'],
            ['nome' => 'LUCIA FERREIRA',      'cpf' => '33333333333', 'matricula' => 2004,  'limcred' => 20000, 'bloqueado' => false, 'erros' => 'CPF inválido'],
            ['nome' => 'FRANCISCO LIMA',      'cpf' => '44444444444', 'matricula' => 2005,  'limcred' => 45000, 'bloqueado' => false, 'erros' => 'Matrícula duplicada na planilha'],
        ];

        foreach ($erros as $e) {
            PartnerError::firstOrCreate(
                ['cpf' => $e['cpf'], 'empresa_id' => $baratao->id],
                [
                    'nome'      => $e['nome'],
                    'matricula' => $e['matricula'],
                    'limcred'   => $e['limcred'],
                    'bloqueado' => $e['bloqueado'],
                    'erros'     => $e['erros'],
                ]
            );
        }
    }

    private function cpf(int $n): string
    {
        return str_pad((string) $n, 11, '0', STR_PAD_LEFT);
    }

    private function sortearLimite(): int
    {
        // Retorna o limite em centavos (inteiro), valores típicos: R$200 a R$1.500
        $opcoes = [20000, 30000, 40000, 50000, 60000, 75000, 100000, 120000, 150000];

        return $opcoes[array_rand($opcoes)];
    }
}
