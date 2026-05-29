<?php

use App\Models\Empresa;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function createApiUser(array $attrs = []): User
{
    $empresa = Empresa::create([
        'nome'  => 'Empresa Teste',
        'slug'  => 'empresa-teste',
        'ativo' => true,
    ]);

    return User::factory()->create(array_merge([
        'email'      => 'teste@convenio.local',
        'password'   => 'senha123',
        'empresa_id' => $empresa->id,
        'role'       => 'user',
    ], $attrs));
}

test('login retorna token e dados do usuário', function () {
    $user = createApiUser();

    $response = $this->postJson('/api/login', [
        'email'    => $user->email,
        'password' => 'senha123',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);

    expect($response->json('user.email'))->toBe($user->email);
});

test('login com credenciais inválidas retorna 401', function () {
    createApiUser();

    $this->postJson('/api/login', [
        'email'    => 'teste@convenio.local',
        'password' => 'errada',
    ])->assertUnauthorized();
});

test('rota user exige autenticação', function () {
    $this->getJson('/api/user')->assertUnauthorized();
});

test('rota user retorna usuário autenticado via bearer token', function () {
    $user = createApiUser();
    Sanctum::actingAs($user);

    $this->getJson('/api/user')
        ->assertOk()
        ->assertJsonPath('user.id', $user->id);
});

test('logout invalida o token atual', function () {
    $user = createApiUser();

    $login = $this->postJson('/api/login', [
        'email'    => $user->email,
        'password' => 'senha123',
    ]);

    $token = $login->json('token');

    $this->withHeader('Authorization', 'Bearer '.$token)
        ->postJson('/api/logout')
        ->assertOk();

    // Limpa autenticação residual antes de validar que o token foi revogado
    $this->app['auth']->forgetGuards();

    $this->withHeader('Authorization', 'Bearer '.$token)
        ->getJson('/api/user')
        ->assertUnauthorized();
});

test('token bearer funciona em rota protegida de parceiros', function () {
    $user = createApiUser();

    $login = $this->postJson('/api/login', [
        'email'    => $user->email,
        'password' => 'senha123',
    ]);

    $this->withHeader('Authorization', 'Bearer '.$login->json('token'))
        ->getJson('/api/partners')
        ->assertOk();
});
