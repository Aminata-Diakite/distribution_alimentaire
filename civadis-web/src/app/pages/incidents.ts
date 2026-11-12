import { NgTemplateOutlet } from '@angular/common'
import { Component, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { toSignal } from '@angular/core/rxjs-interop'
import { map } from 'rxjs'
import { CATEGORIES, LIEUX } from '../data'
import { Incident, RoleCle } from '../models'
import { Ecran } from '../ecran'
import { Nav } from '../nav'
import { Session } from '../session'
import { Store } from '../store'
import { Qualif, ReponseQualif } from './qualif'
import { AppEntete, AppIcone, AppLigne, AppOnglets, AppPriorite, AppStatut } from '../ui'

// Quels incidents chaque rôle voit
export function mesIncidents(incidents: Incident[], role: RoleCle | null, utilisateur: string, service = ''): Incident[] {
  if (role === 'salarie') return incidents.filter((i) => i.auteur === utilisateur)
  // intervenant : ses incidents, et ceux affectés à tout son service
  if (role === 'intervenant') return incidents.filter((i) => i.intervenant === utilisateur || (!i.intervenant && !!i.service && i.service === service))
  return incidents
}

// ---------- Liste : « Mes déclarations », « Mes tâches », « Incidents » ----------
const COULEURS_POINT: Record<string, string> = {
  Nouveau: '#2f6fde', Affecté: '#7a4dd8', 'En cours': '#e08a00', Résolu: '#1e9e6a', Clôturé: '#6a6f94', Annulé: '#c0392b',
}
// Jour de référence de la démonstration : le 6 novembre
function groupe(date: string): string {
  if (date.startsWith('Aujourd')) return 'Aujourd’hui'
  const jour = parseInt(date, 10)
  if (date.includes('nov')) return jour === 6 ? 'Aujourd’hui' : jour >= 1 ? 'Cette semaine' : 'Plus ancien'
  return 'Plus ancien'
}
const GROUPES = ['Aujourd’hui', 'Cette semaine', 'Plus ancien']
export const dateCourte = (d: string) => d.replace(/^(\d+ \S+\.) /, '$1, ')

@Component({
  selector: 'app-incidents',
  imports: [FormsModule, NgTemplateOutlet, AppEntete, AppIcone, AppOnglets, AppPriorite, AppStatut],
  host: { class: 'page' },
  template: `
    @if (tableau()) {
      <!-- PC : tableau des incidents du service (responsable) -->
      <app-entete titre="Incidents du service" [sous]="'Origine et traitement · ' + base().length + ' incidents'">
        <button class="btn-fonce haut" (click)="nav.aller('declarer')"><app-icone nom="plus" [taille]="18" couleur="#fff" [epaisseur]="2.4" />Déclarer</button>
      </app-entete>
      <ng-container *ngTemplateOutlet="barre" />
      <app-onglets [liste]="['Tous', 'À clôturer', 'Clôturés']" [actif]="onglet()" (changer)="onglet.set($event)" />
      <app-onglets class="sous" [liste]="['Tous', 'Non affectés', 'Affectés']" [actif]="sous()" (changer)="sous.set($event)" />
      <div class="tableau">
        <div class="tr th"><span>Réf.</span><span>Incident</span><span>Statut</span><span>Priorité</span><span>Affectation</span><span>Déclaré par</span></div>
        @if (liste().length === 0) { <p class="vide">Aucun incident ici.</p> }
        @for (i of liste(); track i.id) {
          <button class="tr" (click)="nav.aller('fiche', i.id)">
            <b class="ref">{{ i.id }}</b>
            <span><b>{{ i.titre }}</b><small>{{ court(i.date) }}</small></span>
            <span><app-statut [valeur]="i.statut" /></span>
            <span><app-priorite [valeur]="i.priorite" /></span>
            <span>@if (i.intervenant || i.service) { <b>{{ i.intervenant ?? 'Tout le service' }}</b><small>{{ i.service }}</small> } @else { <small class="gris">Non affecté</small> }</span>
            <span>{{ i.auteur }}</span>
          </button>
        }
      </div>
    } @else {
      <!-- Téléphone : comme la maquette Figma -->
      <header class="accueil">
        <p>Bonjour,</p>
        <h1>{{ session.utilisateur() }}</h1>
        <small>{{ service() }}</small>
      </header>
      <ng-container *ngTemplateOutlet="barre" />
      <app-onglets [liste]="noms" [actif]="onglet()" (changer)="onglet.set($event)" />
      @if (liste().length === 0) { <p class="vide">Aucun incident ici.</p> }
      @for (g of groupes(); track g.nom) {
        <h4 class="groupe">{{ g.nom }}</h4>
        @for (i of g.liste; track i.id) {
          <div class="rang-incident">
            <i class="point" [style.border-color]="point(i.statut)"></i>
            <button class="carte" (click)="nav.aller('fiche', i.id)">
              <div class="carte-haut"><small>{{ i.id }}</small><small>{{ court(i.date) }}</small></div>
              <strong>{{ i.titre }}</strong>
              <span class="lieu"><app-icone nom="lieu" [taille]="15" couleur="#7a7266" [epaisseur]="1.8" />{{ i.lieu }}</span>
              <div class="carte-bas"><app-statut [valeur]="i.statut" /><app-priorite [valeur]="i.priorite" />
                <app-icone nom="bas" [taille]="18" couleur="#7a7266" [epaisseur]="2" /></div>
            </button>
          </div>
        }
      }
    }

    <ng-template #barre>
      <div class="recherche-fil">
        <label class="recherche"><app-icone nom="recherche" [taille]="18" couleur="#7a7266" [epaisseur]="1.8" />
          <input [(ngModel)]="q" aria-label="Rechercher un incident" /></label>
        <button class="filtre" [class.actif]="filtreOuvert()" (click)="filtreOuvert.set(!filtreOuvert())" aria-label="Trier et filtrer" [attr.aria-expanded]="filtreOuvert()">
          <app-icone nom="filtre" [taille]="20" couleur="#a99ceb" [epaisseur]="2" />
          @if (nbFiltres()) { <em>{{ nbFiltres() }}</em> }
        </button>
      </div>
      @if (filtreOuvert()) {
        <div class="bloc panneau-filtre">
          <h4>Statut</h4>
          <div class="puces">
            @for (s of statutsChoix; track s) {
              <button type="button" class="puce" [class.on]="fStatuts().includes(s)" (click)="basculer(fStatuts, s)">
                <i [style.background]="point(s)"></i>{{ s }}</button>
            }
          </div>
          <h4>Priorité</h4>
          <div class="puces">
            @for (p of prioritesChoix; track p) {
              <button type="button" class="puce" [class.on]="fPriorites().includes(p)" (click)="basculer(fPriorites, p)">{{ p }}</button>
            }
          </div>
          <div class="panneau-bas">
            <button type="button" class="lien" (click)="reinitialiser()">Tout effacer</button>
            <small>{{ liste().length }} résultat{{ liste().length > 1 ? 's' : '' }}</small>
          </div>
        </div>
      }
    </ng-template>`,
})
export class Incidents {
  store = inject(Store)
  session = inject(Session)
  nav = inject(Nav)
  ecran = inject(Ecran)
  q = signal('')
  onglet = signal('Toutes')
  sous = signal('Tous')
  court = dateCourte
  point = (s: string) => COULEURS_POINT[s]
  noms = ['Toutes', 'Résolues', 'Clôturées']

  // Trier / filtrer : par statut et par priorité (plusieurs choix possibles)
  filtreOuvert = signal(false)
  statutsChoix = ['Nouveau', 'Affecté', 'En cours', 'Résolu', 'Clôturé', 'Annulé']
  prioritesChoix = ['Critique', 'Haute', 'Normale', 'Faible', 'Non qualifié']
  fStatuts = signal<string[]>([])
  fPriorites = signal<string[]>([])
  nbFiltres = computed(() => this.fStatuts().length + this.fPriorites().length)
  basculer(cible: { (): string[]; set(v: string[]): void }, valeur: string) {
    const l = cible()
    cible.set(l.includes(valeur) ? l.filter((x) => x !== valeur) : [...l, valeur])
  }
  reinitialiser() { this.fStatuts.set([]); this.fPriorites.set([]) }

  // Tableau (PC) seulement pour le responsable
  tableau = computed(() => this.ecran.large() && this.session.role() === 'responsable')
  titre = computed(() => {
    const r = this.session.role()
    return r === 'salarie' ? 'Mes déclarations' : r === 'intervenant' ? 'Mes tâches' : 'Incidents'
  })
  service = computed(() => this.store.utilisateurs().find((u) => u.nom === this.session.utilisateur())?.service ?? '')

  base = computed(() => mesIncidents(this.store.incidents(), this.session.role(), this.session.utilisateur(), this.service()))
  compte = computed(() => {
    const l = this.base()
    return {
      ouvertes: l.filter((i) => ['Nouveau', 'Affecté', 'En cours'].includes(i.statut)).length,
      resolues: l.filter((i) => i.statut === 'Résolu').length,
      cloturees: l.filter((i) => i.statut === 'Clôturé').length,
    }
  })

  liste = computed(() => {
    const q = this.q().toLowerCase()
    let l = this.base().filter((i) => (i.titre + i.id + i.lieu).toLowerCase().includes(q))
    if (this.tableau()) {
      const o = this.onglet()
      if (o === 'À clôturer') l = l.filter((i) => i.statut === 'Résolu')
      else if (o === 'Clôturés') l = l.filter((i) => ['Clôturé', 'Annulé'].includes(i.statut))
      const s = this.sous()
      if (s === 'Non affectés') l = l.filter((i) => !i.intervenant && !i.service)
      else if (s === 'Affectés') l = l.filter((i) => i.intervenant || i.service)
    } else {
      const o = this.onglet()
      if (o === 'Résolues') l = l.filter((i) => i.statut === 'Résolu')
      else if (o === 'Clôturées') l = l.filter((i) => i.statut === 'Clôturé')
    }
    if (this.fStatuts().length) l = l.filter((i) => this.fStatuts().includes(i.statut))
    if (this.fPriorites().length) l = l.filter((i) => this.fPriorites().includes(i.priorite ?? 'Non qualifié'))
    return l
  })
  groupes = computed(() =>
    GROUPES.map((nom) => ({ nom, liste: this.liste().filter((i) => groupe(i.date) === nom) })).filter((g) => g.liste.length))
}

// ---------- Fiche d'un incident ----------
const ETAPES = ['Nouveau', 'Affecté', 'En cours', 'Résolu', 'Clôturé']
const MESSAGES: Record<string, [string, string]> = {
  Nouveau: ['En attente.', 'Le responsable de service doit qualifier et affecter cette déclaration sous 2 jours ouvrés.'],
  Affecté: ['Affecté.', 'L’intervenant doit prendre en charge l’incident sous 1 jour ouvré.'],
  'En cours': ['En cours.', 'L’intervenant traite l’incident.'],
  Résolu: ['Résolu.', 'Le responsable de service doit vérifier puis clôturer l’incident.'],
  Clôturé: ['Clôturé.', 'L’incident est terminé.'],
  Annulé: ['Annulé.', 'Cette déclaration a été rejetée.'],
}
const ACTIVITES: Record<string, string> = { 'Cold Central CIVAFRIGO': 'Entreposage frigorifique' }

@Component({
  selector: 'app-fiche',
  imports: [FormsModule, AppEntete, AppIcone, AppLigne, AppOnglets, AppPriorite, AppStatut, Qualif],
  host: { class: 'page' },
  template: `
    @if (i(); as inc) {
      @if (ecran.large()) {
        <!-- PC : deux colonnes, comme la maquette Figma -->
        <button class="retour-texte" (click)="nav.retour()"><app-icone nom="retour" [taille]="14" [epaisseur]="2.2" />Retour</button>
        <div class="fiche-tete">
          <div><small class="ref-violet">{{ inc.id }}</small><h1>{{ inc.titre }}</h1></div>
          <div class="fiche-statut"><app-statut [valeur]="inc.statut" /><app-priorite [valeur]="inc.priorite" /></div>
        </div>
        <div class="bloc etapes-grand">
          <div class="etapes">
            @for (e of etapes; track e; let n = $index) { <div [class.fait]="n <= pos()"><i></i><span>{{ e }}</span></div> }
          </div>
          <p><b>{{ message(inc.statut)[0] }}</b>{{ message(inc.statut)[1] }}</p>
        </div>
        <div class="fiche-grille">
          <div>
            <h3 class="etiquette">Le problème</h3>
            <div class="bloc texte">{{ inc.description }}</div>
            <h3 class="etiquette">Lieu et moment</h3>
            <div class="bloc">
              <app-ligne icone="document" nom="Catégorie" [valeur]="inc.categorie" />
              <app-ligne icone="lieu" nom="Site" [valeur]="site()" />
              <app-ligne icone="batiment" nom="Service d’origine" [valeur]="origine()" />
              <app-ligne icone="equipe" nom="Activité" [valeur]="activite()" />
              <app-ligne icone="info" nom="Emplacement" [valeur]="emplacement()" />
              <app-ligne icone="horloge" nom="Constaté le" [valeur]="court(inc.date)" />
            </div>
          </div>
          <div>
            <h3 class="etiquette">Traitement</h3>
            <div class="bloc">
              <app-ligne icone="crayon" nom="Service de traitement" [valeur]="inc.service ?? 'À définir'" />
              <app-ligne icone="drapeau" nom="Gravité" [valeur]="inc.gravite ?? 'Non estimée'" />
              <app-ligne icone="profil" nom="Intervenant" [valeur]="inc.intervenant ?? 'À définir'" />
              <app-ligne icone="cadenas" nom="Clôture par" [valeur]="inc.cloturePar ?? 'À définir'" />
            </div>
            <h3 class="etiquette">Historique</h3>
            <div class="bloc histo-bloc">
              <ol class="histo2">
                @for (h of inc.historique; track $index) {
                  <li><i></i><div><b>{{ h.texte }}</b></div><small>{{ h.date }}</small></li>
                }
              </ol>
              <textarea class="champ" rows="3" aria-label="Ajouter un commentaire" [ngModel]="commentaire()" (ngModelChange)="commentaire.set($event)"></textarea>
              <button class="btn-fonce plein" [disabled]="commentaire().trim().length < 2" (click)="commenter(inc)">Publier le commentaire</button>
              <p class="note">L’historique est en lecture seule : rien ne s’efface.</p>
            </div>
            @if (inc.pieces?.length) {
              <h3 class="etiquette">Pièces jointes</h3>
              <div class="pieces">
                @for (p of inc.pieces; track p) {
                  <figure><span><app-icone nom="document" [taille]="26" couleur="#7a7266" [epaisseur]="1.6" /></span><figcaption>{{ p }}</figcaption></figure>
                }
              </div>
            }
          </div>
        </div>
      } @else {
        <!-- Téléphone -->
        <app-entete [titre]="inc.titre" [sous]="inc.id" [retour]="true" (retourner)="nav.retour()" />
        <div class="fiche-statut"><app-statut [valeur]="inc.statut" /><app-priorite [valeur]="inc.priorite" /></div>
        <div class="etapes">
          @for (e of etapes; track e; let n = $index) { <div [class.fait]="n <= pos()"><i></i><span>{{ e }}</span></div> }
        </div>
        <app-onglets [liste]="['Détails', 'Historique']" [actif]="onglet()" (changer)="onglet.set($event)" />
        @if (onglet() === 'Détails') {
          <h3 class="etiquette">Le problème</h3>
          <div class="bloc texte">{{ inc.description }}</div>
          <h3 class="etiquette">Lieu et moment</h3>
          <div class="bloc">
            <app-ligne icone="document" nom="Catégorie" [valeur]="inc.categorie" />
            <app-ligne icone="lieu" nom="Lieu" [valeur]="inc.lieu" />
            <app-ligne icone="horloge" nom="Constaté le" [valeur]="court(inc.date)" />
            <app-ligne icone="profil" nom="Déclaré par" [valeur]="inc.auteur" />
          </div>
          <h3 class="etiquette">Traitement</h3>
          <div class="bloc">
            <app-ligne icone="batiment" nom="Service de traitement" [valeur]="inc.service ?? 'À définir'" />
            <app-ligne icone="drapeau" nom="Gravité" [valeur]="inc.gravite ?? 'Non estimée'" />
            <app-ligne icone="profil" nom="Intervenant" [valeur]="inc.intervenant ?? 'À définir'" />
            <app-ligne icone="cadenas" nom="Clôture par" [valeur]="inc.cloturePar ?? 'À définir'" />
          </div>
        } @else {
          <ol class="histo">
            @for (h of inc.historique; track $index) { <li><b>{{ h.texte }}</b><small>{{ h.date }}</small></li> }
          </ol>
        }
      }

      <!-- Les boutons dépendent du rôle ET du statut -->
      <div class="actions">
        @if (session.role() === 'responsable' && inc.statut === 'Nouveau') {
          <button class="btn-clair rouge" (click)="rejeter(inc)">Rejeter</button>
          <button class="btn-fonce" (click)="ouvrirQualif(inc)">Qualifier et affecter →</button>
        }
        @if (session.role() === 'responsable' && inc.statut === 'Résolu') {
          <button class="btn-fonce" (click)="cloturer(inc)">Clôturer l’incident →</button>
        }
        @if (session.role() === 'intervenant' && inc.statut === 'Affecté') {
          <button class="btn-fonce" (click)="prendre(inc)">Prendre en charge →</button>
        }
        @if (session.role() === 'intervenant' && inc.statut === 'En cours') {
          <button class="btn-fonce" (click)="resoudre(inc)">Marquer comme résolu →</button>
        }
      </div>

      @if (fenetre()) {
        <div class="voile-fenetre" (click)="fenetre.set(false)">
          <div class="fenetre" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
            <app-qualif [incident]="inc" (retour)="fenetre.set(false)" (affecter)="affecter(inc, $event)" />
          </div>
        </div>
      }
    } @else {
      <p class="vide">Incident introuvable.</p>
    }`,
})
export class Fiche {
  store = inject(Store)
  session = inject(Session)
  nav = inject(Nav)
  ecran = inject(Ecran)
  etapes = ETAPES
  court = dateCourte
  onglet = signal('Détails')
  fenetre = signal(false)
  commentaire = signal('')
  private id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('id'))))
  i = computed(() => this.store.incidents().find((x) => x.id === this.id()))
  pos = computed(() => ETAPES.indexOf(this.i()?.statut ?? 'Nouveau'))
  message = (statut: string) => MESSAGES[statut] ?? ['', '']
  site = computed(() => (this.i()?.lieu ?? '').split(' · ')[0])
  emplacement = computed(() => (this.i()?.lieu ?? '').split(' · ')[1] ?? '—')
  activite = computed(() => ACTIVITES[this.site()] ?? '—')
  origine = computed(() => this.store.utilisateurs().find((u) => u.nom === this.i()?.auteur)?.service ?? '—')

  private par() { return this.session.utilisateur() }
  rejeter(i: Incident) { this.store.rejeter(i.id, this.par(), 'refusé par le responsable'); this.nav.retour() }
  cloturer(i: Incident) { this.store.cloturer(i.id, this.par()); this.nav.retour() }
  prendre(i: Incident) { this.store.prendre(i.id, this.par()); this.nav.retour() }
  resoudre(i: Incident) { this.store.resoudre(i.id, this.par()); this.nav.retour() }
  commenter(i: Incident) { this.store.commenter(i.id, this.par(), this.commentaire().trim()); this.commentaire.set('') }
  // PC : fenêtre au-dessus de la fiche. Téléphone : page séparée.
  ouvrirQualif(i: Incident) { this.ecran.large() ? this.fenetre.set(true) : this.nav.aller('qualifier', i.id) }
  affecter(i: Incident, r: ReponseQualif) {
    this.store.qualifier(i.id, { ...r, par: this.par() })
    this.fenetre.set(false)
  }
}

