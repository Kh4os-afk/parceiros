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

        $partners = $query->with('empresa')->orderBy($sortBy, $order)->paginate(10);

        return response()->json($partners);
    }

    public function summary(Request $request): JsonResponse
    {
        $query = Partner::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhere('cpf', 'like', "%{$search}%")
                  ->orWhere('matricula', 'like', $search);
            });
        }

        return response()->json([
            'total'      => (clone $query)->count(),
            'ativos'     => (clone $query)->where('bloqueado', 0)->count(),
            'bloqueados' => (clone $query)->where('bloqueado', 1)->count(),
            'lim_medio'  => (float) ((clone $query)->avg('limcred') ?? 0),
            'lim_total'  => (float) ((clone $query)->sum('limcred') ?? 0),
        ]);
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
                'empresa_id' => auth()->user()->empresa_id,
                'nome'       => mb_strtoupper($request->nome),
                'cpf'        => $request->cpf,
                'matricula'  => $request->filled('matricula') ? $request->matricula : null,
                'limcred'    => $request->limcred,
                'bloqueado'  => $request->bloqueado,
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
                'matricula' => $request->filled('matricula') ? $request->matricula : null,
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

        $imported  = 0;
        $errors    = 0;
        $empresaId = auth()->user()->empresa_id;

        // ── Fix 1B: Remove BOM (Byte Order Mark) gerado pelo Excel ──────────
        $csvContent = file_get_contents($request->file('csv')->getRealPath());
        if (str_starts_with($csvContent, "\xEF\xBB\xBF")) {
            $csvContent = substr($csvContent, 3);
        }

        $csv = Reader::createFromString($csvContent);
        $csv->setDelimiter(';');
        $csv->setHeaderOffset(0);

        // ── Fix 2: Precarregar CPFs e matrículas existentes (2 queries em vez de 1.400) ──
        $cpfsExistentes = Partner::where('empresa_id', $empresaId)
            ->pluck('cpf')
            ->flip()
            ->toArray();

        $matriculasExistentes = Partner::where('empresa_id', $empresaId)
            ->whereNotNull('matricula')
            ->pluck('matricula')
            ->map(fn($m) => (string) $m)
            ->flip()
            ->toArray();

        // Rastreia o que foi adicionado neste lote (detecta duplicatas dentro do próprio CSV)
        $cpfsImportados       = [];
        $matriculasImportadas = [];

        foreach ($csv->getRecords() as $record) {
            $nome         = trim($record['NOME']      ?? '');
            $cpf          = trim(preg_replace('/\D/', '', $record['CPF'] ?? ''));
            $matriculaRaw = trim($record['MATRICULA'] ?? '');
            $matricula    = $matriculaRaw !== '' ? $matriculaRaw : null;
            $limcred      = trim($record['LIMCRED']   ?? '');
            $bloqueado    = (int) ($record['BLOQUEADO'] ?? 0);

            // Ignora linhas completamente vazias
            if ($nome === '' && $cpf === '') {
                continue;
            }

            // Validações de formato (sem Rule::unique — unicidade é checada via arrays)
            $validator = validator([
                'matricula' => $matricula,
                'cpf'       => $cpf,
                'nome'      => $nome,
                'limcred'   => $limcred,
                'bloqueado' => $bloqueado,
            ], [
                'matricula' => ['nullable', 'integer', 'min:1', 'max:99999'],
                'cpf'       => ['required', 'numeric', 'digits:11', 'cpf'],
                'nome'      => ['required', 'string', 'min:3', 'max:60', 'regex:/^[\pL\s\-]+$/u'],
                'limcred'   => ['required', 'numeric', 'min:0', 'max:999'],
                'bloqueado' => ['required', 'integer', 'in:0,1'],
            ]);

            // Checar unicidade de CPF e matrícula com os arrays em memória
            $errosUnique = [];
            if ($cpf !== '' && (isset($cpfsExistentes[$cpf]) || isset($cpfsImportados[$cpf]))) {
                $errosUnique[] = "O CPF {$cpf} já existe na base de funcionários.";
            }
            if ($matricula !== null && (isset($matriculasExistentes[$matricula]) || isset($matriculasImportadas[$matricula]))) {
                $errosUnique[] = "A matrícula {$matricula} já existe na base de funcionários.";
            }

            DB::beginTransaction();
            try {
                if ($validator->fails() || !empty($errosUnique)) {
                    $errosMsg = implode(' | ', array_merge($validator->errors()->all(), $errosUnique));

                    $partnerError = PartnerError::create([
                        'empresa_id' => $empresaId,
                        'matricula'  => $matricula,
                        'cpf'        => $cpf,
                        'nome'       => mb_strtoupper($nome),
                        'limcred'    => $limcred,
                        'bloqueado'  => $bloqueado,
                        'erros'      => $errosMsg,
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
                        'empresa_id' => $empresaId,
                        'matricula'  => $matricula,
                        'cpf'        => $cpf,
                        'nome'       => mb_strtoupper($nome),
                        'limcred'    => $limcred,
                        'bloqueado'  => $bloqueado,
                    ]);

                    ChangeLog::create([
                        'data'      => now(),
                        'usuario'   => auth()->id(),
                        'operacao'  => 'Insert',
                        'descricao' => "Funcionario Importado Via CSV {$partner->id} - {$nome} CPF: {$cpf}",
                    ]);

                    // Registra nos arrays para detectar duplicatas no mesmo lote
                    $cpfsImportados[$cpf] = true;
                    if ($matricula !== null) {
                        $matriculasImportadas[$matricula] = true;
                    }

                    $imported++;
                }

                DB::commit();

            } catch (\Exception $e) {
                // ── Fix 1A: catch não é mais silencioso ─────────────────────
                DB::rollBack();
                \Illuminate\Support\Facades\Log::error(
                    "CSV import — erro inesperado [{$nome}][{$cpf}]: " . $e->getMessage()
                );

                // Registra em partner_errors para o usuário saber que o registro foi perdido
                try {
                    DB::beginTransaction();
                    PartnerError::create([
                        'empresa_id' => $empresaId,
                        'matricula'  => $matricula,
                        'cpf'        => $cpf,
                        'nome'       => mb_strtoupper($nome),
                        'limcred'    => $limcred,
                        'bloqueado'  => $bloqueado,
                        'erros'      => 'Erro interno ao processar registro. Tente novamente ou cadastre manualmente.',
                    ]);
                    DB::commit();
                } catch (\Exception) {
                    DB::rollBack();
                }

                $errors++;
            }
        }

        return response()->json([
            'imported' => $imported,
            'errors'   => $errors,
        ]);
    }
}
