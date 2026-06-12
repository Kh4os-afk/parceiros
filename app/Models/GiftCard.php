<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GiftCard extends Model
{
    protected $fillable = ['codcli', 'cliente', 'numgiftcard', 'dtvalidade', 'valor', 'saldo', 'utilizado'];

    protected $casts = [
        'dtvalidade' => 'date:Y-m-d',
        'valor'      => 'float',
        'saldo'      => 'float',
        'utilizado'  => 'float',
    ];
}
