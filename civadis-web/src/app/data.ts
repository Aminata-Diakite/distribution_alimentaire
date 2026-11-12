// Données fictives de démonstration (inspirées de civadis-ci.com).
// Plus tard, elles viendront de l'API.
import { Alerte, Incident, InfoRole, LigneRapport, RoleCle, Utilisateur } from './models'

export const SERVICES = [
  'Développement', 'Achats', 'Commercial', 'Bière', 'CivaFrigo',
  'Opérations System U', 'Relations fournisseurs et partenariats', 'Service shipchandler',
]

export const CATEGORIES = ['Infrastructure / Bâtiment', 'Sécurité', 'Informatique', 'Équipement', 'Marchandises']

export const LIEUX = [
  'Cold Central CIVAFRIGO · Quai 1', 'Cold Central CIVAFRIGO · Quai 2', 'Cold Central CIVAFRIGO · Quai 3',
  'Cold Central CIVAFRIGO · Quai 4', 'Cold Central CIVAFRIGO · Chambre froide A',
  'Cold Central CIVAFRIGO · Chambre froide B', 'Super U Zone 4 · Entrée du magasin',
]

export const ROLES: Record<RoleCle, InfoRole> = {
  salarie: { label: 'Salarié', texte: 'Déclarer et suivre ses anomalies' },
  intervenant: { label: 'Intervenant', texte: 'Prendre en charge et résoudre' },
  responsable: { label: 'Responsable de service', texte: 'Qualifier, affecter, clôturer' },
  admin: { label: 'Administrateur', texte: 'Comptes et services' },
  direction: { label: 'Direction', texte: 'Tableaux de bord et rapports' },
}

// Mot de passe de démonstration de tous les comptes (plus tard : géré par l'API)
export const MOT_DE_PASSE_DEMO = 'Civadis2026'
// Libellé du rôle (dans la liste des comptes) -> clé du rôle (dans l'application)
export const ROLE_CLE: Record<string, RoleCle> = {
  'Salarié': 'salarie', 'Intervenant': 'intervenant', 'Responsable de service': 'responsable',
  'Direction': 'direction', 'Administrateur': 'admin',
}

export const UTILISATEURS: Utilisateur[] = [
  { id: 1, nom: 'Kouassi Yao', email: 'kouassi.yao@civadis.ci', role: 'Salarié', service: 'CivaFrigo', actif: true },
  { id: 2, nom: 'Awa Konan', email: 'awa.konan@civadis.ci', role: 'Salarié', service: 'CivaFrigo', actif: true },
  { id: 3, nom: 'Karim Traoré', email: 'karim.traore@civadis.ci', role: 'Intervenant', service: 'Opérations System U', actif: true },
  { id: 4, nom: 'Abdoulaye Koffi', email: 'abdoulaye.koffi@civadis.ci', role: 'Intervenant', service: 'Développement', actif: true },
  { id: 5, nom: 'Salif Dosso', email: 'salif.dosso@civadis.ci', role: 'Intervenant', service: 'Achats', actif: true },
  { id: 6, nom: 'Marc Bamba', email: 'marc.bamba@civadis.ci', role: 'Responsable de service', service: 'CivaFrigo', actif: true },
  { id: 7, nom: 'Nadège N’Guessan', email: 'nadege.nguessan@civadis.ci', role: 'Direction', service: 'Direction', actif: true },
  { id: 8, nom: 'Aïcha Diakité', email: 'aicha.diakite@civadis.ci', role: 'Administrateur', service: 'Développement', actif: true },
  { id: 9, nom: 'Yves Ouattara', email: 'yves.ouattara@civadis.ci', role: 'Salarié', service: 'CivaFrigo', actif: false },
]

const h = (date: string, texte: string) => ({ date, texte })

