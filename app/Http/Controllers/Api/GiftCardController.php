<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GiftCard;
use Illuminate\Http\JsonResponse;

class GiftCardController extends Controller
{
    /**
     * Consulta pública de gift cards (sem autenticação).
     */
    public function index(): JsonResponse
    {
        $giftCards = GiftCard::orderBy('cliente')
            ->orderBy('numgiftcard')
            ->get();

        return response()->json($giftCards);
    }
}
