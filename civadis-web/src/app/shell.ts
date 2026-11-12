import { Component, computed, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { NavigationEnd, Router, RouterOutlet } from '@angular/router'
import { filter, map } from 'rxjs'
import { MENUS, PARENT } from './menus'
import { Ecran } from './ecran'
import { Nav } from './nav'
import { Session } from './session'
import { AppIcone } from './ui'

// La « coquille » de l'application : le menu + la page affichée au milieu.
// Grand écran (PC, tablette) : menu à gauche. Petit écran (téléphone) : menu en bas.
@Component({
  selector: 'app-shell',
  imports: [AppIcone, RouterOutlet],
  template: `
    <div class="app" [class.bureau]="large()" [class.mobile]="!large()">
      @if (large()) {
        <aside class="lateral">
          <img src="logo.png" alt="Civadis" class="lateral-logo" />
          <nav>
            @for (m of menu(); track m.page) {
              <button [class.on]="actif() === m.page" (click)="nav.aller(m.page)">
                <app-icone [nom]="m.icone" [taille]="20" [couleur]="actif() === m.page ? '#7c6bd6' : '#7a7266'" [epaisseur]="1.8" />{{ m.nom }}
              </button>
            }
          </nav>
          <div class="lateral-bas">
            <div class="moi">
              <span class="avatar">{{ session.initiales() }}</span>
              <div><b>{{ session.utilisateur() }}</b><small>{{ session.info()?.label }}</small></div>
            </div>
            <button class="sortie" (click)="session.deconnecter()"><app-icone nom="sortie" [taille]="18" couleur="#c0392b" [epaisseur]="2" />Se déconnecter</button>
          </div>
        </aside>
      }
      <main class="contenu">@if (!large()) { <img src="logo.png" alt="Civadis" class="logo-haut" /> }<router-outlet /></main>
      @if (!large()) {
        <nav class="onglets-bas">
          @for (m of menu(); track m.page) {
            <button [class.on]="actif() === m.page" [class.declarer]="m.page === 'declarer'" (click)="nav.aller(m.page)">
              <span class="pastille"><app-icone [nom]="m.icone" [taille]="m.page === 'declarer' ? 28 : 22" [couleur]="m.page === 'declarer' ? '#ffffff' : actif() === m.page ? '#a99ceb' : '#7a7266'" [epaisseur]="m.page === 'declarer' ? 2.4 : 1.8" /></span><span>{{ m.nom }}</span>
            </button>
          }
        </nav>
      }
    </div>`,
})
export class Shell {
  session = inject(Session)
  nav = inject(Nav)
  private router = inject(Router)

  // Écran large ? (se met à jour quand on redimensionne la fenêtre)
  large = inject(Ecran).large

  menu = computed(() => MENUS[this.session.role() ?? 'salarie'])

  // Page affichée, lue dans l'adresse : /app/fiche/INC-0147 → « fiche »
  private url = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd), map(() => this.router.url)),
    { initialValue: this.router.url })
  actif = computed(() => {
    const page = this.url().split('?')[0].split('/')[2] ?? ''
    return PARENT[page] ?? page
  })
}
