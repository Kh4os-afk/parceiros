<?php

use Illuminate\Support\Facades\Route;

// Serve a SPA React para todas as rotas — o React Router cuida da navegação
Route::get('/{any}', fn () => view('app'))->where('any', '.*');
