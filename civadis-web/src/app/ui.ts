import { Component, computed, input, output } from '@angular/core'
import { Priorite, Statut } from './models'

// Petits éléments d'interface réutilisés partout.
// Chaque « Component » est une balise HTML à nous : <app-icone>, <app-statut>…

const CHEMINS: Record<string, string> = {
  retour: 'M15 5 8 12l7 7', recherche: 'M20 20l-3.5-3.5M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z', plus: 'M12 5v14M5 12h14',
  cloche: 'M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7zM10 20a2 2 0 0 0 4 0',
  profil: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c1-4 4-6 8-6s7 2 8 6',
  grille: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', liste: 'M7 4h10a2 2 0 0 1 2 2v14l-3-2-2 2-2-2-2 2-2-2-3 2V6a2 2 0 0 1 2-2zM9 9h6M9 13h4',
  sortie: 'M9 4H5v16h4M15 8l4 4-4 4M19 12H9', coche: 'M5 12.5 10 17 19 7', corbeille: 'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5', horloge: 'M12 4a8 8 0 1 0 8 8M12 8v4l3 2',
  drapeau: 'M5 21V4M5 4h11l-2 4 2 4H5', info: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 8v4M12 16h.01',
  croix: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM9 9l6 6M15 9l-6 6', cadenas: 'M7 11h10a2 2 0 0 1 2 2v6H5v-6a2 2 0 0 1 2-2zM8 11V8a4 4 0 0 1 8 0v3',
  lieu: 'M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  equipe: 'M9 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c.8-3.5 3-5 6-5s5.2 1.5 6 5M16 5a3.5 3.5 0 0 1 0 7M18 15c2 .5 3 2.3 3.5 5',
  batiment: 'M4 20V6l8-3 8 3v14M9 20v-5h6v5', document: 'M7 3h7l5 5v13H7zM14 3v5h5', telecharger: 'M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14',
  crayon: 'M4 20h4L19 9l-4-4L4 16z',
  fleche: 'M7 17 17 7M9 7h8v8', filtre: 'M4 8h9M17 8h3M4 16h3M11 16h9M15 6v4M9 14v4', bas: 'M6 9l6 6 6-6',
}

@Component({
  selector: 'app-icone',
  host: { style: 'display:inline-flex' },
  template: `<svg [attr.width]="taille()" [attr.height]="taille()" viewBox="0 0 24 24" fill="none"
      [attr.stroke]="couleur()" [attr.stroke-width]="epaisseur()" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true"><path [attr.d]="chemin()" /></svg>`,
})
export class AppIcone {
  nom = input.required<string>()
  taille = input(20)
  couleur = input('currentColor')
  epaisseur = input(1.9)
  chemin = computed(() => CHEMINS[this.nom()] ?? '')
}

// Statuts et priorités : icône + texte coloré, sans pastille
const STATUTS: Record<Statut, [string, string]> = {
  Nouveau: ['info', '#2f6fde'], Affecté: ['profil', '#7a4dd8'], 'En cours': ['horloge', '#e08a00'],
  Résolu: ['coche', '#1e9e6a'], Clôturé: ['cadenas', '#6a6f94'], Annulé: ['croix', '#c0392b'],
}
const PRIORITES: Record<Priorite, string> = { Critique: '#c0392b', Haute: '#e08a00', Normale: '#3a4496', Faible: '#6a6f94' }

@Component({
  selector: 'app-statut',
  imports: [AppIcone],
  template: `<span class="statut" [style.color]="couleur()"><app-icone [nom]="icone()" [taille]="16" [couleur]="couleur()" [epaisseur]="2" />{{ valeur() }}</span>`,
})
export class AppStatut {
  valeur = input.required<Statut>()
  icone = computed(() => STATUTS[this.valeur()][0])
  couleur = computed(() => STATUTS[this.valeur()][1])
}

@Component({
  selector: 'app-priorite',
  imports: [AppIcone],
  template: `
    @if (valeur(); as v) {
      <span class="prio" [style.color]="couleur()"><app-icone nom="drapeau" [taille]="14" [couleur]="couleur()" [epaisseur]="1.6" />Priorité {{ v.toLowerCase() }}</span>
    } @else {
      <span class="prio" style="color:#7a7266">Non qualifié</span>
    }`,
})
export class AppPriorite {
  valeur = input<Priorite | null>(null)
  couleur = computed(() => PRIORITES[this.valeur() ?? 'Faible'])
}

@Component({
  selector: 'app-onglets',
  template: `
    <div class="onglets" role="tablist">
      @for (o of liste(); track o) {
        <button role="tab" [attr.aria-selected]="o === actif()" [class.on]="o === actif()" (click)="changer.emit(o)">{{ o }}</button>
      }
    </div>`,
})
export class AppOnglets {
  liste = input.required<string[]>()
  actif = input.required<string>()
  changer = output<string>()
}

// En-tête de page. Ce qu'on écrit entre <app-entete>…</app-entete> (boutons) apparaît à droite.
@Component({
  selector: 'app-entete',
  imports: [AppIcone],
  template: `
    <header class="entete">
      @if (retour()) {
        <button class="retour" (click)="retourner.emit()" aria-label="Retour"><app-icone nom="retour" /></button>
      }
      <div class="entete-texte"><h2>{{ titre() }}</h2>@if (sous()) { <p>{{ sous() }}</p> }</div>
      <ng-content />
    </header>`,
})
export class AppEntete {
  titre = input.required<string>()
  sous = input('')
  retour = input(false)
  retourner = output<void>()
}

@Component({
  selector: 'app-ligne',
  imports: [AppIcone],
  host: { style: 'display:block' },
  template: `<div class="ligne"><span><app-icone [nom]="icone()" [taille]="18" couleur="#7a7266" [epaisseur]="1.8" />{{ nom() }}</span><b>{{ valeur() }}</b></div>`,
})
export class AppLigne {
  icone = input.required<string>()
  nom = input.required<string>()
  valeur = input('')
}

@Component({
  selector: 'app-barre',
  host: { style: 'display:block' },
  template: `<div class="barre"><span>{{ nom() }}</span><i><u [style.width.%]="pct()"></u></i><b>{{ valeur() }}</b></div>`,
})
export class AppBarre {
  nom = input.required<string>()
  valeur = input.required<number>()
  max = input.required<number>()
  pct = computed(() => (this.max() ? (this.valeur() / this.max()) * 100 : 0))
}