// ---------- Qualifier et affecter (page, téléphone) ----------
@Component({
  selector: 'app-qualifier',
  imports: [Qualif],
  host: { class: 'page' },
  template: `
    @if (i(); as inc) {
      <app-qualif [incident]="inc" (retour)="nav.retour()" (affecter)="valider(inc.id, $event)" />
    } @else {
      <p class="vide">Incident introuvable.</p>
    }`,
})
export class Qualifier {
  store = inject(Store)
  session = inject(Session)
  nav = inject(Nav)
  private id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('id'))))
  i = computed(() => this.store.incidents().find((x) => x.id === this.id()))

  valider(id: string, r: ReponseQualif) {
    this.store.qualifier(id, { ...r, par: this.session.utilisateur() })
    this.nav.aller('liste')
  }
}

// ---------- Déclarer une anomalie (2 étapes) ----------
@Component({
  selector: 'app-declarer',
  imports: [FormsModule, AppEntete],
  host: { class: 'page' },
  template: `
    <app-entete titre="Déclarer une anomalie" [sous]="'Étape ' + etape() + ' sur 2'" [retour]="true" (retourner)="retour()" />
    <div class="progres"><i class="on"></i><i [class.on]="etape() === 2"></i></div>
    @if (etape() === 1) {
      <h3 class="etiquette">Titre</h3>
      <input class="champ" placeholder="Ex. Fuite d’eau près du quai 3" [(ngModel)]="titre" />
      <h3 class="etiquette">Catégorie</h3>
      <div class="choix">
        @for (c of categories; track c) { <button [class.on]="c === categorie()" (click)="categorie.set(c)">{{ c }}</button> }
      </div>
      <div class="actions"><button class="btn-fonce" [disabled]="!ok1()" (click)="etape.set(2)">Continuer →</button></div>
      @if (!categorie()) { <p class="aide">Choisissez une catégorie.</p> }
    } @else {
      <h3 class="etiquette">Lieu</h3>
      <select class="champ" [(ngModel)]="lieu">
        @for (l of lieux; track l) { <option [value]="l">{{ l }}</option> }
      </select>
      <h3 class="etiquette">Description</h3>
      <textarea class="champ" rows="5" placeholder="Que s’est-il passé ?" [(ngModel)]="description"></textarea>
      <div class="actions"><button class="btn-fonce" [disabled]="description().trim().length < 5" (click)="envoyer()">Envoyer la déclaration →</button></div>
    }`,
})
export class Declarer {
  private store = inject(Store)
  private session = inject(Session)
  private nav = inject(Nav)
  categories = CATEGORIES
  lieux = LIEUX
  etape = signal(1)
  titre = signal('')
  categorie = signal('')
  lieu = signal(LIEUX[0])
  description = signal('')
  ok1 = computed(() => this.titre().trim().length > 2 && !!this.categorie())

  retour() { this.etape() === 2 ? this.etape.set(1) : this.nav.aller('liste') }

  envoyer() {
    this.store.declarer(this.session.utilisateur(), {
      titre: this.titre().trim(), categorie: this.categorie(), lieu: this.lieu(), description: this.description().trim(),
    })
    this.nav.aller('liste')
  }
}
