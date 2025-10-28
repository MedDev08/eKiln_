<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Chargement;
use App\Models\DetailChargement;
use App\Models\Wagon;
use App\Models\Four;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Carbon\CarbonInterval;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ChargementController extends Controller
{

    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        $request->validate([
            'id_wagon' => 'required|exists:wagons,id_wagon',
            'id_four' => 'required|exists:fours,id_four',
            'pieces' => 'required|array',
            'pieces.*.id_famille' => 'required|exists:familles,id_famille',
            'pieces.*.quantite' => 'required|integer|min:1',
        ]);

        // Vérifier le statut du wagon
        $wagon = Wagon::find($request->id_wagon);
        /*if ($wagon->statut !== 'Disponible' && $wagon->statut !== 'disponible') {
        return response()->json([
            'message' => 'Ce wagon n\'est pas disponible pour le chargement',
            'statut_wagon' => $wagon->statut
        ], 422);
    }*/

        // Créer le chargement
        $chargement = Chargement::create([
            'id_user' => $user->id_user,
            'id_wagon' => $request->id_wagon,
            'id_four' => $request->id_four,
            'datetime_chargement' => now(),
            'statut' => 'en cours',
        ]);

        // Mettre à jour le statut du wagon
        $wagon->update(['statut' => 'en cuisson']);

        // Ajouter les détails de chargement
        foreach ($request->pieces as $piece) {
            DetailChargement::create([
                'id_chargement' => $chargement->id,
                'id_famille' => $piece['id_famille'],
                'quantite' => $piece['quantite'],
            ]);
        }

        return response()->json(['message' => 'Chargement créé avec succès'], 201);
    }

    public function mesChargements()
    {
        $user = Auth::user();
        $now = now(); // moment actuel
        $hour = $now->hour;


        // Définir le début et la fin du shift
        if ($hour >= 6 && $hour < 14) {
            // Shift 1 : 06:00 → 14:00
            $start = $now->copy()->setHour(6)->setMinute(0)->setSecond(0);
            $end = $now->copy()->setHour(14)->setMinute(0)->setSecond(0);
        } elseif ($hour >= 14 && $hour < 22) {
            // Shift 2 : 14:00 → 22:00
            $start = $now->copy()->setHour(14)->setMinute(0)->setSecond(0);
            $end = $now->copy()->setHour(22)->setMinute(0)->setSecond(0);
        } else {
            // Shift 3 : 22:00 → 06:00 du lendemain
            if ($hour >= 22) {
                $start = $now->copy()->setHour(22)->setMinute(0)->setSecond(0);
                $end = $now->copy()->addDay()->setHour(6)->setMinute(0)->setSecond(0);
            } else {
                // Heure entre 00:00 et 05:59 (shift 3 du jour précédent)
                $start = $now->copy()->subDay()->setHour(22)->setMinute(0)->setSecond(0);
                $end = $now->copy()->setHour(6)->setMinute(0)->setSecond(0);
            }
        }

        // Récupérer les chargements pour le shift
        $chargements = Chargement::with(['four', 'details.famille', 'wagon'])
            ->where('id_user', $user->id_user)
            ->whereBetween('datetime_chargement', [$start, $end])
            ->orderBy('datetime_chargement', 'desc')
            ->get();

        // Calculer les totaux
        $totalPieces = $chargements->sum(function ($c) {
            return $c->details->sum('quantite');
        });
        $chargementCount = $chargements->count();

        // Stocker les totaux dans la session
        session([
            'total_pieces' => $totalPieces,
            'chargement_count' => $chargementCount
        ]);

        return response()->json($chargements);
    }



    public function calculateTrieursNeeded2()
    {
        $startFromWagon = request()->input('start_from_wagon');
        $idFour = request()->input('id_four');
        $limit = request()->input('limit');

        $query = Chargement::with(['wagon', 'four', 'details.famille'])
            ->where('id_four', $idFour)
            ->whereIn('statut', ['en attente', 'en cuisson', 'prêt à sortir', 'sorti'])
            ->orderBy('datetime_sortieEstime', 'asc');

        if ($startFromWagon) {
            // Trouver le dernier chargement avec ce numéro de wagon
            $lastWagon = Chargement::whereHas('wagon', function ($q) use ($startFromWagon) {
                $q->where('num_wagon', $startFromWagon);
            })
                ->orderBy('datetime_sortieEstime', 'desc')
                ->first();

            if ($lastWagon) {
                // Filtrer les chargements après ce wagon
                $query->where('datetime_sortieEstime', '>=', $lastWagon->datetime_sortieEstime);
            }
        }

        if ($limit) {
            $query->limit($limit);
        }

        $chargements = $query->get();

        // Formatage des données pour le frontend
        $formattedWagons = $chargements->map(function ($chargement) {
            return [
                'id_wagon' => $chargement->wagon->id_wagon,
                'wagon_num' => $chargement->wagon->num_wagon ?? 'N/A',
                'four_num' => $chargement->four->num_four ?? 'N/A',
                'heure_sortie' => $chargement->datetime_sortieEstime
                    ? Carbon::parse($chargement->datetime_sortieEstime)->format('H:i')
                    : 'N/A',
                'statut' => $chargement->statut
            ];
        });

        $fourData = $this->calculateForFour($idFour, $chargements);

        return response()->json([
            'f3' => $idFour == 1 ? $fourData : null,
            'f4' => $idFour == 2 ? $fourData : null,
            'wagons' => $formattedWagons
        ]);
    }
    public function getActiveByFour()
    {
        try {
            // Récupérer les chargements actifs pour le four 3
            $f3 = Chargement::with(['wagon', 'four'])
                ->where('id_four', 6)
                ->whereIn('statut', ['en attente', 'en cuisson', 'prêt à sortir'])
                ->orderBy('datetime_sortieEstime', 'asc')
                ->get()
                ->map(function ($chargement) {
                    return [
                        'id' => $chargement->id,
                        'wagon_num' => $chargement->wagon->num_wagon ?? 'N/A',
                        'statut' => $chargement->statut,
                        'heure_sortie' => $chargement->datetime_sortieEstime
                            ? Carbon::parse($chargement->datetime_sortieEstime)->format('H:i')
                            : 'N/A'
                    ];
                });

            // Récupérer les chargements actifs pour le four 4
            $f4 = Chargement::with(['wagon', 'four'])
                ->where('id_four', 2)
                ->whereIn('statut', ['en attente', 'en cuisson', 'prêt à sortir'])
                ->orderBy('datetime_sortieEstime', 'asc')
                ->get()
                ->map(function ($chargement) {
                    return [
                        'id' => $chargement->id,
                        'wagon_num' => $chargement->wagon->num_wagon ?? 'N/A',
                        'statut' => $chargement->statut,
                        'heure_sortie' => $chargement->datetime_sortieEstime
                            ? Carbon::parse($chargement->datetime_sortieEstime)->format('H:i')
                            : 'N/A'
                    ];
                });

            return response()->json([
                'success' => true,
                'f3' => $f3,
                'f4' => $f4
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des données',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function getLast30Wagons()
    {
        try {
            $chargements = Chargement::with(['wagon', 'four', 'details.famille'])
                ->orderBy('datetime_chargement', 'desc')
                ->take(30)
                ->get()
                ->map(function ($chargement) {
                    return [
                        'Id_chargement' => $chargement->id,
                        'Wagon_num' => $chargement->wagon->num_wagon ?? 'N/A', // Changé de numero_wagon à num_wagon
                        'Wagon_type' => $chargement->wagon->type_wagon ?? 'N/A',
                        'Total' => $chargement->details->sum('quantite'),
                        'heure_sortie_estimee' => $chargement->datetime_sortieEstime
                            ? Carbon::parse($chargement->datetime_sortieEstime)->format('Y-m-d H:i:s')
                            : 'N/A',
                        'Four' => $chargement->four->num_four ?? 'N/A', // Changé de nom_four à num_four
                        'statut' => $chargement->statut,
                    ];
                });

            return response()->json($chargements);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des wagons',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function getTotalPiecesByDay()
    {
        try {
            // Obtenir la date d'il y a 7 jours
            $oneWeekAgo = Carbon::now()->subDays(6)->startOfDay();

            $results = DetailChargement::join('chargements', 'detail_chargements.id_chargement', '=', 'chargements.id')
                ->select(
                    DB::raw('DATEPART(WEEKDAY, chargements.datetime_chargement) as day_index'),
                    DB::raw("FORMAT(chargements.datetime_chargement, 'dddd') as day_name"),
                    DB::raw('SUM(detail_chargements.quantite) as pieces')
                )
                ->where('chargements.datetime_chargement', '>=', $oneWeekAgo)
                ->whereNotNull('chargements.datetime_chargement')
                ->groupBy(
                    DB::raw('DATEPART(WEEKDAY, chargements.datetime_chargement)'),
                    DB::raw("FORMAT(chargements.datetime_chargement, 'dddd')")
                )
                ->orderBy(DB::raw('DATEPART(WEEKDAY, chargements.datetime_chargement)'))
                ->get();
            /*$results = DetailChargement::join('chargements', 'detail_chargements.id_chargement', '=', 'chargements.id')
            ->select(
                DB::raw('DAYOFWEEK(chargements.datetime_chargement) as day_index'),
                DB::raw('DAYNAME(chargements.datetime_chargement) as day_name'),
                DB::raw('SUM(detail_chargements.quantite) as pieces')
            )
            ->where('chargements.datetime_chargement', '>=', $oneWeekAgo)
            ->whereNotNull('chargements.datetime_chargement')
            ->groupBy('day_index', 'day_name')
            ->orderBy('day_index')
            ->get();*/

            // Mapper les jours de la semaine dans l'ordre
            $daysOrder = [
                'Monday' => 1,
                'Tuesday' => 2,
                'Wednesday' => 3,
                'Thursday' => 4,
                'Friday' => 5,
                'Saturday' => 6,
                'Sunday' => 7
            ];

            // Initialiser un tableau avec tous les jours à 0
            $formattedData = collect($daysOrder)->map(function ($order, $day) {
                return [
                    'day' => $day,
                    'pieces' => 0
                ];
            })->values()->all();

            // Remplir avec les données de la base
            foreach ($results as $result) {
                $dayName = $result->day_name;
                if (isset($daysOrder[$dayName])) {
                    $formattedData[$daysOrder[$dayName] - 1] = [
                        'day' => $dayName,
                        'pieces' => (int)$result->pieces
                    ];
                }
            }

            return response()->json($formattedData);
        } catch (\Exception $e) {
            Log::error('Error in getTotalPiecesByDay: ' . $e->getMessage());

            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Get active chargements for both furnaces with caching
     */
    public function getActiveChargementsWithCache()
    {
        try {
            $cacheKey = 'active_chargements_cache';
            $minutes = 5; // Cache for 5 minutes

            // Try to get cached data
            if (Cache::has($cacheKey)) {
                return response()->json(Cache::get($cacheKey));
            }

            // Get fresh data
            $f3 = Chargement::with(['wagon', 'four'])
                ->where('id_four', 6)
                ->whereIn('statut', ['en attente', 'en cuisson', 'prêt à sortir'])
                ->orderBy('datetime_sortieEstime', 'asc')
                ->get()
                ->map(function ($chargement) {
                    return [
                        'id_chargement' => $chargement->id,
                        'num_wag' => $chargement->wagon->num_wagon ?? 'N/A',
                        'Statut' => $chargement->statut,
                        'debut_cuisson' => $chargement->datetime_chargement,
                        'FinCuissonEstimee' => $chargement->datetime_sortieEstime,
                        'username' => $chargement->user->name ?? 'Unknown'
                    ];
                });

            $f4 = Chargement::with(['wagon', 'four'])
                ->where('id_four', 2)
                ->whereIn('statut', ['en attente', 'en cuisson', 'prêt à sortir'])
                ->orderBy('datetime_sortieEstime', 'asc')
                ->get()
                ->map(function ($chargement) {
                    return [
                        'id_chargement' => $chargement->id,
                        'num_wag' => $chargement->wagon->num_wagon ?? 'N/A',
                        'Statut' => $chargement->statut,
                        'debut_cuisson' => $chargement->datetime_chargement,
                        'FinCuissonEstimee' => $chargement->datetime_sortieEstime,
                        'username' => $chargement->user->name ?? 'Unknown'
                    ];
                });

            $data = [
                'four3' => $f3,
                'four4' => $f4,
                'timestamp' => now()->toDateTimeString()
            ];

            // Cache the data
            Cache::put($cacheKey, $data, $minutes);

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get details for a specific chargement
     */
    // Dans votre contrôleur API qui gère chargement-details
    public function getChargementDetails($id_chargement)
    {
        $chargement = Chargement::with(['user', 'details.famille'])->find($id_chargement);

        if (!$chargement) {
            return response()->json(['error' => 'Chargement not found'], 404);
        }

        return response()->json([
            'details' => $chargement->details->map(function ($detail) {
                return [
                    'nom_famille' => $detail->famille->nom_famille,
                    'quantite' => $detail->quantite
                ];
            }),
            'username' => $chargement->user->nom . ' ' . $chargement->user->prenom, // ou juste ->matricule selon ce que vous voulez afficher
            'debut_cuisson' => $chargement->datetime_chargement,
            'FinCuissonEstimee' => $chargement->datetime_sortieEstime
        ]);
    }
    /**
     * Get detailed information for a specific chargement including wagon content
     */
    public function getChargementDetailsWithWagon($id)
    {
        try {
            $chargement = Chargement::with([
                'wagon',
                'four',
                'details.famille',
                'user'
            ])->findOrFail($id);

            $details = $chargement->details->map(function ($detail) {
                return [
                    'nom_famille' => $detail->famille->nom_famille ?? 'N/A',
                    'quantite' => $detail->quantite
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'id_chargement' => $chargement->id,
                    'wagon_num' => $chargement->wagon->num_wagon ?? 'N/A',
                    'wagon_type' => $chargement->wagon->type_wagon ?? 'N/A',
                    'four_num' => $chargement->four->num_four ?? 'N/A',
                    'total_pieces' => $chargement->details->sum('quantite'),
                    'heure_sortie_estimee' => $chargement->datetime_sortieEstime
                        ? Carbon::parse($chargement->datetime_sortieEstime)->format('Y-m-d H:i:s')
                        : 'N/A',
                    'datetime_chargement' => $chargement->datetime_chargement,
                    'statut' => $chargement->statut,
                    'details' => $details,
                    'user' => [
                        'nom' => $chargement->user->nom ?? 'Unknown',
                        'prenom' => $chargement->user->prenom ?? ''
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Chargement not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }
    public function getHistorique(Request $request)
    {
        try {
            $user = Auth::user();
            $perPage = $request->input('per_page', 50);
            $search = $request->input('search', '');
            $dateFrom = $request->input('date_from');
            $dateTo = $request->input('date_to');
            $datetime_sortieFrom = $request->input('datetime_sortie_from');
            $datetime_sortieTo = $request->input('datetime_sortie_to');
            // Filtres par colonne
            $wagon = $request->input('wagon');
            $four = $request->input('four');
            $pieces = $request->input('pieces'); // nombre total ou quantité d'une pièce
            $statut = $request->input('statut');
            // $datetime_sortieEstime = $request->input('datetime_sortieEstime');
            $matricule = $request->input('matricule');
            $shift = $request->input('shift'); // 1, 2 ou 3
            // Tri dynamique
            $sortField = $request->input('sort_field'); // ex: 'total_pieces'
            $sortOrder = $request->input('sort_order', 'desc'); // 'asc' ou 'desc', par défaut 'desc'

            $query = Chargement::with(['user', 'wagon', 'four', 'details.famille'])
                ->withSum('details as total_pieces', 'quantite'); // <-- calcule total des pièces
            //->orderBy('chargements.datetime_chargement', 'desc')

            // Filtre shift
            if ($shift) {
                $query->whereRaw('(CASE 
                WHEN CAST(chargements.datetime_chargement AS TIME) BETWEEN \'06:00:00\' AND \'13:59:59\' THEN 1
                WHEN CAST(chargements.datetime_chargement AS TIME) BETWEEN \'14:00:00\' AND \'21:59:59\' THEN 2
                ELSE 3
            END) = ?', [$shift]);
            }

            $query->selectRaw('chargements.*,
            CASE 
                WHEN CAST(chargements.datetime_chargement AS TIME) BETWEEN \'06:00:00\' AND \'13:59:59\' THEN 1
                WHEN CAST(chargements.datetime_chargement AS TIME) BETWEEN \'14:00:00\' AND \'21:59:59\' THEN 2
                ELSE 3
            END as shift
        ');

            // Filtre par utilisateur si ce n'est pas un admin
            // Vérifier si l'utilisateur est admin (remplacer selon votre logique d'admin)
            //if (!($user->role === 'admin')) { // Remplacez 'role' par le champ réel de votre modèle User
            //  $query->where('id_user', $user->id_user);
            //}

            // Filtre de recherche
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('wagon', function ($q) use ($search) {
                        $q->where('num_wagon', 'like', "%{$search}%");
                    })
                        ->orWhereHas('four', function ($q) use ($search) {
                            $q->where('num_four', 'like', "%{$search}%");
                        })
                        ->orWhere('statut', 'like', "%{$search}%");
                });
            }

            // Filtre par date
            if ($dateFrom) {
                $query->whereDate('datetime_chargement', '>=', $dateFrom);
            }
            if ($dateTo) {
                $query->whereDate('datetime_chargement', '<=', $dateTo);
            }
            // Filtres par colonne
            if ($wagon) {
                $query->whereHas('wagon', fn($q) => $q->where('num_wagon', 'like', "%{$wagon}%"));
            }
            if ($four) {
                $query->whereHas('four', fn($q) => $q->where('num_four', 'like', "%{$four}%"));
            }
            if ($statut) {
                $query->where('statut', 'like', "%{$statut}%");
            }
            if ($matricule) {
                $query->whereHas(
                    'user',
                    fn($q) =>
                    $q->where('matricule', 'like', "%{$matricule}%")
                    //  ->orWhere('prenom', 'like', "%{$utilisateur}%")
                );
            }
            if ($pieces) {
                $query->whereHas('details', function ($q) use ($pieces) {
                    $q->select(DB::raw('SUM(quantite) as total'))
                        ->groupBy('id_chargement')
                        ->havingRaw('SUM(quantite) = ?', [$pieces]);
                });
            }
            // Tri dynamique : si sortField fourni, on trie, sinon ordre par défaut
            if ($sortField) {
                $query->orderBy($sortField, $sortOrder);
            } else {
                $query->orderBy('chargements.datetime_chargement', 'desc');
            }

            if ($request->input('datetime_sortieEstime')) {
                $query->whereDate('datetime_sortieEstime', '=', $request->input('datetime_sortieEstime'));
            }
            if ($request->input('datetime_chargement')) {
                $query->whereDate('datetime_chargement', '=', $request->input('datetime_chargement'));
            }

            $chargements = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $chargements,
                'total' => $chargements->total(),
                'current_page' => $chargements->currentPage(),
                'per_page' => $chargements->perPage(),
                'last_page' => $chargements->lastPage()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'historique',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function getPopupDetails($id)
    {
        try {
            $chargement = Chargement::with([
                'wagon',
                'four',
                'details.famille',
                'user'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id_chargement' => $chargement->id,
                    'wagon_num' => $chargement->wagon->num_wagon ?? 'N/A',
                    'wagon_type' => $chargement->wagon->type_wagon ?? 'N/A',
                    'four_num' => $chargement->four->num_four ?? 'N/A',
                    'total_pieces' => $chargement->details->sum('quantite'),
                    'heure_sortie_estimee' => $chargement->datetime_sortieEstime,
                    //? Carbon::parse($chargement->datetime_sortieEstime)->format('Y-m-d H:i:s')
                    //: 'N/A',
                    'datetime_chargement' => $chargement->datetime_chargement,
                    'statut' => $chargement->statut,
                    'details' => $chargement->details->map(function ($detail) {
                        return [
                            'nom_famille' => $detail->famille->nom_famille ?? 'N/A',
                            'quantite' => $detail->quantite
                        ];
                    }),
                    'user' => [
                        'matricule' => $chargement->user->matricule,
                        'nom' => $chargement->user->nom ?? 'Unknown',
                        'prenom' => $chargement->user->prenom ?? ''
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Chargement not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }
    public function getProchainsChargements(Request $request)
    {
        try {
            $now = now();
            $currentHour = $now->hour;

            // Définir les intervalles selon la nouvelle logique
            if ($currentHour >= 5 && $currentHour < 14) {
                $start = $now->copy()->setTime(6, 0, 0);
                $end = $now->copy()->setTime(14, 0, 0);
            } elseif ($currentHour >= 14 && $currentHour < 22) {
                $start = $now->copy()->setTime(14, 0, 0);
                $end = $now->copy()->setTime(22, 0, 0);
            } else {
                if ($currentHour >= 22) {
                    $start = $now->copy()->setTime(22, 0, 0);
                    $end = $now->copy()->addDay()->setTime(6, 0, 0);
                } else {
                    $start = $now->copy()->subDay()->setTime(22, 0, 0);
                    $end = $now->copy()->setTime(6, 0, 0);
                }
            }

            // Récupérer les chargements qui doivent sortir pendant la plage horaire
            $chargements = Chargement::with(['wagon', 'four', 'details'])
                ->whereIn('statut', ['en attente', 'en cuisson', 'prêt à sortir', 'sorti'])
                ->whereBetween('datetime_sortieEstime', [$start, $end])
                ->orderBy('datetime_sortieEstime', 'asc')
                ->get();

            // Formatage des données
            $formatted = $chargements->map(function ($chargement) {
                return [
                    'id' => $chargement->id,
                    'wagon_num' => $chargement->wagon->num_wagon ?? 'N/A',
                    'wagon_type' => $chargement->wagon->type_wagon ?? 'N/A',
                    'four_num' => $chargement->four->num_four ?? 'N/A',
                    'total_pieces' => $chargement->details->sum('quantite'),
                    'heure_sortie' => $chargement->datetime_sortieEstime
                        ? Carbon::parse($chargement->datetime_sortieEstime)->format('H:i')
                        : 'N/A',
                    'statut' => $chargement->statut,
                    'sorti' => $chargement->statut === 'sorti'
                ];
            });

            return response()->json($formatted);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function detailsChargement($id)
    {
        $user = Auth::user();

        $chargement = Chargement::with(['four', 'user', 'wagon', 'details.famille'])
            ->where('id_user', $user->id_user)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json($chargement);
    }

    public function getChargementsActifs()
    {
        $now = now();
        $currentHour = $now->hour;
        $startFromWagon = request()->input('start_from_wagon');
        $limit = request()->input('limit');

        // Définir les intervalles selon la nouvelle logique
        if ($currentHour >= 6 && $currentHour < 14) {
            $start = $now->copy()->setTime(6, 0, 0);
            $end = $now->copy()->setTime(14, 0, 0);
        } elseif ($currentHour >= 14 && $currentHour < 22) {
            $start = $now->copy()->setTime(14, 0, 0);
            $end = $now->copy()->setTime(22, 0, 0);
        } else {
            if ($currentHour >= 22) {
                $start = $now->copy()->setTime(22, 0, 0);
                $end = $now->copy()->addDay()->setTime(6, 0, 0);
            } else {
                $start = $now->copy()->subDay()->setTime(22, 0, 0);
                $end = $now->copy()->setTime(6, 0, 0);
            }
        }

        $query = Chargement::with(['wagon', 'four', 'details'])
            ->whereIn('statut', ['en attente', 'en cuisson', 'prêt à sortir', 'sorti'])
            ->orderBy('datetime_sortieEstime', 'asc');

        if ($startFromWagon) {
            $lastWagonChargement = Chargement::whereHas('wagon', function ($q) use ($startFromWagon) {
                $q->where('num_wagon', $startFromWagon);
            })
                ->orderBy('datetime_sortieEstime', 'desc')
                ->first();

            if ($lastWagonChargement) {
                $query->where('datetime_sortieEstime', '>=', $lastWagonChargement->datetime_sortieEstime);
            }
        } else {
            $query->whereBetween('datetime_sortieEstime', [$start, $end]);
        }

        if (request()->has('id_four')) {
            $id_four = request()->input('id_four');
            $query->where('id_four', $id_four);

            if ($limit) {
                $query->limit($limit);
            } else {
                if ($id_four == 6) {
                    $query->limit(30);
                } elseif ($id_four == 7) {
                    $query->limit(16);
                }
            }
        }

        $chargements = $query->get()
            ->map(function ($chargement) {
                return [
                    'id' => $chargement->id,
                    'wagon_num' => $chargement->wagon->num_wagon ?? 'N/A',
                    'wagon_type' => $chargement->wagon->type_wagon ?? 'N/A',
                    'four_num' => $chargement->four->num_four ?? 'N/A',
                    'total_pieces' => $chargement->details->sum('quantite'),
                    'heure_sortie' => $chargement->datetime_sortieEstime
                        ? Carbon::parse($chargement->datetime_sortieEstime)->format('H:i')
                        : 'N/A',
                    'statut' => $chargement->statut,
                    //'sorti' => $chargement->statut === 'sorti'
                ];
            });

        return response()->json([
            'chargements' => $chargements,
            'current_interval' => [
                'start' => $start->format('H:i'),
                'end' => $end->format('H:i')
            ],
            'total_count' => $chargements->count()
        ]);
    }

    public function calculateTrieursNeeded()
    {
        $startFromWagon = request()->input('start_from_wagon');
        $idFour = request()->input('id_four');
        $limit = request()->input('limit');

        $query = Chargement::with(['wagon', 'four', 'details.famille'])
            ->where('id_four', $idFour)
            ->whereIn('statut', ['en attente', 'en cuisson', 'prêt à sortir', 'sorti'])
            ->orderBy('datetime_sortieEstime', 'asc');

        if ($startFromWagon) {
            $lastWagon = Chargement::whereHas('wagon', function ($q) use ($startFromWagon) {
                $q->where('num_wagon', $startFromWagon);
            })
                ->orderBy('datetime_sortieEstime', 'desc')
                ->first();

            if ($lastWagon) {
                $query->where('datetime_sortieEstime', '>=', $lastWagon->datetime_sortieEstime);
            }
        } else {
            $now = now();
            $currentHour = $now->hour;

            if ($currentHour >= 6 && $currentHour < 14) {
                $start = $now->copy()->setTime(6, 0, 0);
                $end = $now->copy()->setTime(14, 0, 0);
            } elseif ($currentHour >= 14 && $currentHour < 22) {
                $start = $now->copy()->setTime(14, 0, 0);
                $end = $now->copy()->setTime(22, 0, 0);
            } else {
                if ($currentHour >= 22) {
                    $start = $now->copy()->setTime(22, 0, 0);
                    $end = $now->copy()->addDay()->setTime(6, 0, 0);
                } else {
                    $start = $now->copy()->subDay()->setTime(22, 0, 0);
                    $end = $now->copy()->setTime(6, 0, 0);
                }
            }

            $query->whereBetween('datetime_sortieEstime', [$start, $end]);
        }

        if ($limit) {
            $query->limit($limit);
        }

        $chargements = $query->get();

        $fourData = $this->calculateForFour($idFour, $chargements);

        return response()->json([
            'f3' => $idFour == 6 ? $fourData : null,
            'f4' => $idFour == 7 ? $fourData : null,
            'wagons' => $chargements->map(function ($chargement) {
                return [
                    'id' => $chargement->id,
                    'wagon_num' => $chargement->wagon->num_wagon ?? 'N/A',
                    'four_num' => $chargement->four->num_four ?? 'N/A',
                    'heure_sortie' => $chargement->datetime_sortieEstime
                        ? Carbon::parse($chargement->datetime_sortieEstime)->format('H:i')
                        : 'N/A',
                    'statut' => $chargement->statut
                ];
            })
        ]);
    }

    private function calculateForFour($idFour, $chargements)
    {
        $famillesData = [];
        $totalPieces = 0;

        foreach ($chargements as $chargement) {
            foreach ($chargement->details as $detail) {
                $idFamille = $detail->id_famille;
                $quantite = $detail->quantite;
                $famille = $detail->famille;
                // if (in_array(strtolower($famille->nom_famille), ['balaste', 'couvercles'])) {
                //     continue; // saute cette famille
                // }
                if (!isset($famillesData[$idFamille])) {
                    $famillesData[$idFamille] = [
                        'id_famille' => $idFamille,
                        'nom_famille' => $famille->nom_famille,
                        'total_pieces' => 0,
                        'valeur_trieur' => $famille->valeur_trieur ?? 1,
                        'trieurs_needed' => 0
                    ];
                }

                $famillesData[$idFamille]['total_pieces'] += $quantite;
                //  $totalPieces += $quantite; 
                //  ne pas compter balaste et couvercles dans le total global
                if (!in_array(strtolower($famille->nom_famille), ['balaste', 'couvercles'])) {
                    $totalPieces += $quantite;
                }
            }
        }

        $totalTrieursNeeded = 0;
        foreach ($famillesData as &$famille) {
            $trieursNeeded = $famille['total_pieces'] * (1 / $famille['valeur_trieur']);
            $famille['trieurs_needed'] = round($trieursNeeded, 2);
            $totalTrieursNeeded += $trieursNeeded;
        }

        return [
            'total_pieces' => $totalPieces,
            'total_trieurs_needed' => round($totalTrieursNeeded, 2),
            'familles' => array_values($famillesData)
        ];
    }

    public function calculateDensity()
    {
        $now = now();
        $currentHour = $now->hour;

        if ($currentHour >= 6 && $currentHour < 14) {
            $start = $now->copy()->setTime(6, 0, 0);
            $end = $now->copy()->setTime(14, 0, 0);
            $intervalName = 'Matin';
        } elseif ($currentHour >= 14 && $currentHour < 22) {
            $start = $now->copy()->setTime(14, 0, 0);
            $end = $now->copy()->setTime(22, 0, 0);
            $intervalName = 'Après-midi';
        } else {
            if ($currentHour >= 22) {
                $start = $now->copy()->setTime(22, 0, 0);
                $end = $now->copy()->addDay()->setTime(6, 0, 0);
            } else {
                $start = $now->copy()->subDay()->setTime(22, 0, 0);
                $end = $now->copy()->setTime(6, 0, 0);
            }
            $intervalName = 'Nuit';
        }

        // Calcul pour F3
        $f3Chargements = Chargement::with(['details' => function ($query) {
            $query->whereHas('famille', function ($q) {
                $q->where('nom_famille', 'like', '%couvercle%');
                // ->where('nom_famille', 'not like', '%Balaste%');
            });
        }])
            ->where('id_four', 6)
            ->whereIn('statut', ['en attente', 'en cuisson', 'prêt à sortir', 'sorti'])
            ->whereBetween('datetime_sortieEstime', [$start, $end])
            ->get();

        $f3TotalPieces = $f3Chargements->sum(function ($chargement) {
            return $chargement->details->sum('quantite');
        });
        // $f3Count = $f3Chargements->count();
        $f3Density = $f3TotalPieces / 30;

        // Calcul pour F4
        $f4Chargements = Chargement::with(['details' => function ($query) {
            $query->whereHas('famille', function ($q) {
                $q->where('nom_famille', 'like', '%couvercle%');
                // ->where('nom_famille', 'not like', '%Balaste%');
            });
        }])
            ->where('id_four', 7)
            ->whereIn('statut', ['en attente', 'en cuisson', 'prêt à sortir', 'sorti'])
            ->whereBetween('datetime_sortieEstime', [$start, $end])
            ->get();

        $f4TotalPieces = $f4Chargements->sum(function ($chargement) {
            return $chargement->details->sum('quantite');
        });
        // $f4Count = $f4Chargements->count();
        $f4Density = $f4TotalPieces / 16;

        return response()->json([
            'global_density' => round($f3Density + $f4Density, 1),
            'f3' => [
                'total_pieces' => $f3TotalPieces,
                'density' => round($f3Density, 1)
            ],
            'f4' => [
                'total_pieces' => $f4TotalPieces,
                'density' => round($f4Density, 1)
            ],
            'interval' => [
                'start' => $start->format('H:i'),
                'end' => $end->format('H:i'),
                'name' => $intervalName
            ]
        ]);
    }

    public function getLastChargementByWagon($wagonNum)
    {
        try {
            $chargement = Chargement::with(['wagon', 'four'])
                ->whereHas('wagon', function ($q) use ($wagonNum) {
                    $q->where('num_wagon', $wagonNum);
                })
                ->orderBy('datetime_sortieEstime', 'desc')
                ->first();

            if (!$chargement) {
                return response()->json(['message' => 'Aucun chargement trouvé pour ce wagon'], 404);
            }

            return response()->json([
                'wagon_num' => $chargement->wagon->num_wagon ?? 'N/A',
                'four_num' => $chargement->four->num_four ?? 'N/A',
                'heure_sortie' => $chargement->datetime_sortieEstime
                    ? Carbon::parse($chargement->datetime_sortieEstime)->format('H:i')
                    : 'N/A',
                'statut' => $chargement->statut
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getChargementsActifsdash()
    {
        $now = now();
        $currentHour = $now->hour;

        if ($currentHour >= 6 && $currentHour < 14) {
            $start = $now->copy()->setTime(6, 0, 0);
            $end = $now->copy()->setTime(14, 0, 0);
        } elseif ($currentHour >= 14 && $currentHour < 22) {
            $start = $now->copy()->setTime(14, 0, 0);
            $end = $now->copy()->setTime(22, 0, 0);
        } else {
            if ($currentHour >= 22) {
                $start = $now->copy()->setTime(22, 0, 0);
                $end = $now->copy()->addDay()->setTime(6, 0, 0);
            } else {
                $start = $now->copy()->subDay()->setTime(22, 0, 0);
                $end = $now->copy()->setTime(6, 0, 0);
            }
        }

        $query = Chargement::with(['wagon', 'four', 'details'])
            ->whereIn('statut', ['en attente', 'en cuisson', 'prêt à sortir', 'sorti'])
            ->whereBetween('datetime_sortieEstime', [$start, $end])
            ->orderBy('datetime_sortieEstime', 'asc');

        if (request()->has('id_four')) {
            $id_four = request()->input('id_four');
            $query->where('id_four', $id_four);

            if ($id_four == 6) {
                $query->limit(30);
            } elseif ($id_four == 7) {
                $query->limit(16);
            }
        }

        $chargements = $query->get();

        return response()->json([
            'chargements' => $chargements,
            'current_interval' => [
                'start' => $start->format('H:i'),
                'end' => $end->format('H:i')
            ]
        ]);
    }

    public function calculateTrieursNeededdash()
    {
        $now = now();
        $currentHour = $now->hour;

        if ($currentHour >= 6 && $currentHour < 14) {
            $start = $now->copy()->setTime(6, 0, 0);
            $end = $now->copy()->setTime(14, 0, 0);
            $intervalHours = 8;
        } elseif ($currentHour >= 14 && $currentHour < 22) {
            $start = $now->copy()->setTime(14, 0, 0);
            $end = $now->copy()->setTime(22, 0, 0);
            $intervalHours = 8;
        } else {
            if ($currentHour >= 22) {
                $start = $now->copy()->setTime(22, 0, 0);
                $end = $now->copy()->addDay()->setTime(6, 0, 0);
                $intervalHours = 8;
            } else {
                $start = $now->copy()->subDay()->setTime(22, 0, 0);
                $end = $now->copy()->setTime(6, 0, 0);
                $intervalHours = 8;
            }
        }

        $four3Data = $this->calculateForFourdash(1, $start, $end, $intervalHours);
        $four4Data = $this->calculateForFourdash(2, $start, $end, $intervalHours);

        return response()->json([
            'f3' => $four3Data,
            'f4' => $four4Data,
            'current_interval' => [
                'start' => $start->format('H:i'),
                'end' => $end->format('H:i')
            ]
        ]);
    }

    private function calculateForFourdash($id_four, $start, $end, $intervalHours)
    {
        $chargements = Chargement::with(['details.famille'])
            ->where('id_four', $id_four)
            ->whereIn('statut', ['en attente', 'en cuisson', 'prêt à sortir', 'sorti'])
            ->whereBetween('datetime_sortieEstime', [$start, $end])
            ->get();

        $famillesData = [];
        $totalPieces = 0;

        foreach ($chargements as $chargement) {
            foreach ($chargement->details as $detail) {
                $famille = $detail->famille;
                $id_famille = $detail->id_famille;
                $quantite = $detail->quantite;

                if (!isset($famillesData[$id_famille])) {
                    $famillesData[$id_famille] = [
                        'nom_famille' => $famille->nom_famille,
                        'total_pieces' => 0,
                        'valeur_trieur' => $famille->valeur_trieur
                    ];
                }

                $famillesData[$id_famille]['total_pieces'] += $quantite;
                $totalPieces += $quantite;
            }
        }

        $totalTrieursNeeded = 0;
        foreach ($famillesData as &$famille) {
            $trieursNeeded = $famille['total_pieces'] * (1 / $famille['valeur_trieur']);
            $famille['trieurs_needed'] = round($trieursNeeded, 2);
            $totalTrieursNeeded += $trieursNeeded;
        }

        return [
            'interval_hours' => $intervalHours,
            'total_pieces' => $totalPieces,
            'total_trieurs_needed' => round($totalTrieursNeeded, 2),
            'familles' => array_values($famillesData)
        ];
    }
    public function getTotalPiecesByShift()
    {
        try {
            $now = Carbon::now()->addDay(-1);
            $shift3start = $now->copy()->setTime(22, 0, 0);

            // Si l'heure actuelle est avant 5h du matin, on considère que le "jour" commence à 5h de la veille
            /*if ($now->hour < 6) {
            $today5am = $now->copy()->subDay()->setTime(6, 0, 0);
        }*/

            $shift3End = $shift3start->copy()->addDay()->setTime(6, 0, 0); // 22h-5h du lendemain
            $shift1End = $shift3End->copy()->addHours(8); // 6h-14h
            $shift2End = $shift1End->copy()->addHours(8); // 14h-22h

            /*$today10pm = $now->copy()->setTime(22, 0, 0);
        $shift3finish = $today10pm->copy()->addDay()->setTime(6, 0, 0); // 22h-6h du lendemain
        $shift1finish = $shift3finish->copy()->addHours(8); // 6h-14h
        $shift2finish = $shift1finish->copy()->addHours(8); //*/
            $results = DB::table('detail_chargements as d')
                ->join('chargements as c', 'd.id_chargement', '=', 'c.id')
                ->select(
                    DB::raw("
                    CASE
                        WHEN c.datetime_chargement BETWEEN '{$shift3End->format('Y-m-d H:i:s')}' AND '{$shift1End->format('Y-m-d H:i:s')}' THEN 'shift1'
                        WHEN c.datetime_chargement BETWEEN '{$shift1End->format('Y-m-d H:i:s')}' AND '{$shift2End->format('Y-m-d H:i:s')}' THEN 'shift2'
                        WHEN c.datetime_chargement BETWEEN '{$shift3start->format('Y-m-d H:i:s')}' AND '{$shift3End->format('Y-m-d H:i:s')}' THEN 'shift3'
                        ELSE 'other'
                    END AS shift_label
                "),
                    DB::raw('SUM(d.quantite) as total')
                )
                ->where('c.datetime_chargement', '>=', $shift3start)
                ->where('c.datetime_chargement', '<=', $shift2End)
                ->groupBy(DB::raw("
                CASE
                    WHEN c.datetime_chargement BETWEEN '{$shift3End->format('Y-m-d H:i:s')}' AND '{$shift1End->format('Y-m-d H:i:s')}' THEN 'shift1'
                    WHEN c.datetime_chargement BETWEEN '{$shift1End->format('Y-m-d H:i:s')}' AND '{$shift2End->format('Y-m-d H:i:s')}' THEN 'shift2'
                    WHEN c.datetime_chargement BETWEEN '{$shift3start->format('Y-m-d H:i:s')}' AND '{$shift3End->format('Y-m-d H:i:s')}' THEN 'shift3'
                    ELSE 'other'
                END
            "))
                ->pluck('total', 'shift_label');

            // Ensure all shifts exist even if zero
            return response()->json([
                'shift1' => $results['shift1'] ?? 0,
                'shift2' => $results['shift2'] ?? 0,
                'shift3' => $results['shift3'] ?? 0,
                'today5am' => $shift3start->format('Y-m-d H:i:s'),
                'shift3End' => $shift3End->format('Y-m-d H:i:s'),
                'shift1End' => $shift1End->format('Y-m-d H:i:s'),
                'shift2End' => $shift2End->format('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            Log::error('Error in getTotalPiecesByShift: ' . $e->getMessage());
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    public function update(Request $request, Chargement $chargement)
    {
        $validated = $request->validate([
            'id_wagon' => 'required|exists:wagons,id_wagon',
            'id_four'  => 'required|exists:fours,id_four',
            'id_user'  => 'required|exists:users,id_user',
            'datetime_chargement' => 'required|date',
            'statut' => 'required|string',
            'familles' => 'sometimes|array',
            'familles.*.id_famille' => 'required|exists:familles,id_famille',
            'familles.*.quantite' => 'required|integer',
        ]);
        // Validation supplémentaire pour la quantité
        if (isset($validated['familles'])) {
            foreach ($validated['familles'] as $famille) {
                if ($famille['quantite'] <= 0) {
                    return response()->json([
                        'message' => "La quantité pour la famille '{$famille['id_famille']}' doit être supérieure à 0."
                    ], 422);
                }
            }
        }
        // Vérifier doublons dans id_famille
        if (isset($validated['familles'])) {
            $ids = array_column($validated['familles'], 'id_famille');

            if (count($ids) !== count(array_unique($ids))) {
                return response()->json([
                    'message' => "Vous avez ajouté la même famille plusieurs fois."
                ], 422);
            }
        }
        if (isset($validated['familles'])) {

            // Vérifier qu'il y a au moins une famille avec quantité > 0
            $famillesValides = array_filter($validated['familles'], fn($f) => $f['quantite'] > 0);

            if (empty($famillesValides)) {
                return response()->json([
                    'message' => "Vous devez ajouter au moins une famille avec une quantité supérieure à 0."
                ], 422);
            }
            // Met à jour les champs simples
            $chargement->update($validated);

            // --- Recalculer datetime_sortieEstime en fonction de datetime_chargement et du four --- 
            $chargement->datetime_sortieEstime = $this->calculateSortieEstime(
                $chargement->id_four,
                $chargement->datetime_chargement
            );
            $chargement->save();

            // Si familles envoyées, mettre à jour les détails
            if (isset($validated['familles'])) {
                $chargement->details()->delete();
                foreach ($validated['familles'] as $famille) {
                    $chargement->details()->create([
                        'id_famille' => $famille['id_famille'],
                        'quantite' => $famille['quantite'],
                    ]);
                }
            }
            return response()->json([
                'message' => 'Chargement mis à jour avec succès',
                'data' => $chargement->load('details.famille', 'wagon', 'four', 'user')
            ]);
        }
    }
    private function calculateSortieEstime($idFour, $datetimeChargement)
    {
        $chargementTime = Carbon::parse($datetimeChargement);
        // Charger les durées automatiquement depuis la base
        $fours = DB::table('fours')->pluck('duree_cuisson', 'id_four')->toArray();

        // Transformer les durées en format H:i:s si nécessaire
        $durations = [];
        foreach ($fours as $id => $duree) {
            // Si la durée est stockée en secondes
            if (is_numeric($duree)) {
                $hours = floor($duree / 3600); // nombre d’heures
                $minutes = floor(($duree % 3600) / 60); // reste en minutes
                $seconds = $duree % 60;   // reste en secondes
                $durations[$id] = sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
            } else {
                // Sinon on suppose qu’elle est déjà au format H:i:s
                $durations[$id] = $duree;
            }
        }
        // Si le four est reconnu, calculer la sortie
        if (isset($durations[$idFour])) {
            $interval = CarbonInterval::createFromFormat('H:i:s', $durations[$idFour]);
            return $chargementTime->copy()->add($interval);
        }
    }
    public function getWagonsEnAttente()
    {
        try {
            // On récupère tout ce qui est "en attente" 
            $chargementsEnAttente = Chargement::with(['user', 'wagon', 'four', 'details.famille'])
                ->where('statut', 'en attente')
                ->orderBy('datetime_chargement', 'asc')
                ->get();
            //  Récupérer les 10 derniers en cuisson pour chaque four
            $foursIds = Chargement::distinct()->pluck('id_four');
            $chargementsEnCuisson = collect();
            //  Pour chaque four, on récupère les 10 derniers chargements en cuisson
            foreach ($foursIds as $idFour) {
                $last10 = Chargement::with(['user', 'wagon', 'four', 'details.famille'])
                    ->where('statut', 'en cuisson')
                    ->where('id_four', $idFour)
                    ->orderBy('date_entrer', 'desc')
                    ->limit(10)
                    ->get();

                $chargementsEnCuisson = $chargementsEnCuisson->concat($last10);
            }

            //  Fusionner les deux collections
            $chargements = $chargementsEnAttente->merge($chargementsEnCuisson);
            return response()->json([
                'success' => true,
                'data' => $chargements
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des wagons en attente',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function getLastDateEntrer($idFour)
    {
        try {
            $lastChargement = Chargement::where('id_four', $idFour)
                ->whereNotNull('date_entrer')
                ->orderBy('date_entrer', 'desc')
                ->first();

            return response()->json([
                'success' => true,
                'date_entrer' => $lastChargement ? $lastChargement->date_entrer : null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la dernière date d’entrée',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function valider($id, Request $request)
    {
        $chargement = Chargement::find($id);

        if (!$chargement) {
            return response()->json(['message' => 'Chargement non trouvé'], 404);
        }
        // On récupère la date entrée depuis le frontend (champs dans le popup)
        $chargement->date_entrer = $request->date_entrer ?? now();
        // Calcul de la date de sortie si le chargement a un four
        if ($chargement->four && $chargement->date_entrer) {
            $dateEntrer = Carbon::parse($chargement->date_entrer);
            $dureeSecondes = $chargement->four->duree_cuisson; // durée en secondes
            $chargement->datetime_sortieEstime = $dateEntrer->copy()->addSeconds($dureeSecondes);
        }
        // la date du clic => c’est la date de l’action
        $chargement->date_action = now();
        $chargement->statut = 'en cuisson';
        $chargement->save();
        return response()->json([
            'message' => 'Chargement validé avec succès',
            'data' => $chargement
        ]);
    }
}
