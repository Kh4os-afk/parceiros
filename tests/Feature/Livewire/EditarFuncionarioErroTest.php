<?php

use App\Livewire\EditarFuncionarioErro;
use Livewire\Livewire;

it('renders successfully', function () {
    Livewire::test(EditarFuncionarioErro::class)
        ->assertStatus(200);
});
