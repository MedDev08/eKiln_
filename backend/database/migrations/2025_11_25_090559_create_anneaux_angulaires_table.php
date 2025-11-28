<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('anneaux_angulaires', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_chargement');
            $table->integer('gauche')->nullable();
            $table->integer('droit')->nullable();
            $table->timestamps();

            $table->foreign('id_chargement')
                ->references('id')
                ->on('chargements')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anneaux_angulaires');
    }
};
