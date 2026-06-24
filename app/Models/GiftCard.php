<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GiftCard extends Model
{
    protected $fillable = ['codcli', 'codcliprinc', 'cliente', 'numgiftcard', 'dtvalidade', 'valor', 'saldo', 'utilizado'];

    protected $casts = [
        'dtvalidade' => 'date:Y-m-d',
        'valor'      => 'float',
        'saldo'      => 'float',
        'utilizado'  => 'float',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'codcliprinc', 'codcli');
    }
}
