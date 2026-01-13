<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\BaseAuditableModel;

class Famille extends BaseAuditableModel
{
    protected $primaryKey = 'id_famille';
    protected $fillable = ['nom_famille', 'valeur_trieur', 'active', 'poids'];
    public function polyvalences()
    {
        return $this->hasMany(Polyvalence::class, 'id_famille', 'id_famille');
    }
    public function affectationsTrieur()
    {
        return $this->hasMany(AffectationTrieur::class, 'id_famille', 'id_famille');
    }

    public function detailsAffectations()
    {
        return $this->hasMany(DetailAffectation::class, 'id_famille', 'id_famille');
    }
}
