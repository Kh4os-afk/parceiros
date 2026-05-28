<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PeriodRequest;
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
