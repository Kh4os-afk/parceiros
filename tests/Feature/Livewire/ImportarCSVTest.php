<?php

use App\Livewire\ImportarCSV;
use Livewire\Livewire;

it('renders successfully', function () {
    Livewire::test(ImportarCSV::class)
        ->assertStatus(200);
});
