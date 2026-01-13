<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\BaseAuditableModel;
use Carbon\Carbon;

class Chargement extends BaseAuditableModel
{
    use SoftDeletes;
    protected $fillable = ['id_user', 'id_wagon', 'id_four', 'id_typeWagon', 'statut', 'datetime_sortieEstime', 'matricule'];
    protected $dates = ['deleted_at'];
    protected static function booted()
    {
        static::creating(function ($chargement) {
            $chargement->statut = 'en attente';
            $chargement->datetime_chargement = now();

            if ($chargement->four) {
                // Utilisation directe des secondes (nouveau format)
                $dureeSecondes = $chargement->four->duree_cuisson;
                $chargement->datetime_sortieEstime = Carbon::now()->addSeconds($dureeSecondes);

                // Mettre à jour le statut du wagon
                $wagon = Wagon::find($chargement->id_wagon);
                if ($wagon) {
                    $wagon->statut = 'en cuisson';
                    $wagon->save();
                }
            }
        });

        // Nouveau : Lors de la mise à jour
        static::updated(function ($chargement) {
            if ($chargement->statut === 'sorti') {
                $wagon = Wagon::find($chargement->id_wagon);
                if ($wagon) {
                    $wagon->statut = 'disponible';
                    $wagon->save();
                }
            }
        });
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
    public function four()
    {
        return $this->belongsTo(Four::class, 'id_four');
    }
    public function wagon()
    {
        return $this->belongsTo(Wagon::class, 'id_wagon');
    }
    public function type_wagon()
    {
        return $this->belongsTo(TypeWagon::class, 'id_typeWagon');
    }
    public function details()
    {
        return $this->hasMany(DetailChargement::class, 'id_chargement');
    }
    public function anneaux()
    {
        return $this->hasOne(AnneauxBullers::class, 'id_chargement', 'id');
    }
    protected $primaryKey = 'id';
    public $incrementing = true;
}
