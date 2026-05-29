<?php

use App\Models\Empresa;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\HttpFoundation\Cookie;

uses(RefreshDatabase::class);

function cookieFromResponse($response, string $nameContains): ?Cookie
{
    foreach ($response->headers->getCookies() as $cookie) {
        if (str_contains($cookie->getName(), $nameContains)) {
            return $cookie;
        }
    }

    return null;
}

test('configuração de sessão usa same_site strict', function () {
    expect(config('session.same_site'))->toBe('strict');
});

test('cookies de sessão da aplicação web usam same_site strict e httponly', function () {
    $response = $this->get('/');

    $response->assertOk();

    $sessionCookie = cookieFromResponse($response, 'session');

    expect($sessionCookie)->not->toBeNull();
    expect(strtolower((string) $sessionCookie->getSameSite()))->toBe('strict');
    expect($sessionCookie->isHttpOnly())->toBeTrue();
});

test('cookie xsrf usa same_site strict quando solicitado', function () {
    $response = $this->get('/sanctum/csrf-cookie');

    $response->assertNoContent();

    $xsrfCookie = cookieFromResponse($response, 'XSRF-TOKEN');

    expect($xsrfCookie)->not->toBeNull();
    expect(strtolower((string) $xsrfCookie->getSameSite()))->toBe('strict');
    expect($xsrfCookie->isHttpOnly())->toBeFalse();
});

test('login api com bearer token não depende de cookie de sessão para autenticação', function () {
    $empresa = Empresa::create([
        'nome'  => 'Empresa Cookie',
        'slug'  => 'empresa-cookie',
        'ativo' => true,
    ]);

    $user = User::factory()->create([
        'email'      => 'cookie@convenio.local',
        'password'   => 'senha123',
        'empresa_id' => $empresa->id,
    ]);

    $login = $this->postJson('/api/login', [
        'email'    => $user->email,
        'password' => 'senha123',
    ]);

    $token = $login->json('token');

    // Sem enviar cookies — apenas Bearer (fluxo SPA atual)
    $this->withHeaders([
        'Authorization' => 'Bearer '.$token,
        'Cookie'        => '',
    ])->getJson('/api/user')
        ->assertOk()
        ->assertJsonPath('user.id', $user->id);
});

test('requisição api sem token nem cookie de sessão é rejeitada', function () {
    $this->withHeaders(['Cookie' => ''])
        ->getJson('/api/partners')
        ->assertUnauthorized();
});
