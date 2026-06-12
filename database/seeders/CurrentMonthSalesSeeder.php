<?php

namespace Database\Seeders;

use App\Models\Filial;
use App\Models\Partner;
use App\Models\Sale;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Gera compras do mês atual para os funcionários já cadastrados,
 * sem apagar nenhum dado existente.
 *
 * - Apenas funcionários não bloqueados
 * - Datas entre o dia 1º do mês e hoje
 * - Total do mês por funcionário limitado ao limcred (utilização entre 15% e 95%)
 * - ~1 em cada 12 compras é cancelada (dtcancel)
 */
class CurrentMonthSalesSeeder extends Seeder
{
    public function run(): void
    {
        $inicioMes = now()->startOfMonth();
        $hoje      = now();
        $diasNoMes = (int) $inicioMes->diffInDays($hoje);

        // Filiais agrupadas por empresa
        $todasFiliais = Filial::withoutGlobalScopes()->get();
        $filiaisPorEmpresa = $todasFiliais
            ->groupBy('empresa_id')
            ->map(fn ($f) => $f->pluck('id')->all());
        $todasFiliaisIds = $todasFiliais->pluck('id')->all();

        $partners = Partner::withoutGlobalScopes()
            ->where('bloqueado', false)
            ->get(['cpf', 'limcred', 'empresa_id']);

        $linhas = [];
        $agora  = now();

        foreach ($partners as $partner) {
            // Funcionário sem empresa (importado via CSV) usa qualquer filial
            $filiais = $filiaisPorEmpresa[$partner->empresa_id] ?? $todasFiliaisIds;
            if (! $filiais) {
                continue;
            }

            // ~10% dos funcionários ainda não compraram neste mês
            if (rand(1, 10) === 1) {
                continue;
            }

            // Utilização alvo entre 15% e 95% do limite
            $totalAlvo = round((float) $partner->limcred * rand(15, 95) / 100, 2);
            $qtd       = rand(1, 6);

            // Divide o total em $qtd parcelas com pesos aleatórios
            $pesos = [];
            for ($j = 0; $j < $qtd; $j++) {
                $pesos[] = rand(1, 100);
            }
            $somaPesos = array_sum($pesos);

            foreach ($pesos as $peso) {
                $valor = round($totalAlvo * $peso / $somaPesos, 2);
                if ($valor < 1) {
                    continue;
                }

                $dtsaida   = $inicioMes->copy()->addDays(rand(0, $diasNoMes));
                $cancelada = rand(1, 12) === 1;

                $linhas[] = [
                    'empresa_id' => $partner->empresa_id,
                    'cpf'        => $partner->cpf,
                    'codfilial'  => $filiais[array_rand($filiais)],
                    'caixa'      => rand(1, 5),
                    'numnota'    => rand(100000, 999999),
                    'dtsaida'    => $dtsaida->toDateString(),
                    'vltotal'    => $valor,
                    'qrcodenfce' => 'https://www.sefaz.am.gov.br/nfce/qrcode/' . strtoupper(Str::random(40)),
                    'dtcancel'   => $cancelada ? $dtsaida->toDateString() : null,
                    'dtdevol'    => null,
                    'created_at' => $agora,
                    'updated_at' => $agora,
                ];
            }
        }

        foreach (array_chunk($linhas, 500) as $chunk) {
            Sale::insert($chunk);
        }

        $this->command?->info(count($linhas) . ' compras geradas para ' . $partners->count() . ' funcionários no mês atual.');
    }
}
