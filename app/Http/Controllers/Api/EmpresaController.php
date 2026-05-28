<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EmpresaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Empresa::orderBy('nome')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nome' => ['required', 'string', 'max:100'],
            'ativo' => ['boolean'],
        ]);

        $data['slug'] = Str::slug($data['nome']);

        $empresa = Empresa::create($data);

        return response()->json($empresa, 201);
    }

    public function show(Empresa $empresa): JsonResponse
    {
        return response()->json($empresa);
    }

    public function update(Request $request, Empresa $empresa): JsonResponse
    {
        $data = $request->validate([
            'nome'  => ['required', 'string', 'max:100'],
            'ativo' => ['boolean'],
        ]);

        $data['slug'] = Str::slug($data['nome']);

        $empresa->update($data);

        return response()->json($empresa);
    }
}
