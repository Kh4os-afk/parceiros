<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => ['required', 'date_format:d/m/Y'],
            'end_date'   => ['required', 'date_format:d/m/Y', 'after_or_equal:start_date'],
        ];
    }

    public function attributes(): array
    {
        return [
            'start_date' => 'data inicial',
            'end_date'   => 'data final',
        ];
    }
}
