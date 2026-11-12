import { RoleCle } from './models'

// Le menu de chaque rôle : page, libellé, icône
export interface EntreeMenu { page: string; nom: string; icone: string }

export const MENUS: Record<RoleCle, EntreeMenu[]> = {
  salarie: [
    { page: 'liste', nom: 'Déclarations', icone: 'liste' }, { page: 'declarer', nom: 'Déclarer', icone: 'plus' },
    { page: 'alertes', nom: 'Alertes', icone: 'cloche' }, { page: 'profil', nom: 'Profil', icone: 'profil' }],
  intervenant: [
    { page: 'liste', nom: 'Mes tâches', icone: 'liste' }, { page: 'declarer', nom: 'Déclarer', icone: 'plus' },
    { page: 'alertes', nom: 'Alertes', icone: 'cloche' }, { page: 'profil', nom: 'Profil', icone: 'profil' }],
  responsable: [
    { page: 'dashboard', nom: 'Tableau de bord', icone: 'grille' }, { page: 'liste', nom: 'Incidents', icone: 'liste' },
    { page: 'declarer', nom: 'Déclarer', icone: 'plus' }, { page: 'alertes', nom: 'Alertes', icone: 'cloche' },
    { page: 'profil', nom: 'Profil', icone: 'profil' }],
  admin: [
    { page: 'vue', nom: 'Vue d’ensemble', icone: 'grille' }, { page: 'utilisateurs', nom: 'Utilisateurs', icone: 'equipe' },
    { page: 'services', nom: 'Services', icone: 'batiment' }, { page: 'profil', nom: 'Profil', icone: 'profil' }],
  direction: [
    { page: 'dashboard', nom: 'Tableau de bord', icone: 'grille' }, { page: 'rapports', nom: 'Rapports', icone: 'document' },
    { page: 'profil', nom: 'Profil', icone: 'profil' }],
}

// Pages « enfants » : quel onglet du menu reste allumé
export const PARENT: Record<string, string> = { fiche: 'liste', qualifier: 'liste' }
