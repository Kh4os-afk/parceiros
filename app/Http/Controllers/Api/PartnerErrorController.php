<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ApprovePartnerErrorRequest;
use App\Models\ChangeLog;
use App\Models\Partner;
use App\Models\PartnerError;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PartnerErrorController extends Controller
{
    public function index(): JsonResponse
    {
        $errors = PartnerError::paginate(10);

        return response()->json($errors);
    }

    public function show(PartnerError $error): JsonResponse
    {
        return response()->json($error);
    }

    public function destroy(PartnerError $error): JsonResponse
    {
        $error->delete();

        return response()->json(['message' => 'Registro deletado com sucesso.']);
    }

    public function destroyAll(): JsonResponse
    {
        if (auth()->user()->isAdmin()) {
            PartnerError::truncate();
        } else {
            PartnerError::where('empresa_id', auth()->user()->empresa_id)->delete();
        }

        return response()->json(['message' => 'Todos os registros deletados com sucesso.']);
    }

    public function destroyDuplicates(): JsonResponse
    {
        $existingCpfs = Partner::pluck('cpf');
        PartnerError::whereIn('cpf', $existingCpfs)->delete();

        return response()->json(['message' => 'Registros duplicados deletados com sucesso.']);
    }

    public function approve(ApprovePartnerErrorRequest $request, PartnerError $error): JsonResponse
    {
        DB::beginTransaction();
        try {
            $partner = Partner::create([
                'empresa_id' => auth()->user()->empresa_id,
                'nome'       => mb_strtoupper($request->nome),
                'cpf'        => $request->cpf,
                'matricula'  => $request->matricula,
                'limcred'    => $request->limcred,
                'bloqueado'  => $request->bloqueado,
            ]);

            $error->delete();

            ChangeLog::create([
                'data'      => now(),
                'usuario'   => auth()->id(),
                'operacao'  => 'Insert',
                'descricao' => "Ajustou o Cadastro com erro do Usuario: {$partner->id} - {$partner->nome} CPF: {$partner->cpf}.",
            ]);

            DB::commit();

            return response()->json($partner, 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Erro ao corrigir registro.'], 500);
        }
    }
}
