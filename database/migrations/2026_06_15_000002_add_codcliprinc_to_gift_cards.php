<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('gift_cards') || Schema::hasColumn('gift_cards', 'codcliprinc')) {
            return;
        }

        Schema::table('gift_cards', function (Blueprint $table) {
            $table->unsignedBigInteger('codcliprinc')->nullable()->after('codcli');
            $table->index('codcliprinc');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('gift_cards') || ! Schema::hasColumn('gift_cards', 'codcliprinc')) {
            return;
        }

        Schema::table('gift_cards', function (Blueprint $table) {
            $table->dropIndex(['codcliprinc']);
            $table->dropColumn('codcliprinc');
        });
    }
};
