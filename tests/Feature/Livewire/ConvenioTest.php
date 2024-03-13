<?php

use App\Livewire\Convenio;
use Livewire\Livewire;

it('renders successfully', function () {
    Livewire::test(Convenio::class)
        ->assertStatus(200);
});
