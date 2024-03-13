<div>
    @session('error')
    <div class="alert alert-danger text-center">
        {{ session('error') }}
    </div>
    @endsession
    <div class="login-box">
        <form class="login-form" wire:submit="authenticate">
            <h3 class="login-head"><i class="fa fa-lg fa-fw fa-user"></i>LOGIN</h3>
            <div class="form-group">
                <label class="control-label" for="email">EMAIL</label>
                <input class="form-control @error('email') is-invalid @enderror" type="text" id="email" placeholder="Email" wire:model="email" autofocus>
                @error('email')
                <div class="invalid-feedback">
                    {{ $message }}
                </div>
                @enderror
            </div>
            <div class="form-group">
                <label class="control-label" for="password">SENHA</label>
                <input class="form-control @error('password') is-invalid @enderror" type="password" id="password" placeholder="SENHA" wire:model="password">
                @error('password')
                <div class="invalid-feedback">
                    {{ $message }}
                </div>
                @enderror
            </div>
            <div class="form-group">
                <div class="utility">
                    <div class="animated-checkbox">
                        <label>
                            <input type="checkbox" wire:model="remeber"><span class="label-text">Permanecer Logado</span>
                        </label>
                    </div>
                    {{--<p class="semibold-text mb-2"><a href="#" data-toggle="flip">Forgot Password ?</a></p>--}}
                </div>
            </div>
            <div class="form-group btn-container">
                <button class="btn btn-primary btn-block"><i class="fa fa-sign-in fa-lg fa-fw"></i>Entrar</button>
            </div>
        </form>
        {{--<form class="forget-form" action="index.html">
            <h3 class="login-head"><i class="fa fa-lg fa-fw fa-lock"></i>Forgot Password ?</h3>
            <div class="form-group">
                <label class="control-label">EMAIL</label>
                <input class="form-control" type="text" placeholder="Email">
            </div>
            <div class="form-group btn-container">
                <button class="btn btn-primary btn-block"><i class="fa fa-unlock fa-lg fa-fw"></i>RESET</button>
            </div>
            <div class="form-group mt-3">
                <p class="semibold-text mb-0"><a href="#" data-toggle="flip"><i class="fa fa-angle-left fa-fw"></i> Back to Login</a></p>
            </div>
        </form>--}}
    </div>
</div>
