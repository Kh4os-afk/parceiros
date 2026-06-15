<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('gift_cards')) {
            return;
        }

        Schema::create('gift_cards', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('codcli');
            $table->string('cliente', 255);
            $table->string('numgiftcard', 50)->unique();
            $table->date('dtvalidade')->nullable();
            $table->decimal('valor', 12, 2)->default(0);
            $table->decimal('saldo', 12, 2)->default(0);
            $table->decimal('utilizado', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gift_cards');
    }
};
