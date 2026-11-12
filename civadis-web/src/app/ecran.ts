import { Injectable, signal } from '@angular/core'

// Largeur de l'écran : « large » = PC ou tablette (menu à gauche), sinon téléphone (menu en bas).
@Injectable({ providedIn: 'root' })
export class Ecran {
  readonly large = signal(window.innerWidth >= 900)
  constructor() {
    window.addEventListener('resize', () => this.large.set(window.innerWidth >= 900))
  }
}
