<?php

use App\Livewire\EditarFuncionario;
use Livewire\Livewire;

it('renders successfully', function () {
    Livewire::test(EditarFuncionario::class)
        ->assertStatus(200);
});
