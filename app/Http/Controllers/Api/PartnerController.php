<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImportCsvRequest;
use App\Http\Requests\StorePartnerRequest;
use App\Http\Requests\UpdatePartnerRequest;
use App\Models\ChangeLog;
use App\Models\Partner;
use App\Models\PartnerError;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use League\Csv\Reader;

class PartnerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Partner::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhere('cpf', 'like', "%{$search}%")
                  ->orWhere('matricula', 'like', $search);
            });
        }

        $sortBy = in_array($request->get('sort_by'), ['nome', 'matricula', 'cpf', 'limcred', 'bloqueado'])
            ? $request->get('sort_by')
            : 'nome';

        $order = $request->get('order') === 'desc' ? 'desc' : 'asc';

        $partners = $query->orderBy($sortBy, $order)->paginate(10);

        return response()->json($partners);
    }

    public function show(Partner $partner): JsonResponse
    {
        return response()->json($partner);
    }

    public function store(StorePartnerRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $partner = Partner::create([
                'nome'      => mb_strtoupper($request->nome),
                'cpf'       => $request->cpf,
                'matricula' => $request->matricula,
                'limcred'   => $request->limcred,
                'bloqueado' => $request->bloqueado,
            ]);

            ChangeLog::create([
                'data'      => now(),
                'usuario'   => auth()->id(),
                'operacao'  => 'Insert',
                'descricao' => "Cadastrou o Usuario: {$partner->id} - {$partner->nome} CPF: {$partner->cpf}.",
            ]);

            DB::commit();

            return response()->json($partner, 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Erro ao cadastrar funcionário.'], 500);
        }
    }

    public function update(UpdatePartnerRequest $request, Partner $partner): JsonResponse
    {
        DB::beginTransaction();
        try {
            $old = $partner->getOriginal();

            $partner->update([
                'nome'      => mb_strtoupper($request->nome),
                'matricula' => $request->matricula,
                'limcred'   => $request->limcred,
                'bloqueado' => $request->bloqueado,
                'alterado'  => 1,
            ]);

            ChangeLog::create([
                'data'      => now(),
                'usuario'   => auth()->id(),
                'operacao'  => 'Update',
                'descricao' => "Editou o Usuario: {$partner->id} O nome de {$old['nome']} Para {$partner->nome}. A Matricula de {$old['matricula']} Para {$partner->matricula}. O Limite de Credito de {$old['limcred']} Para {$partner->limcred}. O Bloqueio de {$old['bloqueado']} Para {$partner->bloqueado}.",
            ]);

            DB::commit();

            return response()->json($partner);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Erro ao editar funcionário.'], 500);
        }
    }

    public function import(ImportCsvRequest $request): JsonResponse
    {
        ini_set('max_execution_time', 600);
        set_time_limit(600);

        $imported = 0;
        $errors   = 0;

        $csv = Reader::createFromPath($request->file('csv')->getRealPath(), 'r');
        $csv->setDelimiter(';');
        $csv->setHeaderOffset(0);

        foreach ($csv->getRecords() as $record) {
            $nome      = trim($record['NOME']      ?? '');
            $cpf       = trim(preg_replace('/\D/', '', $record['CPF'] ?? ''));
            $matricula = trim($record['MATRICULA'] ?? '');
            $limcred   = trim($record['LIMCRED']   ?? '');
            $bloqueado = (int) ($record['BLOQUEADO'] ?? 0);

            // ignora linhas completamente vazias
            if ($nome === '' && $cpf === '' && $matricula === '') {
                continue;
            }

            $validator = validator([
                'matricula' => $matricula,
                'cpf'       => $cpf,
                'nome'      => $nome,
                'limcred'   => $limcred,
                'bloqueado' => $bloqueado,
            ], [
                'matricula' => ['required', 'integer', 'min:1', 'max:99999', 'unique:partners,matricula'],
                'cpf'       => ['required', 'numeric', 'digits:11', 'unique:partners,cpf', 'cpf'],
                'nome'      => ['required', 'string', 'min:3', 'max:60', 'regex:/^[\pL\s\-]+$/u'],
                'limcred'   => ['required', 'numeric', 'min:0', 'max:999'],
                'bloqueado' => ['required', 'integer', 'in:0,1'],
            ]);

            DB::beginTransaction();
            try {
                if ($validator->fails()) {
                    $errosMsg = implode(' | ', $validator->errors()->all());

                    $partnerError = PartnerError::create([
                        'matricula' => $matricula,
                        'cpf'       => $cpf,
                        'nome'      => mb_strtoupper($nome),
                        'limcred'   => $limcred,
                        'bloqueado' => $bloqueado,
                        'erros'     => $errosMsg,
                    ]);

                    ChangeLog::create([
                        'data'      => now(),
                        'usuario'   => auth()->id(),
                        'operacao'  => 'Update',
                        'descricao' => "Funcionario Importado com erro de validação: {$partnerError->id} - {$nome} CPF: {$cpf}",
                    ]);

                    $errors++;
                } else {
                    $partner = Partner::create([
                        'matricula' => $matricula,
                        'cpf'       => $cpf,
                        'nome'      => mb_strtoupper($nome),
                        'limcred'   => $limcred,
                        'bloqueado' => $bloqueado,
                    ]);

                    ChangeLog::create([
                        'data'      => now(),
                        'usuario'   => auth()->id(),
                        'operacao'  => 'Insert',
                        'descricao' => "Funcionario Importado Via CSV {$partner->id} - {$nome} CPF: {$cpf}",
                    ]);

                    $imported++;
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
            }
        }

        return response()->json([
            'imported' => $imported,
            'errors'   => $errors,
        ]);
    }
}
