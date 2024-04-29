<?php

use App\Livewire\ImportacaoErros;
use Livewire\Livewire;

it('renders successfully', function () {
    Livewire::test(ImportacaoErros::class)
        ->assertStatus(200);
});
