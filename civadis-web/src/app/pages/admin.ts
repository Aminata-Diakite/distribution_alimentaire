import { Component, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Nav } from '../nav'
import { Session } from '../session'
import { Store } from '../store'
import { AppBarre, AppEntete, AppIcone } from '../ui'

const initiales = (n: string) => n.split(' ').map((m) => m[0]).join('').slice(0, 2)
const ROLES_COMPTE = ['Salarié', 'Intervenant', 'Responsable de service', 'Direction', 'Administrateur']

// ---------- Vue d'ensemble (administrateur) ----------
@Component({
  selector: 'app-vue-ensemble',
  imports: [AppBarre, AppEntete, AppIcone],
  host: { class: 'page' },
  template: `
    <app-entete titre="Vue d’ensemble" [sous]="'Bonjour ' + session.utilisateur() + ' · comptes et services de l’entreprise'">
      <button class="btn-fonce haut" (click)="nav.aller('utilisateurs')"><app-icone nom="equipe" [taille]="18" couleur="#fff" />Gérer les comptes</button>
    </app-entete>
    <div class="chiffres">
      <div class="chiffre fonce"><b>{{ store.utilisateurs().length }}</b><span>Comptes</span><em style="color:#c9c0f2">{{ actifs() }} actifs</em></div>
      <div class="chiffre"><b>{{ store.utilisateurs().length - actifs() }}</b><span>Désactivés</span></div>
      <div class="chiffre"><b>{{ store.services().length }}</b><span>Services</span></div>
      <div class="chiffre"><b>{{ nbIntervenants() }}</b><span>Intervenants</span></div>
    </div>
    <div class="grille2">
      <section class="bloc"><h3>Comptes par rôle</h3>
        @for (b of parRole(); track b.nom) { <app-barre [nom]="b.nom" [valeur]="b.valeur" [max]="store.utilisateurs().length" /> }</section>
      <section class="bloc"><h3>Membres par service</h3>
        @for (b of parService(); track b.nom) { <app-barre [nom]="b.nom" [valeur]="b.valeur" [max]="store.utilisateurs().length" /> }</section>
    </div>`,
})
export class VueEnsemble {
  store = inject(Store)
  session = inject(Session)
  nav = inject(Nav)
  actifs = computed(() => this.store.utilisateurs().filter((u) => u.actif).length)
  nbIntervenants = computed(() => this.store.utilisateurs().filter((u) => u.role === 'Intervenant').length)
  parRole = computed(() => ['Salarié', 'Responsable de service', 'Direction', 'Administrateur']
    .map((nom) => ({ nom, valeur: this.store.utilisateurs().filter((u) => u.role === nom).length })))
  parService = computed(() => this.store.services()
    .map((nom) => ({ nom, valeur: this.store.utilisateurs().filter((u) => u.service === nom).length })))
}

// ---------- Utilisateurs : ajouter, modifier, supprimer ----------
@Component({
  selector: 'app-utilisateurs',
  imports: [FormsModule, AppEntete, AppIcone],
  host: { class: 'page' },
  template: `
    <app-entete titre="Utilisateurs" [sous]="store.utilisateurs().length + ' comptes'">
      <button class="btn-fonce haut" (click)="ouvrir()"><app-icone nom="plus" [taille]="18" couleur="#fff" [epaisseur]="2.4" />Ajouter un compte</button>
    </app-entete>
    @if (info()) { <p class="msg-ok">{{ info() }}</p> }
    @if (formOuvert()) {
      <div class="bloc formulaire">
        <h3>{{ enEdition() ? 'Modifier le compte' : 'Nouveau compte' }}</h3>
        <input class="champ" placeholder="Nom complet" [(ngModel)]="fNom" aria-label="Nom complet" />
        <input class="champ" type="email" placeholder="E-mail (prenom.nom@civadis.ci)" [(ngModel)]="fEmail" aria-label="E-mail" />
        <select class="champ" [(ngModel)]="fRole" aria-label="Rôle">@for (r of roles; track r) { <option [value]="r">{{ r }}</option> }</select>
        <select class="champ" [(ngModel)]="fService" aria-label="Service">@for (s of store.services(); track s) { <option [value]="s">{{ s }}</option> }</select>
        @if (erreur()) { <p class="msg-err">{{ erreur() }}</p> }
        <div class="actions ligne-boutons">
          <button class="btn-clair" (click)="formOuvert.set(false)">Annuler</button>
          <button class="btn-fonce" (click)="enregistrer()">{{ enEdition() ? 'Enregistrer' : 'Créer le compte' }}</button>
        </div>
      </div>
    }
    <label class="recherche"><app-icone nom="recherche" [taille]="18" couleur="#7a7266" [epaisseur]="1.8" />
      <input placeholder="Rechercher un compte" [(ngModel)]="q" aria-label="Rechercher" /></label>
    <div class="cartes">
      @for (u of liste(); track u.id) {
        <div class="carte rang compte">
          <span class="avatar">{{ ini(u.nom) }}</span>
          <div class="grow"><strong>{{ u.nom }}</strong><small>{{ u.role }} · {{ u.service }}</small><small>{{ u.email }}</small></div>
          <button class="etat" [class.actif]="u.actif" [class.inactif]="!u.actif" (click)="basculer(u.id)" [title]="u.actif ? 'Désactiver' : 'Réactiver'" [attr.aria-label]="u.actif ? 'Désactiver' : 'Réactiver'">
            <app-icone [nom]="u.actif ? 'coche' : 'cadenas'" [taille]="16" [couleur]="u.actif ? '#1e9e6a' : '#6a6f94'" [epaisseur]="2" />{{ u.actif ? 'Actif' : 'Désactivé' }}
          </button>
          <button class="icone-btn" title="Modifier" aria-label="Modifier" (click)="modifier(u.id)"><app-icone nom="crayon" [taille]="18" couleur="#2b2622" [epaisseur]="1.8" /></button>
          @if (aSupprimer() === u.id) {
            <button class="confirme" (click)="supprimer(u.id)">Confirmer</button>
            <button class="icone-btn" title="Annuler" aria-label="Annuler" (click)="aSupprimer.set(null)"><app-icone nom="croix" [taille]="18" couleur="#7a7266" [epaisseur]="1.8" /></button>
          } @else {
            <button class="icone-btn" title="Supprimer" aria-label="Supprimer" (click)="aSupprimer.set(u.id)"><app-icone nom="corbeille" [taille]="18" couleur="#c0392b" [epaisseur]="1.8" /></button>
          }
        </div>
      }
    </div>`,
})
export class Utilisateurs {
  store = inject(Store)
  session = inject(Session)
  roles = ROLES_COMPTE
  ini = initiales
  q = signal('')
  formOuvert = signal(false)
  enEdition = signal<number | null>(null)   // id du compte en cours de modification
  aSupprimer = signal<number | null>(null)  // id du compte qui attend « Confirmer »
  info = signal('')
  erreur = signal('')
  fNom = signal('')
  fEmail = signal('')
  fRole = signal('Salarié')
  fService = signal(this.store.services()[0])
  liste = computed(() => this.store.utilisateurs().filter((u) => u.nom.toLowerCase().includes(this.q().toLowerCase())))

