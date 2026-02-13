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
        Schema::create('propriete_graphe', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_four')
                ->constrained('fours')
                ->onDelete('cascade');

            $table->integer('V1');
            $table->integer('V2');

            $table->string('color', 20);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('propriete_graphe');
    }
};
