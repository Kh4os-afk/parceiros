<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', 'string', 'min:6', 'confirmed'],
        ];
    }

    public function attributes(): array
    {
        return [
            'current_password'      => 'senha atual',
            'password'              => 'nova senha',
            'password_confirmation' => 'confirmação da senha',
        ];
    }
}
