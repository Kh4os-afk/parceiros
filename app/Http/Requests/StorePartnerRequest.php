<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePartnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome'      => ['required', 'string', 'min:3', 'max:60', 'regex:/^[\pL\s\-]+$/u'],
            'cpf'       => ['required', 'numeric', 'digits:11', 'cpf',
                Rule::unique('partners', 'cpf')->where('empresa_id', auth()->user()->empresa_id)],
            'matricula' => ['nullable', 'integer', 'min:1', 'max:99999',
                Rule::unique('partners', 'matricula')->where('empresa_id', auth()->user()->empresa_id)->whereNotNull('matricula')],
            'limcred'   => ['required', 'numeric', 'min:0', 'max:999'],
            'bloqueado' => ['required', 'integer', 'in:0,1'],
        ];
    }

    public function attributes(): array
    {
        return [
            'nome'      => 'nome',
            'cpf'       => 'CPF',
            'matricula' => 'matrícula',
            'limcred'   => 'limite de crédito',
            'bloqueado' => 'status',
        ];
    }
}
