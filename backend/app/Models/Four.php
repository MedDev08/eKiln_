<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\BaseAuditableModel;

class Four extends BaseAuditableModel
{
    protected $primaryKey = 'id_four';
    protected $fillable = ['num_four', 'duree_cuisson', 'cadence', 'obj_density'];



    public function getDureeCuissonFormateeAttribute()
    {
        $seconds = $this->duree_cuisson;
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $seconds = $seconds % 60;

        return sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
    }

    public static function updateCadence($id_four, $new_cadence, $newObj_density)
    {
        $four = self::findOrFail($id_four);
        $ancienne_cadence = $four->cadence;
        $ancienne_duree = $four->duree_cuisson; // Déjà en secondes

        // Calculer la nouvelle durée (en secondes)
        $nouvelle_duree = ($new_cadence * $ancienne_duree) / $ancienne_cadence;

        // Mettre à jour
        $four->update([
            'cadence' => $new_cadence,
            'duree_cuisson' => (int) round($nouvelle_duree), // Stocker en secondes
            'obj_density' => $newObj_density
        ]);

        return $four;
    }
}
