<?php

// app/Models/Wagon.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\BaseAuditableModel;

class Wagon extends BaseAuditableModel
{
    protected $primaryKey = 'id_wagon';
    protected $fillable = ['num_wagon', 'type_wagon', 'statut'];
    public function affectations(): BelongsToMany
    {
        return $this->belongsToMany(
            AffectationTrieur::class,
            'affectation_wagon',
            'id_wagon',
            'id_affectation'
        )->withTimestamps();
    }
}
