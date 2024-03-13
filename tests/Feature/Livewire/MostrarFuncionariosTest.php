<?php

use App\Livewire\MostrarFuncionarios;
use Livewire\Livewire;

it('renders successfully', function () {
    Livewire::test(MostrarFuncionarios::class)
        ->assertStatus(200);
});
