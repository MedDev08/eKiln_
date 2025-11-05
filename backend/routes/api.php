<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->get('/me', function () {
    return auth()->user();
});
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum', 'admin')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{id}/toggle-active', [UserController::class, 'toggleActive']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::patch('/users/{id}/toggle', [UserController::class, 'toggleActive']);
});

use App\Http\Controllers\FamilleController;
use App\Http\Controllers\WagonController;
use App\Http\Controllers\FourController;
use App\Http\Controllers\ChargementController;
use App\Models\Famille;
use App\Http\Controllers\PolyvalenceController;
use App\Http\Controllers\AffectationController;
use App\Http\Controllers\StatistiqueController;

Route::get('/wagons/cooking-count', [WagonController::class, 'getCookingWagonsCount']);
Route::get('/pieces/Somme', [FamilleController::class, 'getTotalPiecesSum']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/familles', [FamilleController::class, 'index']);

    Route::get('/wagons', [WagonController::class, 'index']);

    //Route::get('/fours', [FourController::class, 'index']);

    Route::post('/chargements', [ChargementController::class, 'store'])->middleware('auth:sanctum');
    Route::get('/chargements/mes-chargements', [ChargementController::class, 'mesChargements']);
    Route::get('/chargements/{id_chargement}/details', [ChargementController::class, 'detailsChargement']);
    Route::get('/wagons/completed', [WagonController::class, 'getCompletedWagonsCount']);
    Route::get('/pieces/total', [FamilleController::class, 'getTotalPiecesCount']);
    Route::get('/chargements/actifsdash', [ChargementController::class, 'getChargementsActifs']);
    Route::get('/chargements/actifs', [ChargementController::class, 'getChargementsActifsdash']);
    Route::get('/chargements/interval', [ChargementController::class, 'getChargementsActifs']);
    Route::get('/trieurs/actifs', [UserController::class, 'getActiveTrieurs'])->middleware('auth:sanctum');
    Route::get('/enfourneurs/actifs', [UserController::class, 'getActiveEnfourneurs'])->middleware('auth:sanctum');
    Route::post('/polyvalences', [PolyvalenceController::class, 'store']);
    Route::get('/polyvalences/{user}', [PolyvalenceController::class, 'show']);
    Route::delete('/polyvalences/{polyvalence}', [PolyvalenceController::class, 'destroy']);
    Route::get('/chargements/trieurs-needed', [ChargementController::class, 'calculateTrieursNeeded']);
    Route::get('/chargements/trieurs-needed-dash', [ChargementController::class, 'calculateTrieursNeededdash']);
    Route::get('/getCurrentPresences', [UserController::class, 'getCurrentPresences']);
    Route::post('/updatePresence', [UserController::class, 'updatePresence']);
    //Route::put('/fours/{id}/update-cadence', [FourController::class, 'updateCadence']);
    Route::get('/trieurs/with-polyvalences', [UserController::class, 'getTrieursWithPolyvalences']);

    // Récupérer les trieurs polyvalents pour une famille
    Route::get('/trieurs/polyvalents/{id_famille}', [UserController::class, 'getTrieursForFamille']);


    Route::get('/trieurs/polyvalents/{id_famille}', [UserController::class, 'getTrieursPolyvalents']);
    // Route pour obtenir les trieurs par famille
    Route::get('/trieurs/famille/{id_famille}', [UserController::class, 'getTrieursForFamille']);
    Route::get('/trieurs/actifs', [UserController::class, 'getActiveTrieurs']);
    Route::get('/trieurs/pour-famille/{id_famille}', [UserController::class, 'getTrieursForFamille']);
    Route::get('/trieurs/count-active', [UserController::class, 'countActiveTrieurs'])->middleware('auth:sanctum');
    Route::get('/chargements/density', [ChargementController::class, 'calculateDensity'])->middleware('auth:sanctum');
    Route::post('/affectations', [AffectationController::class, 'store']);
    Route::get('/affectations/interval', [AffectationController::class, 'getAffectationsByInterval']);
    Route::get('/affectations/famille/{id_famille}', [AffectationController::class, 'getAffectationsByFamille']);
    Route::get('/affectations', [AffectationController::class, 'index']);
    Route::get('/affectations/current-interval', [AffectationController::class, 'getAffectationsByCurrentInterval']);
    Route::get('/chargements/last-by-wagon/{wagonNum}', [ChargementController::class, 'getLastChargementByWagon']);
    Route::get('/chargements/trieurs-needed-by-wagons', [ChargementController::class, 'calculateTrieursNeededByWagons']);
    Route::get('/affectations/with-details', [AffectationController::class, 'getAffectationsWithDetails']);
    Route::get('/affectations/by-wagon-group', [AffectationController::class, 'getAffectationsByWagonGroup']);
    Route::get('/affectations/by-wagons', [AffectationController::class, 'getAffectationsByWagons']);
    Route::get('/affectations/{id}', [AffectationController::class, 'show']);
    Route::get('/affectations/by-interval', [AffectationController::class, 'getAffectationsByInterval']);
    Route::get('/affectations/grouped-by-interval', [AffectationController::class, 'getAffectationsGroupedByInterval'])
        ->middleware('auth:sanctum');
    Route::get('/familles/{id}', [FamilleController::class, 'show']);
    Route::get('/trieurs/{id}/productivity', [AffectationController::class, 'checkTrieurProductivity']);
    Route::get('/chargements/calculate-trieurs', [ChargementController::class, 'calculateTrieursNeeded']);
    Route::get('/chargements/trieurs-needed2', [ChargementController::class, 'calculateTrieursNeeded2']);
    Route::get('/chargements/active-by-four', [ChargementController::class, 'getActiveByFour'])->middleware('auth:sanctum');
    // Dans api.php, à l'intérieur du groupe middleware('auth:sanctum')
    Route::get('/statistiques', [StatistiqueController::class, 'index'])->middleware('auth:sanctum');
    // Dans le groupe middleware('auth:sanctum')
    Route::get('/chargements/last-30-wagons', [ChargementController::class, 'getLast30Wagons'])->middleware('auth:sanctum');
    // Dans le groupe middleware('auth:sanctum')
    Route::get('/total-pieces-by-day', [ChargementController::class, 'getTotalPiecesByDay'])->middleware('auth:sanctum');

    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('users', UserController::class);
        // Vos autres routes protégées
    });
    Route::get('/users', [UserController::class, 'index'])->middleware('auth:sanctum');
    Route::get('/users/{id}', [UserController::class, 'show'])->middleware('auth:sanctum');
    Route::post('/users', [UserController::class, 'store'])->middleware('auth:sanctum');
    Route::put('/users/{id}', [UserController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->middleware('auth:sanctum');
    Route::group(['middleware' => ['auth:sanctum']], function () {
        Route::get('/four-chargements1', [ChargementController::class, 'getActiveChargementsWithCache']);
        Route::get('/chargement-details/{id}', [ChargementController::class, 'getChargementDetails']);
    });
    Route::group(['middleware' => 'auth:sanctum'], function () {
        Route::get('/fours', [FourController::class, 'index']);
        Route::patch('/fours/{id}', [FourController::class, 'updateCadence']);
    });

    Route::middleware('auth:sanctum')->group(function () {
        // Routes pour la gestion des wagons
        Route::get('/wagons1', [WagonController::class, 'index']);
        Route::get('/wagons1/{id}', [WagonController::class, 'show']);
        Route::post('/wagons1', [WagonController::class, 'store']);
        Route::put('/wagons1/{id}', [WagonController::class, 'update']);
        Route::delete('/wagons1/{id}', [WagonController::class, 'destroy']);

        // Vos autres routes existantes...
    });
    Route::get('/chargement-details1/{id}', [ChargementController::class, 'getChargementDetailsWithWagon']);
    Route::get('/history', [AffectationController::class, 'historyy']);
    Route::get('/chargements/historique', [ChargementController::class, 'getHistorique']);
    Route::get('/chargements/{id}/details-popup', [ChargementController::class, 'getPopupDetails'])->middleware('auth:sanctum');
});
Route::middleware('auth:sanctum')->group(function () {
    // ... autres routes

    // Familles routes
    Route::get('/familles', [FamilleController::class, 'index']);
    Route::post('/familles', [FamilleController::class, 'store']);
    Route::put('/familles/{famille}', [FamilleController::class, 'update']);
    Route::delete('/familles/{famille}', [FamilleController::class, 'destroy']);
});
Route::middleware('api')->group(function () {
    Route::patch('/users/{user}/toggle-active', [UserController::class, 'toggleActive']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
});

Route::middleware('auth:api')->group(function () {
    // Other routes...
    Route::get('/affectations/productivity', [AffectationController::class, 'productivity']);
});
Route::get('/total-pieces-by-shift', [ChargementController::class, 'getTotalPiecesByShift'])->middleware('auth:sanctum');
Route::put('/chargements/{chargement}', [ChargementController::class, 'update']);
// Route::middleware('auth:sanctum')->group(function () {
//     // ... autres routes

Route::get('/chargements/en-attente', [ChargementController::class, 'getWagonsEnAttente']);
Route::post('/chargements/valider/{id}', [ChargementController::class, 'valider']);
Route::get('/chargements/last-date/{idFour}', [ChargementController::class, 'getLastDateEntrer']);
Route::get('/chargements/recherche', [ChargementController::class, 'getrecherche']);
Route::post('/chargements/details-batch', [ChargementController::class, 'getBatchDetails']);
// });