export const INCIDENTS: Incident[] = [
  { id: 'INC-0148', titre: 'Fuite d’eau près du quai 3', date: '6 nov. 08:42', lieu: LIEUX[2], categorie: CATEGORIES[0],
    description: 'De l’eau coule d’un tuyau au plafond près du quai 3. Le sol est glissant, j’ai posé un panneau de sécurité.',
    auteur: 'Kouassi Yao', statut: 'Nouveau', priorite: null, intervenant: null, service: null,
    pieces: ['photo_1.jpg'],
    historique: [h('6 nov. 08:42', 'Déclaré par Kouassi Yao')] },
  { id: 'INC-0150', titre: 'Câble réseau arraché au quai 2', date: '6 nov. 09:30', lieu: LIEUX[1], categorie: CATEGORIES[2],
    description: 'Le câble réseau du poste de pesée est arraché. Plus de connexion au quai 2.',
    auteur: 'Awa Konan', statut: 'Nouveau', priorite: null, intervenant: null, service: null,
    historique: [h('6 nov. 09:30', 'Déclaré par Awa Konan')] },
  { id: 'INC-0151', titre: 'Extincteur périmé à l’entrée du magasin', date: '6 nov. 10:15', lieu: LIEUX[6], categorie: CATEGORIES[1],
    description: 'La date de contrôle de l’extincteur est dépassée depuis septembre.',
    auteur: 'Kouassi Yao', statut: 'Nouveau', priorite: null, intervenant: null, service: null,
    historique: [h('6 nov. 10:15', 'Déclaré par Kouassi Yao')] },
  { id: 'INC-0147', titre: 'Chariot élévateur n°2 à l’arrêt', date: '5 nov. 16:10', lieu: LIEUX[5], categorie: CATEGORIES[3],
    description: 'Le chariot n°2 ne démarre plus. Il bloque l’accès à la chambre froide B.',
    auteur: 'Kouassi Yao', statut: 'En cours', priorite: 'Haute', intervenant: 'Karim Traoré', service: 'Opérations System U',
    historique: [h('5 nov. 16:10', 'Déclaré par Kouassi Yao'), h('5 nov. 16:40', 'Qualifié par Marc Bamba · priorité Haute'), h('5 nov. 17:05', 'Pris en charge par Karim Traoré')] },
  { id: 'INC-0146', titre: 'Porte sectionnelle du quai 4 bloquée', date: '4 nov. 10:05', lieu: LIEUX[3], categorie: CATEGORIES[0],
    description: 'La porte reste bloquée à moitié ouverte. La chaîne du froid est menacée.',
    auteur: 'Awa Konan', statut: 'En cours', priorite: 'Critique', intervenant: 'Karim Traoré', service: 'Opérations System U', enRetard: true,
    historique: [h('4 nov. 10:05', 'Déclaré par Awa Konan'), h('4 nov. 10:30', 'Qualifié par Marc Bamba · priorité Critique'), h('4 nov. 11:00', 'Pris en charge par Karim Traoré')] },
  { id: 'INC-0145', titre: 'Éclairage défaillant en chambre froide C', date: '4 nov. 09:05', lieu: 'Cold Central CIVAFRIGO · Chambre froide C', categorie: CATEGORIES[3],
    description: 'Deux néons clignotent en permanence dans la chambre froide C.',
    auteur: 'Kouassi Yao', statut: 'Affecté', priorite: 'Normale', intervenant: 'Karim Traoré', service: 'Opérations System U',
    historique: [h('4 nov. 09:05', 'Déclaré par Kouassi Yao'), h('4 nov. 09:50', 'Qualifié par Marc Bamba · priorité Normale · affecté à Karim Traoré')] },
  { id: 'INC-0141', titre: 'Scanner code-barres défectueux', date: '3 nov. 14:20', lieu: 'Cold Central CIVAFRIGO · Poste 4', categorie: CATEGORIES[2],
    description: 'Le scanner du poste 4 ne lit plus les étiquettes.',
    auteur: 'Awa Konan', statut: 'Résolu', priorite: 'Normale', intervenant: 'Karim Traoré', service: 'Opérations System U',
    historique: [h('3 nov. 14:20', 'Déclaré par Awa Konan'), h('3 nov. 15:00', 'Qualifié par Marc Bamba · priorité Normale'), h('4 nov. 09:30', 'Marqué comme résolu par Karim Traoré')] },
  { id: 'INC-0138', titre: 'Palette de yaourts abîmée', date: '29 oct. 09:30', lieu: LIEUX[0], categorie: CATEGORIES[4],
    description: 'Une palette est tombée au déchargement, plusieurs cartons sont écrasés.',
    auteur: 'Kouassi Yao', statut: 'Clôturé', priorite: 'Faible', intervenant: 'Karim Traoré', service: 'CivaFrigo',
    historique: [h('29 oct. 09:30', 'Déclaré par Kouassi Yao'), h('30 oct. 08:00', 'Clôturé par Marc Bamba')] },
  { id: 'INC-0137', titre: 'Voyant d’alarme éteint', date: '25 oct. 10:10', lieu: LIEUX[4], categorie: CATEGORIES[1],
    description: 'Le voyant d’alarme de la chambre froide A ne s’allume plus.',
    auteur: 'Awa Konan', statut: 'Annulé', priorite: null, intervenant: null, service: null,
    historique: [h('25 oct. 10:10', 'Déclaré par Awa Konan'), h('25 oct. 14:00', 'Rejeté par Marc Bamba · fausse alerte')] },
  { id: 'INC-0133', titre: 'Porte coupe-feu bloquée', date: '21 oct. 15:40', lieu: LIEUX[0], categorie: CATEGORIES[1],
    description: 'La porte coupe-feu est calée ouverte par des cartons.',
    auteur: 'Kouassi Yao', statut: 'Clôturé', priorite: 'Critique', intervenant: 'Karim Traoré', service: 'CivaFrigo',
    historique: [h('21 oct. 15:40', 'Déclaré par Kouassi Yao'), h('23 oct. 09:00', 'Clôturé par Marc Bamba')] },
]

