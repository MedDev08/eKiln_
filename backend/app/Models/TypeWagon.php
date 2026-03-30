<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\BaseAuditableModel;

class TypeWagon extends BaseAuditableModel
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
