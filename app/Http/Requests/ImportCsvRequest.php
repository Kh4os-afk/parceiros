<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportCsvRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'csv' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
        ];
    }

    public function attributes(): array
    {
        return [
            'csv' => 'arquivo CSV',
        ];
    }
}
