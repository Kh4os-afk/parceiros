<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartnerError extends Model
{
    protected $fillable = ['nome','cpf','matricula','limcred','bloqueado','erros'];
}
