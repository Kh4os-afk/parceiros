<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'cpf',
        'codfilial',
        'caixa',
        'numnota',
        'dtsaida',
        'vltotal',
        'qrcodenfce',
        'dtcancel',
        'dtdevol',
    ];
    public function funcionario()
    {
        return $this->hasOne(Partner::class,'cpf','cpf');
    }
}
