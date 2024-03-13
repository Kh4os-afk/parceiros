<?php

namespace App\Livewire\Auth;

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Rule;
use Livewire\Component;

class Login extends Component
{
    #[Rule('required|email')]
    public $email;
    #[Rule('required')]
    public $password;
    #[Rule('required')]
    public $remeber = false;

    public function authenticate()
    {
        $this->validate();

        if (Auth::attempt(['email' => $this->email, 'password' => $this->password], $this->remeber)) {
            session()->regenerate();

            return redirect()->intended('/convenio');
        }

        return session()->flash('error','Usuario ou Senha Invalida!');
    }

    public function logout()
    {
        Auth::logout();

        session()->invalidate();

        session()->regenerateToken();

        return redirect()->route('login');
    }

    public function render()
    {
        return view('livewire.auth.login')
            ->layout('components.layouts.login')
            ->title('Login');
    }
}
