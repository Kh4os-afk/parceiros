<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $data
 * @property string $usuario
 * @property string $operacao
 * @property string $descricao
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|ChangeLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ChangeLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ChangeLog query()
 * @method static \Illuminate\Database\Eloquent\Builder|ChangeLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ChangeLog whereData($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ChangeLog whereDescricao($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ChangeLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ChangeLog whereOperacao($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ChangeLog whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ChangeLog whereUsuario($value)
 */
	class ChangeLog extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $filial
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Filial newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Filial newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Filial query()
 * @method static \Illuminate\Database\Eloquent\Builder|Filial whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Filial whereFilial($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Filial whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Filial whereUpdatedAt($value)
 */
	class Filial extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $nome
 * @property string $cpf
 * @property int $matricula
 * @property int $limcred
 * @property int $bloqueado
 * @property int $alterado
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Sale> $compras
 * @property-read int|null $compras_count
 * @method static \Illuminate\Database\Eloquent\Builder|Partner newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Partner newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Partner query()
 * @method static \Illuminate\Database\Eloquent\Builder|Partner whereAlterado($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Partner whereBloqueado($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Partner whereCpf($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Partner whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Partner whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Partner whereLimcred($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Partner whereMatricula($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Partner whereNome($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Partner whereUpdatedAt($value)
 */
	class Partner extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $nome
 * @property string $cpf
 * @property int $matricula
 * @property int $limcred
 * @property int $bloqueado
 * @property string $erros
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|PartnerError newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|PartnerError newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|PartnerError query()
 * @method static \Illuminate\Database\Eloquent\Builder|PartnerError whereBloqueado($value)
 * @method static \Illuminate\Database\Eloquent\Builder|PartnerError whereCpf($value)
 * @method static \Illuminate\Database\Eloquent\Builder|PartnerError whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|PartnerError whereErros($value)
 * @method static \Illuminate\Database\Eloquent\Builder|PartnerError whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|PartnerError whereLimcred($value)
 * @method static \Illuminate\Database\Eloquent\Builder|PartnerError whereMatricula($value)
 * @method static \Illuminate\Database\Eloquent\Builder|PartnerError whereNome($value)
 * @method static \Illuminate\Database\Eloquent\Builder|PartnerError whereUpdatedAt($value)
 */
	class PartnerError extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $cpf
 * @property int $codfilial
 * @property int $caixa
 * @property int $numnota
 * @property string $dtsaida
 * @property string $vltotal
 * @property string $qrcodenfce
 * @property string|null $dtcancel
 * @property string|null $dtdevol
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Filial|null $filial
 * @property-read \App\Models\Partner|null $funcionario
 * @method static \Illuminate\Database\Eloquent\Builder|Sale newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Sale newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Sale query()
 * @method static \Illuminate\Database\Eloquent\Builder|Sale whereCaixa($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Sale whereCodfilial($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Sale whereCpf($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Sale whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Sale whereDtcancel($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Sale whereDtdevol($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Sale whereDtsaida($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Sale whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Sale whereNumnota($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Sale whereQrcodenfce($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Sale whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Sale whereVltotal($value)
 */
	class Sale extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property mixed $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User query()
 * @method static \Illuminate\Database\Eloquent\Builder|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereUpdatedAt($value)
 */
	class User extends \Eloquent {}
}

