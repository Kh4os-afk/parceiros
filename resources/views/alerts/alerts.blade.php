@session('success')
    <div class="alert alert-success text-center">
        {{ $value }}
    </div>
@endsession

@session('error')
    <div class="alert alert-danger text-center">
        {{ $value }}
    </div>
@endsession

@session('warning')
    <div class="alert alert-warning text-center">
        {{ $value }}
    </div>
@endsession

@session('info')
    <div class="alert alert-info text-center">
        {{ $value }}
    </div>
@endsession
