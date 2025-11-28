<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnneauxBullers  extends Model
{
    protected $fillable = [
        'id_chargement',
        'id_user',
        'coche',
        'gauche',
        'droit'
    ];

    public function chargement()
    {
        return $this->belongsTo(Chargement::class, 'id_chargement');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
}
