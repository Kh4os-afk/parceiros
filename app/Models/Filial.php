<?php

namespace App\Models;

use App\Models\Scopes\EmpresaScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Filial extends Model
{
    protected $table = 'filiais';

    protected $fillable = ['empresa_id', 'filial'];

    protected static function booted(): void
    {
        static::addGlobalScope(new EmpresaScope());
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }
}
