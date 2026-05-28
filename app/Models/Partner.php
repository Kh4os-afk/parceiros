<?php

namespace App\Models;

use App\Models\Scopes\EmpresaScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Partner extends Model
{
    protected $fillable = ['empresa_id', 'nome', 'cpf', 'matricula', 'limcred', 'bloqueado', 'alterado'];

    protected static function booted(): void
    {
        static::addGlobalScope(new EmpresaScope());
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }

    public function compras(): HasMany
    {
        return $this->hasMany(Sale::class, 'cpf', 'cpf');
    }
}
