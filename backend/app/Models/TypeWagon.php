<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TypeWagon extends Model
{
    protected $table = 'type_wagon';

    protected $fillable = [
        'type_wagon',
        'description',
        'color'
    ];

    public function chargements()
    {
        return $this->hasMany(Chargement::class, 'id_typeWagon');
    }
}
