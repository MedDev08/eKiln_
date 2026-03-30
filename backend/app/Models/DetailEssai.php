<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailEssai extends Model
{
    protected $table = 'details_essais';

    protected $fillable = [
        'id_chargement',
        'id_user_cre',
        'id_user_rep',
        'id_essais',
        'valeur',
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
    public function essai()
    {
        return $this->belongsTo(Essai::class, 'id_essais', 'id');
    }
}
