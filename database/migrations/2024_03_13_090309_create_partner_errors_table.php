<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('partner_errors', function (Blueprint $table) {
            $table->id();
            $table->string('nome',60);
            $table->string('cpf',14)->index();
            $table->integer('matricula');
            $table->integer('limcred');
            $table->boolean('bloqueado');
            $table->string('erros');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partner_errors');
    }
};
