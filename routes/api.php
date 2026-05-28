<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmpresaController;
use App\Http\Controllers\Api\FilialController;
use App\Http\Controllers\Api\PartnerController;
use App\Http\Controllers\Api\PartnerErrorController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Autenticação (público)
Route::post('/login', [AuthController::class, 'login']);

// Rotas protegidas por Sanctum SPA
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'user']);

    // Funcionários (Partners)
    Route::get('/partners',              [PartnerController::class, 'index']);   // ?search=&sort_by=&order=&page=
    Route::post('/partners',             [PartnerController::class, 'store']);
    Route::post('/partners/import',      [PartnerController::class, 'import']);
    Route::get('/partners/{partner}',    [PartnerController::class, 'show']);
    Route::put('/partners/{partner}',    [PartnerController::class, 'update']);
    Route::get('/partners/{partner}/sales', [SaleController::class, 'byPartner']);

    // Erros de importação
    Route::get('/partner-errors',                       [PartnerErrorController::class, 'index']);
    Route::get('/partner-errors/{error}',             [PartnerErrorController::class, 'show']);
    Route::delete('/partner-errors/all',                [PartnerErrorController::class, 'destroyAll']);
    Route::delete('/partner-errors/duplicates',         [PartnerErrorController::class, 'destroyDuplicates']);
    Route::delete('/partner-errors/{error}',            [PartnerErrorController::class, 'destroy']);
    Route::post('/partner-errors/{error}/approve',      [PartnerErrorController::class, 'approve']);

    // Relatórios de vendas
    Route::get('/sales/by-cpf',  [SaleController::class, 'byPartnerCpf']); // ?cpf=
    Route::get('/sales/period',  [SaleController::class, 'byPeriod']);     // ?start_date=&end_date=

    // Filiais
    Route::get('/filiais', [FilialController::class, 'index']);

    // Admin only
    Route::middleware('admin')->group(function () {
        Route::apiResource('empresas', EmpresaController::class)->except(['destroy']);
        Route::apiResource('users', UserController::class);
    });
});
