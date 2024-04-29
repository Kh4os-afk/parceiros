<?php

namespace App\Livewire\Auth;

use Illuminate\Support\Facades\Auth;
use Jantinnerezo\LivewireAlert\LivewireAlert;
use Livewire\Attributes\Rule;
use Livewire\Component;

class Login extends Component
{
    use LivewireAlert;

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

        $this->alert('error', 'Usuario ou Senha Invalida!',[
            'timerProgressBar' => true,
        ]);
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