  ouvrir() {
    this.enEdition.set(null); this.erreur.set(''); this.info.set('')
    this.fNom.set(''); this.fEmail.set(''); this.fRole.set('Salarié'); this.fService.set(this.store.services()[0])
    this.formOuvert.set(true)
  }
  modifier(id: number) {
    const u = this.store.utilisateurs().find((x) => x.id === id)
    if (!u) return
    this.enEdition.set(id); this.erreur.set(''); this.info.set('')
    this.fNom.set(u.nom); this.fEmail.set(u.email); this.fRole.set(u.role); this.fService.set(u.service)
    this.formOuvert.set(true)
  }
  enregistrer() {
    const d = { nom: this.fNom().trim(), email: this.fEmail().trim().toLowerCase(), role: this.fRole(), service: this.fService() }
    if (d.nom.length < 3) return this.erreur.set('Écris le nom complet.')
    if (!/^\S+@\S+\.\S+$/.test(d.email)) return this.erreur.set('Écris une adresse e-mail valide.')
    if (this.store.emailPris(d.email, this.enEdition() ?? undefined)) return this.erreur.set('Cette adresse e-mail est déjà utilisée.')
    const id = this.enEdition()
    if (id === null) { this.store.ajouterUtilisateur(d); this.info.set('Compte créé : ' + d.nom + '.') }
    else { this.store.modifierUtilisateur(id, d); this.info.set('Compte modifié : ' + d.nom + '.') }
    this.formOuvert.set(false)
  }
  basculer(id: number) {
    if (this.estMoi(id)) return this.info.set('Tu ne peux pas désactiver ton propre compte.')
    this.store.basculerActif(id)
  }
  supprimer(id: number) {
    this.aSupprimer.set(null)
    if (this.estMoi(id)) return this.info.set('Tu ne peux pas supprimer ton propre compte.')
    const nom = this.store.utilisateurs().find((u) => u.id === id)?.nom
    const r = this.store.supprimerUtilisateur(id)
    this.info.set(r === 'supprime' ? 'Compte supprimé : ' + nom + '.' : nom + ' a un historique : le compte est désactivé, pas supprimé.')
  }
  private estMoi(id: number) {
    return this.store.utilisateurs().find((u) => u.id === id)?.email === this.session.compte()?.email
  }
}

// ---------- Services ----------
@Component({
  selector: 'app-services',
  imports: [FormsModule, AppEntete, AppIcone],
  host: { class: 'page' },
  template: `
    <app-entete titre="Services" [sous]="store.services().length + ' services'">
      <button class="btn-fonce haut" (click)="ouvert.set(!ouvert())"><app-icone nom="plus" [taille]="18" couleur="#fff" [epaisseur]="2.4" />Ajouter un service</button>
    </app-entete>
    @if (ouvert()) {
      <div class="bloc formulaire">
        <input class="champ" placeholder="Nom du service" [(ngModel)]="nom" />
        <div class="actions"><button class="btn-fonce" [disabled]="nom().trim().length < 2" (click)="ajouter()">Créer le service</button></div>
      </div>
    }
    <div class="cartes">
      @for (s of store.services(); track s) {
        <div class="carte rang">
          <span class="rond"><app-icone nom="batiment" [taille]="20" couleur="#7c6bd6" /></span>
          <div class="grow"><strong>{{ s }}</strong><small>{{ membres(s) }} membre{{ membres(s) > 1 ? 's' : '' }}</small></div>
        </div>
      }
    </div>`,
})
export class Services {
  store = inject(Store)
  nom = signal('')
  ouvert = signal(false)
  membres(service: string) { return this.store.utilisateurs().filter((u) => u.service === service).length }
  ajouter() { this.store.ajouterService(this.nom().trim()); this.nom.set(''); this.ouvert.set(false) }
}