export const ALERTES: Alerte[] = [
  // Salarié
  { id: 1, roles: ['salarie'], type: 'prise', titre: 'INC-0147 pris en charge', detail: [['par '], ['Karim Traoré', true], [' · Opérations System U']], nouvelle: true, date: 'Il y a 2 h' },
  { id: 2, roles: ['salarie'], type: 'resolu', titre: 'INC-0141 : résolu', detail: [['par '], ['Abdoulaye Koffi', true], [' · à clôturer']], nouvelle: true, date: 'Hier, 11:20' },
  { id: 3, roles: ['salarie'], type: 'affecte', titre: 'INC-0145 affecté', detail: [['à Karim Traoré par Marc Bamba']], nouvelle: false, date: '4 nov.' },
  { id: 4, roles: ['salarie'], type: 'cloture', titre: 'INC-0138 clôturé', detail: [['validé par Marc Bamba']], nouvelle: false, date: '30 oct.' },
  { id: 5, roles: ['salarie'], type: 'rejete', titre: 'INC-0137 rejeté', detail: [['par Marc Bamba · Motif : Fausse alerte, voyant rebranché par l’équipe.']], nouvelle: false, date: '25 oct.' },
  // Intervenant
  { id: 6, roles: ['intervenant'], type: 'affecte', titre: 'INC-0146 affecté', detail: [['à '], ['vous', true], [' par Marc Bamba']], nouvelle: true, date: 'Il y a 1 h' },
  { id: 7, roles: ['intervenant'], type: 'retard', titre: 'INC-0146 : délai dépassé', detail: [['Prise en charge attendue sous 1 jour ouvré']], nouvelle: false, date: 'Hier' },
  { id: 8, roles: ['intervenant'], type: 'affecte', titre: 'INC-0145 affecté', detail: [['à '], ['vous', true], [' par Marc Bamba']], nouvelle: false, date: '4 nov.' },
  // Responsable et direction
  { id: 9, roles: ['responsable'], type: 'nouveau', titre: '3 déclarations à qualifier', detail: [['Sous 2 jours ouvrés']], nouvelle: true, date: 'Aujourd’hui, 10:20' },
  { id: 10, roles: ['responsable', 'direction'], type: 'retard', titre: 'INC-0146 : délai dépassé', detail: [['Prise en charge attendue sous 1 jour ouvré']], nouvelle: true, date: 'Aujourd’hui, 08:00' },
  { id: 11, roles: ['responsable'], type: 'resolu', titre: 'INC-0141 : résolu', detail: [['par '], ['Karim Traoré', true], [' · à clôturer']], nouvelle: false, date: '4 nov.' },
]

export const RAPPORT: LigneRapport[] = [
  { service: 'Développement', declares: 5, clotures: 4, taux: '80 %', delai: '4,4 j' },
  { service: 'Achats', declares: 9, clotures: 7, taux: '78 %', delai: '3,2 j' },
  { service: 'Commercial', declares: 14, clotures: 11, taux: '79 %', delai: '2,0 j' },
  { service: 'Bière', declares: 4, clotures: 4, taux: '100 %', delai: '3,8 j' },
  { service: 'CivaFrigo', declares: 26, clotures: 22, taux: '85 %', delai: '2,6 j' },
  { service: 'Opérations System U', declares: 11, clotures: 8, taux: '73 %', delai: '4,4 j' },
  { service: 'Relations fournisseurs', declares: 3, clotures: 3, taux: '100 %', delai: '3,2 j' },
  { service: 'Service shipchandler', declares: 7, clotures: 6, taux: '86 %', delai: '2,0 j' },
]
