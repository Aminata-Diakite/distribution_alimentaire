import { Injectable, signal } from '@angular/core'
import { ALERTES, INCIDENTS, SERVICES, UTILISATEURS } from './data'
import { Alerte, Incident, Priorite, Statut, Utilisateur } from './models'

// Le « magasin » : toutes les données de l'application au même endroit.
// Chaque donnée est un signal : quand elle change, l'écran se met à jour tout seul.
@Injectable({ providedIn: 'root' })
export class Store {
  readonly incidents = signal<Incident[]>(INCIDENTS)
  readonly utilisateurs = signal<Utilisateur[]>(UTILISATEURS)
  readonly services = signal<string[]>(SERVICES)
  readonly alertes = signal<Alerte[]>(ALERTES)

  private maintenant() {
    return 'Aujourd’hui, ' + new Date().toTimeString().slice(0, 5)
  }

  // Change un incident ET ajoute une ligne à son historique
  private maj(id: string, champs: Partial<Incident>, ligne: string) {
    this.incidents.update((liste) =>
      liste.map((i) => i.id === id
        ? { ...i, ...champs, historique: [...i.historique, { date: this.maintenant(), texte: ligne }] }
        : i))
  }

  declarer(auteur: string, d: { titre: string; categorie: string; lieu: string; description: string }) {
    const n = Math.max(...this.incidents().map((i) => +i.id.slice(4))) + 1
    const incident: Incident = {
      id: 'INC-' + String(n).padStart(4, '0'), date: this.maintenant(), statut: 'Nouveau', priorite: null,
      intervenant: null, service: null, auteur, ...d,
      historique: [{ date: this.maintenant(), texte: 'Déclaré par ' + auteur }],
    }
    this.incidents.update((l) => [incident, ...l])
    this.alertes.update((l) => [
      { id: Date.now(), roles: ['responsable'], type: 'nouveau', titre: incident.id + ' à qualifier',
        detail: [['déclaré par '], [auteur, true]], nouvelle: true, date: this.maintenant() }, ...l])
  }

  // Qualifier = gravité + priorité, puis affecter à une personne ou à tout un service
  qualifier(id: string, d: { gravite: Priorite; priorite: Priorite; intervenant: string | null; service: string; par: string }) {
    const cible = d.intervenant ? 'affecté à ' + d.intervenant : 'affecté à tout le service ' + d.service
    this.maj(id, { statut: 'Affecté', gravite: d.gravite, priorite: d.priorite, intervenant: d.intervenant, service: d.service },
      `Qualifié par ${d.par} · gravité ${d.gravite.toLowerCase()} · priorité ${d.priorite.toLowerCase()} · ${cible}`)
  }
  rejeter(id: string, par: string, motif: string) { this.maj(id, { statut: 'Annulé' as Statut }, `Rejeté par ${par} · ${motif || 'sans motif'}`) }
  prendre(id: string, par: string) { this.maj(id, { statut: 'En cours' }, 'Pris en charge par ' + par) }
  resoudre(id: string, par: string) { this.maj(id, { statut: 'Résolu' }, 'Marqué comme résolu par ' + par) }
  cloturer(id: string, par: string) { this.maj(id, { statut: 'Clôturé', cloturePar: par }, 'Clôturé par ' + par) }

  marquerLues() { this.alertes.update((l) => l.map((a) => ({ ...a, nouvelle: false }))) }
  commenter(id: string, par: string, texte: string) { this.maj(id, {}, par + ' : ' + texte) }

  basculerActif(id: number) {
    this.utilisateurs.update((l) => l.map((u) => (u.id === id ? { ...u, actif: !u.actif } : u)))
  }
  emailPris(email: string, sauf?: number) {
    return this.utilisateurs().some((u) => u.email === email.trim().toLowerCase() && u.id !== sauf)
  }
  ajouterUtilisateur(d: { nom: string; email: string; role: string; service: string }) {
    this.utilisateurs.update((l) => [...l, { id: Date.now(), actif: true, ...d, email: d.email.trim().toLowerCase() }])
  }
  modifierUtilisateur(id: number, d: { nom: string; email: string; role: string; service: string }) {
    this.utilisateurs.update((l) => l.map((u) => (u.id === id ? { ...u, ...d, email: d.email.trim().toLowerCase() } : u)))
  }
  // Un compte qui a un historique (incidents déclarés ou affectés) n'est jamais effacé : il est désactivé.
  aUnHistorique(u: Utilisateur) {
    return this.incidents().some((i) => i.auteur === u.nom || i.intervenant === u.nom)
  }
  supprimerUtilisateur(id: number): 'supprime' | 'desactive' {
    const u = this.utilisateurs().find((x) => x.id === id)
    if (u && this.aUnHistorique(u)) {
      this.utilisateurs.update((l) => l.map((x) => (x.id === id ? { ...x, actif: false } : x)))
      return 'desactive'
    }
    this.utilisateurs.update((l) => l.filter((x) => x.id !== id))
    return 'supprime'
  }
  ajouterService(nom: string) { this.services.update((l) => [...l, nom]) }
}
