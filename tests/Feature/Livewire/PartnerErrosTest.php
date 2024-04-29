<?php

use App\Livewire\PartnerErros;
use Livewire\Livewire;

it('renders successfully', function () {
    Livewire::test(PartnerErros::class)
        ->assertStatus(200);
});
