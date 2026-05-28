<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePartnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $partnerId = $this->route('partner')?->id ?? $this->route('partner');

        $empresaId = auth()->user()->empresa_id;

        return [
            'nome'      => ['required', 'string', 'min:3', 'max:60', 'regex:/^[\pL\s\-]+$/u'],
            'matricula' => ['nullable', 'integer', 'min:1', 'max:99999',
                Rule::unique('partners', 'matricula')->where('empresa_id', $empresaId)->ignore($partnerId)->whereNotNull('matricula')],
            'limcred'   => ['required', 'numeric', 'min:0', 'max:999'],
            'bloqueado' => ['required', 'integer', 'in:0,1'],
        ];
    }

    public function attributes(): array
    {
        return [
            'nome'      => 'nome',
            'matricula' => 'matrícula',
            'limcred'   => 'limite de crédito',
            'bloqueado' => 'status',
        ];
    }
}
