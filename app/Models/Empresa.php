<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Empresa extends Model
{
    protected $fillable = ['nome', 'slug', 'ativo'];

    protected $casts = ['ativo' => 'boolean'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function partners(): HasMany
    {
        return $this->hasMany(Partner::class);
    }

    public function filiais(): HasMany
    {
        return $this->hasMany(Filial::class);
    }

    public function partnerErrors(): HasMany
    {
        return $this->hasMany(PartnerError::class);
    }
}
