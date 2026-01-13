<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('chargements', function (Blueprint $table) {
            $table->string('matricule')->nullable()->after('id_user');
        });
    }

    public function down()
    {
        Schema::table('chargements', function (Blueprint $table) {
            $table->dropColumn('matricule');
        });
    }
};
