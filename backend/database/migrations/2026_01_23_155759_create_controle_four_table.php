<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('controle_four', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_controle')
                ->constrained('controles')
                ->onDelete('cascade');

            $table->foreignId('id_four')
                ->constrained('fours')
                ->onDelete('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('controle_four');
    }
};
