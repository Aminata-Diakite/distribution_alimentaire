import { Component, computed, inject } from '@angular/core'
import { RAPPORT } from '../data'
import { Incident } from '../models'
import { Nav } from '../nav'
import { Session } from '../session'
import { Store } from '../store'
import { AppBarre, AppEntete, AppIcone, AppStatut } from '../ui'

const compter = (liste: Incident[], cle: 'statut' | 'priorite' | 'categorie', valeurs: string[]) =>
  valeurs.map((nom) => ({ nom, valeur: liste.filter((i) => i[cle] === nom).length }))

// ---------- Tableau de bord (responsable et direction) ----------
@Component({
  selector: 'app-dashboard',
  imports: [AppBarre, AppEntete, AppIcone, AppStatut],
  host: { class: 'page' },
  template: `
    <app-entete titre="Tableau de bord" [sous]="sous()">
      @if (session.role() === 'responsable') {
        <button class="btn-fonce haut" (click)="nav.aller('declarer')"><app-icone nom="plus" [taille]="18" couleur="#fff" [epaisseur]="2.4" />Déclarer</button>
      }
      @if (session.role() === 'direction') {
        <button class="btn-fonce haut" (click)="nav.aller('rapports')"><app-icone nom="document" [taille]="18" couleur="#fff" />Rapports</button>
      }
    </app-entete>
    <div class="chiffres">
      @for (c of chiffres(); track c.texte) {
        <div class="chiffre" [class.fonce]="c.fonce">
          <b>{{ c.n }}</b><span>{{ c.texte }}</span><em [style.color]="c.couleur">{{ c.note }}</em>
        </div>
      }
    </div>
    <div class="grille-bord">
      <div class="col">
        <section class="bloc"><h3>Par statut</h3>
          @for (b of statuts(); track b.nom) { <app-barre [nom]="b.nom" [valeur]="b.valeur" [max]="total()" /> }</section>
        <section class="bloc"><h3>Par priorité</h3>
          @for (b of priorites(); track b.nom) { <app-barre [nom]="b.nom" [valeur]="b.valeur" [max]="total()" /> }</section>
      </div>
      <div class="col">
        <section class="bloc"><h3>Par catégorie</h3>
          @for (b of categories(); track b.nom) { <app-barre [nom]="b.nom" [valeur]="b.valeur" [max]="total()" /> }</section>
        @if (session.role() === 'responsable' && atraiter().length) {
          <h3 class="etiquette">À traiter</h3>
          @for (i of atraiter(); track i.id) {
            <button class="carte traiter" (click)="nav.aller('fiche', i.id)">
              <div><strong>{{ i.titre }}</strong><small>{{ i.id }} · {{ i.statut === 'Nouveau' ? 'À qualifier' : 'À clôturer' }}</small></div>
              <app-statut [valeur]="i.statut" />
            </button>
          }
        }
      </div>
    </div>`,
})
export class Dashboard {
  private store = inject(Store)
  session = inject(Session)
  nav = inject(Nav)
  total = computed(() => this.store.incidents().length)
  atraiter = computed(() => this.store.incidents().filter((i) => i.statut === 'Nouveau' || i.statut === 'Résolu'))
  sous = computed(() => {
    const service = this.store.utilisateurs().find((u) => u.nom === this.session.utilisateur())?.service
    return 'Bonjour ' + this.session.utilisateur() + (this.session.role() === 'direction' ? ' · lecture seule, tous services' : service ? ' · service ' + service : '')
  })
  statuts = computed(() => compter(this.store.incidents(), 'statut', ['Nouveau', 'Affecté', 'En cours', 'Résolu', 'Clôturé']))
  priorites = computed(() => compter(this.store.incidents(), 'priorite', ['Critique', 'Haute', 'Normale', 'Faible']))
  categories = computed(() => compter(this.store.incidents(), 'categorie',
    ['Infrastructure / Bâtiment', 'Sécurité', 'Informatique', 'Équipement', 'Marchandises']))
  chiffres = computed(() => {
    const l = this.store.incidents()
    const ouverts = l.filter((i) => ['Nouveau', 'Affecté', 'En cours'].includes(i.statut))
    return [
      { n: ouverts.length, texte: 'Incidents ouverts', note: '+2 cette semaine', couleur: '#c9c0f2', fonce: true },
      { n: l.filter((i) => i.statut === 'Nouveau').length, texte: 'À qualifier', note: 'Sous 2 jours ouvrés', couleur: '#2f6fde', fonce: false },
      { n: ouverts.filter((i) => i.priorite === 'Critique').length, texte: 'Critiques en cours', note: 'Suivi renforcé', couleur: '#c0392b', fonce: false },
      { n: l.filter((i) => i.statut === 'Clôturé').length, texte: 'Clôturés ce mois', note: 'Délai moyen 3,4 j', couleur: '#1e9e6a', fonce: false },
    ]
  })
}

// ---------- Rapports (direction) ----------
@Component({
  selector: 'app-rapports',
  imports: [AppEntete, AppIcone],
  host: { class: 'page' },
  template: `
    <app-entete titre="Rapports" sous="Octobre 2026 · lecture seule">
      <button class="btn-clair haut" (click)="imprimer()"><app-icone nom="telecharger" [taille]="18" />Exporter</button>
    </app-entete>
    <div class="chiffres deux">
      <div class="chiffre"><b>79</b><span>Déclarés · Octobre 2026</span></div>
      <div class="chiffre"><b>65</b><span>Clôturés</span></div>
    </div>
    <section class="bloc tableau">
      <h3>Par service</h3>
      <table>
        <thead><tr><th>Service</th><th>Déclarés</th><th>Clôturés</th><th>Taux</th><th>Délai moyen</th></tr></thead>
        <tbody>
          @for (r of rapport; track r.service) {
            <tr><td><b>{{ r.service }}</b></td><td>{{ r.declares }}</td><td>{{ r.clotures }}</td><td>{{ r.taux }}</td><td>{{ r.delai }}</td></tr>
          }
        </tbody>
      </table>
    </section>`,
})
export class Rapports {
  rapport = RAPPORT
  imprimer() { window.print() }
}
