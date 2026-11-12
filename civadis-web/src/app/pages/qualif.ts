import { Component, computed, inject, input, output, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Incident, Priorite } from '../models'
import { Store } from '../store'

export interface ReponseQualif { gravite: Priorite; priorite: Priorite; intervenant: string | null; service: string }

// Le formulaire « Qualifier et affecter ». Utilisé dans la fenêtre (PC) et dans la page (téléphone).
@Component({
  selector: 'app-qualif',
  imports: [FormsModule],
  template: `
    <h2>Qualifier et affecter</h2>
    <p class="qsous">{{ incident().id }} - {{ incident().titre }}</p>

    <h4 class="qetiq">Gravité</h4>
    <div class="seg" role="radiogroup" aria-label="Gravité">
      @for (p of niveaux; track p) { <button type="button" [class.on]="p === gravite()" (click)="gravite.set(p)">{{ p }}</button> }
    </div>

    <h4 class="qetiq">Priorité</h4>
    <div class="seg" role="radiogroup" aria-label="Priorité">
      @for (p of niveaux; track p) { <button type="button" [class.on]="p === priorite()" (click)="priorite.set(p)">{{ p }}</button> }
    </div>

    <h4 class="qetiq">Affecter à</h4>
    <div class="seg" role="radiogroup" aria-label="Affecter à">
      <button type="button" [class.on]="mode() === 'personne'" (click)="mode.set('personne')">Une personne</button>
      <button type="button" [class.on]="mode() === 'service'" (click)="mode.set('service')">Tout un service</button>
    </div>

    @if (mode() === 'personne') {
      <label class="qlabel" for="q-interv">Intervenant</label>
      <select id="q-interv" class="champ" [ngModel]="intervenant()" (ngModelChange)="intervenant.set($event)">
        @for (u of intervenants(); track u.id) { <option [value]="u.nom">{{ u.nom }} · {{ u.service }}</option> }
      </select>
    } @else {
      <label class="qlabel" for="q-serv">Service</label>
      <select id="q-serv" class="champ" [ngModel]="service()" (ngModelChange)="service.set($event)">
        @for (s of store.services(); track s) { <option [value]="s">{{ s }}</option> }
      </select>
    }

    <div class="qboutons">
      <button type="button" class="btn-clair" (click)="retour.emit()">Retour</button>
      <button type="button" class="btn-fonce" [disabled]="mode() === 'personne' && !intervenant()" (click)="valider()">Affecter <span class="fl-violet">→</span></button>
    </div>`,
})
export class Qualif {
  store = inject(Store)
  incident = input.required<Incident>()
  retour = output<void>()
  affecter = output<ReponseQualif>()

  niveaux: Priorite[] = ['Faible', 'Normale', 'Haute', 'Critique']
  gravite = signal<Priorite>('Normale')
  priorite = signal<Priorite>('Normale')
  mode = signal<'personne' | 'service'>('personne')
  intervenants = computed(() => this.store.utilisateurs().filter((u) => u.role === 'Intervenant' && u.actif))
  intervenant = signal(this.store.utilisateurs().find((u) => u.role === 'Intervenant' && u.actif)?.nom ?? '')
  service = signal(this.store.services()[0])

  valider() {
    if (this.mode() === 'personne') {
      const u = this.intervenants().find((x) => x.nom === this.intervenant())
      this.affecter.emit({ gravite: this.gravite(), priorite: this.priorite(), intervenant: this.intervenant(), service: u?.service ?? this.service() })
    } else {
      this.affecter.emit({ gravite: this.gravite(), priorite: this.priorite(), intervenant: null, service: this.service() })
    }
  }
}
