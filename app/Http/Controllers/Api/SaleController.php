<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PeriodRequest;
use App\Models\Filial;
use App\Models\Partner;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function byPartner(Request $request, Partner $partner): JsonResponse
    {
        $sales = $partner->compras()->with('filial')->orderByDesc('dtsaida')->get();

        return response()->json($sales);
    }

    public function byPartnerCpf(Request $request): JsonResponse
    {
        $cpf = preg_replace('/\D/', '', $request->get('cpf', ''));

        $partner = Partner::where('cpf', $cpf)->with('compras.filial')->firstOrFail();

        return response()->json($partner);
    }

    public function saldoPublico(Request $request): JsonResponse
    {
        $cpf = preg_replace('/\D/', '', $request->get('cpf', ''));

        if (strlen($cpf) !== 11) {
            return response()->json(['message' => 'CPF inválido.'], 422);
        }

        $partner = Partner::withoutGlobalScopes()
            ->where('cpf', $cpf)
            ->with(['compras' => fn ($q) => $q->with('filial')->orderByDesc('dtsaida')])
            ->first();

        if (! $partner) {
            return response()->json(['message' => 'CPF não encontrado.'], 404);
        }

        return response()->json($partner);
    }

    public function byFilialPeriod(PeriodRequest $request): JsonResponse
    {
        $start = Carbon::createFromFormat('d/m/Y', $request->start_date)->startOfDay();
        $end   = Carbon::createFromFormat('d/m/Y', $request->end_date)->endOfDay();

        $vendas = Sale::selectRaw('codfilial, COUNT(*) as quantidade, SUM(vltotal) as total')
            ->whereBetween('dtsaida', [$start, $end])
            ->groupBy('codfilial')
            ->get()
            ->map(fn ($v) => [
                'codfilial'  => $v->codfilial,
                'filial'     => Filial::find($v->codfilial)?->filial ?? "Filial {$v->codfilial}",
                'quantidade' => (int) $v->quantidade,
                'total'      => (float) $v->total,
            ])
            ->sortByDesc('total')
            ->values();

        return response()->json($vendas);
    }

    public function byPeriod(PeriodRequest $request): JsonResponse
    {
        $start = Carbon::createFromFormat('d/m/Y', $request->start_date)->startOfDay();
        $end   = Carbon::createFromFormat('d/m/Y', $request->end_date)->endOfDay();

        $vendas = Sale::selectRaw('cpf, COUNT(*) as quantidade, SUM(vltotal) as total')
            ->whereBetween('dtsaida', [$start, $end])
            ->groupBy('cpf')
            ->get()
            ->map(function ($v) {
                $partner = Partner::where('cpf', $v->cpf)->first();

                return [
                    'cpf'        => $v->cpf,
                    'nome'       => $partner?->nome ?? $v->cpf,
                    'quantidade' => (int) $v->quantidade,
                    'total'      => (float) $v->total,
                ];
            })
            ->sortByDesc('total')
            ->values();

        return response()->json($vendas);
    }
}
