<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnneauxBullers  extends Model
{
    protected $fillable = [
        'id_chargement',
        'id_user_cre',
        'id_user_rep',
        'coche',
        'gauche',
        'droit'
    ];
    public function chargement()
    {
        return $this->belongsTo(Chargement::class, 'id_chargement');
    }

    public function user_cre()
    {
        return $this->belongsTo(User::class, 'id_user_cre');
    }
    public function user_rep()
    {
        return $this->belongsTo(User::class, 'id_user_rep');
    }
}
