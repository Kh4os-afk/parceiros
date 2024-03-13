<?php

use App\Livewire\CadastrarFuncionario;
use Livewire\Livewire;

it('renders successfully', function () {
    Livewire::test(CadastrarFuncionario::class)
        ->assertStatus(200);
});
