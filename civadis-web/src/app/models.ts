// Les « formes » des données de l'application (types TypeScript)

export type Statut = 'Nouveau' | 'Affecté' | 'En cours' | 'Résolu' | 'Clôturé' | 'Annulé'
export type Priorite = 'Critique' | 'Haute' | 'Normale' | 'Faible'
export type RoleCle = 'salarie' | 'intervenant' | 'responsable' | 'admin' | 'direction'

export interface Evenement { date: string; texte: string }

export interface Incident {
  id: string
  titre: string
  date: string
  lieu: string
  categorie: string
  description: string
  auteur: string
  statut: Statut
  priorite: Priorite | null
  gravite?: Priorite | null
  cloturePar?: string
  pieces?: string[]
  intervenant: string | null
  service: string | null
  enRetard?: boolean
  historique: Evenement[]
}

export interface Utilisateur { id: number; nom: string; email: string; role: string; service: string; actif: boolean }
export type TypeAlerte = 'nouveau' | 'prise' | 'resolu' | 'affecte' | 'cloture' | 'rejete' | 'retard'
// detail = morceaux de texte ; [texte, true] = texte en gras
export interface Alerte {
  id: number; roles: RoleCle[]; type: TypeAlerte; titre: string
  detail: [string, boolean?][]; nouvelle: boolean; date: string
}
export interface LigneRapport { service: string; declares: number; clotures: number; taux: string; delai: string }
export interface InfoRole { label: string; texte: string }
export interface Compte { email: string; nom: string; role: RoleCle }
