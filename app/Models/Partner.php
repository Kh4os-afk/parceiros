<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Partner extends Model
{
    protected $fillable = ['nome','cpf','matricula','limcred','bloqueado','alterado'];

    public function compras()
    {
        return $this->hasMany(Sale::class,'cpf','cpf');
    }
}
