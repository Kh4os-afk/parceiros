<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GiftCard;
use Illuminate\Http\JsonResponse;

class GiftCardController extends Controller
{
    /**
     * Lista gift cards da empresa do usuário autenticado.
     * Filtra por codcliprinc = codcli da empresa. Admins veem todos.
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $query = GiftCard::query();

        if (! $user->isAdmin()) {
            $codcliprinc = $user->empresa?->codcli;

            if ($codcliprinc === null) {
                return response()->json([]);
            }

            $query->where('codcliprinc', $codcliprinc);
        }

        $giftCards = $query
            ->when($user->isAdmin(), fn ($q) => $q->with('empresa:id,nome,codcli'))
            ->orderBy('cliente')
            ->orderBy('numgiftcard')
            ->get();

        return response()->json($giftCards);
    }
}
