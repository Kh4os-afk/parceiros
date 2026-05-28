<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ApprovePartnerErrorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $errorId = $this->route('error')?->id ?? $this->route('error');

        return [
            'nome'      => ['required', 'string', 'min:3', 'max:60', 'regex:/^[\pL\s\-]+$/u'],
            'cpf'       => ['required', 'numeric', 'digits:11', 'unique:partners,cpf', 'cpf'],
            'matricula' => ['required', 'integer', 'min:1', 'max:99999', 'unique:partners,matricula'],
            'limcred'   => ['required', 'numeric', 'min:0', 'max:999'],
            'bloqueado' => ['required', 'integer', 'in:0,1'],
        ];
    }
}
