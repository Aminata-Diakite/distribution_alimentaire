import { NgTemplateOutlet } from '@angular/common'
import { Component, computed, inject } from '@angular/core'
import { Alerte, TypeAlerte } from '../models'
import { Session } from '../session'
import { Store } from '../store'
import { AppEntete, AppIcone, AppLigne } from '../ui'

// Icône et couleur de chaque type de notification
const TYPES: Record<TypeAlerte, [string, string]> = {
  nouveau: ['info', '#2f6fde'], prise: ['horloge', '#e08a00'], resolu: ['coche', '#1e9e6a'],
  affecte: ['profil', '#7a4dd8'], cloture: ['cadenas', '#6a6f94'], rejete: ['croix', '#c0392b'], retard: ['drapeau', '#c0392b'],
}

@Component({
  selector: 'app-alertes',
  imports: [AppIcone, NgTemplateOutlet],
  host: { class: 'page' },
  template: `
    <header class="entete"><div class="entete-texte">
      <h2>Notifications</h2>
      @if (nouvelles().length) { <p class="violet">{{ nouvelles().length }} nouvelle{{ nouvelles().length > 1 ? 's' : '' }}</p> }
    </div></header>
    @if (liste().length === 0) { <p class="vide">Aucune notification.</p> }
    @if (nouvelles().length) {
      <div class="groupe-tete"><h4 class="groupe violet">Nouvelles · {{ nouvelles().length }}</h4>
        <button class="lien" (click)="store.marquerLues()">Tout marquer comme lu</button></div>
      <div class="notifs">@for (a of nouvelles(); track a.id) { <ng-container *ngTemplateOutlet="ligne; context: { a }" /> }</div>
    }
    @if (anciennes().length) {
      <h4 class="groupe">Plus anciennes</h4>
      <div class="notifs">@for (a of anciennes(); track a.id) { <ng-container *ngTemplateOutlet="ligne; context: { a }" /> }</div>
    }
    <ng-template #ligne let-a="a">
      <div class="notif" [class.lue]="!a.nouvelle">
        <app-icone [nom]="icone(a)" [taille]="20" [couleur]="couleur(a)" [epaisseur]="1.9" />
        <div class="notif-corps">
          <strong>{{ a.titre }}</strong>
          <small>@for (p of a.detail; track $index) { @if (p[1]) { <b>{{ p[0] }}</b> } @else { {{ p[0] }} } }</small>
        </div>
        <div class="notif-droite">
          @if (a.nouvelle) { <em>Nouveau</em> }
          <small>{{ a.date }}</small>
        </div>
      </div>
    </ng-template>`,
})
export class Alertes {
  store = inject(Store)
  private session = inject(Session)
  liste = computed(() => {
    const r = this.session.role()
    return this.store.alertes().filter((a) => r !== null && a.roles.includes(r))
  })
  nouvelles = computed(() => this.liste().filter((a) => a.nouvelle))
  anciennes = computed(() => this.liste().filter((a) => !a.nouvelle))
  icone = (a: Alerte) => TYPES[a.type][0]
  couleur = (a: Alerte) => TYPES[a.type][1]
}

@Component({
  selector: 'app-profil',
  imports: [AppEntete, AppIcone, AppLigne],
  host: { class: 'page' },
  template: `
    <app-entete titre="Profil" />
    <div class="profil">
      <span class="avatar grand">{{ session.initiales() }}</span>
      <h3>{{ session.utilisateur() }}</h3>
      <p>{{ session.info()?.label }}</p>
    </div>
    <div class="bloc">
      <app-ligne icone="batiment" nom="Entreprise" valeur="CIVADIS" />
      <app-ligne icone="profil" nom="Rôle" [valeur]="session.info()?.label ?? ''" />
    </div>
    <div class="actions">
      <button class="btn-clair rouge" (click)="session.deconnecter()"><app-icone nom="sortie" [taille]="18" couleur="#c0392b" [epaisseur]="2" /> Se déconnecter</button>
    </div>`,
})
export class Profil {
  session = inject(Session)
}
