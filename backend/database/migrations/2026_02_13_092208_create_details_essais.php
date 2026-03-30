<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('details_essais', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('id_chargement');
            $table->unsignedBigInteger('id_user_cre');
            $table->unsignedBigInteger('id_user_rep')->nullable();
            $table->unsignedBigInteger('id_essais');

            $table->string('valeur')->nullable();

            $table->timestamps();

            // Clés étrangères
            $table->foreign('id_chargement')
                ->references('id')
                ->on('chargements')
                ->onDelete('cascade');

            $table->foreign('id_user_cre')
                ->references('id_user')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('id_user_rep')
                ->references('id_user')
                ->on('users')
                ->noActionOnDelete();
            $table->foreign('id_essais')
                ->references('id')
                ->on('essais')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('details_essais');
    }
};
