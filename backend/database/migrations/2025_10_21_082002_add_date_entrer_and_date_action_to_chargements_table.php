<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('chargements', function (Blueprint $table) {
            $table->dateTime('date_entrer')->nullable()->after('datetime_chargement');
            $table->dateTime('date_action')->nullable()->after('date_entrer');
        });
    }

    public function down()
    {
        Schema::table('chargements', function (Blueprint $table) {
            $table->dropColumn(['date_entrer', 'date_action']);
        });
    }
};
