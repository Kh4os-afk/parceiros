<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', \App\Livewire\Auth\Login::class)->name('login');
});

Route::middleware('auth')->group(function () {
    Route::get('/logout',[\App\Livewire\Auth\Login::class,'logout'])->name('logout');

    Route::get('/convenio', \App\Livewire\Convenio::class)->name('convenio.index');
    Route::get('/cadastrar/funcionario', \App\Livewire\CadastrarFuncionario::class)->name('funcionario.index');
    Route::get('/funcionarios', \App\Livewire\MostrarFuncionarios::class)->name('mostrar-funcionarios.index');
    Route::get('/editar/{partner}', \App\Livewire\EditarFuncionario::class)->name('editar-funcionario.index');

    Route::get('/importar/csv',\App\Livewire\ImportarCSV::class)->name('importar-csv.index');

    Route::get('/teste',function (){
       return view('teste');
    });
});

Route::fallback(function (){
   return redirect()->route('convenio.index');
});

