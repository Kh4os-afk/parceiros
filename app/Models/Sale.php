<?php

namespace App\Models;

use App\Models\Scopes\EmpresaScope;
use App\Models\Scopes\VisivelNoFrontendScope;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'empresa_id',
        'cpf',
        'codfilial',
        'caixa',
        'numnota',
        'dtsaida',
        'vltotal',
        'qrcodenfce',
        'dtcancel',
        'dtdevol',
        'oculto',
    ];

    protected $hidden = [
        'oculto',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new EmpresaScope());
        static::addGlobalScope(new VisivelNoFrontendScope());
    }
    public function funcionario()
    {
        return $this->hasOne(Partner::class,'cpf','cpf');
    }
    public function filial()
    {
        return $this->hasOne(Filial::class,'id','codfilial');
    }
}
