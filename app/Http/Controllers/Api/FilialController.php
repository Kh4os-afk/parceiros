<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Filial;
use Illuminate\Http\JsonResponse;

class FilialController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Filial::orderBy('filial')->get());
    }
}
