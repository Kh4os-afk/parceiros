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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('cpf');
            $table->unsignedBigInteger('codfilial');
            $table->unsignedBigInteger('caixa');
            $table->unsignedBigInteger('numnota');
            $table->date('dtsaida');
            $table->decimal('vltotal');
            $table->string('qrcodenfce');
            $table->date('dtcancel')->nullable();
            $table->date('dtdevol')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
