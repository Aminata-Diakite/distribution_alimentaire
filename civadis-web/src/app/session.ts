import { Injectable, computed, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { MOT_DE_PASSE_DEMO, ROLE_CLE, ROLES } from './data'
import { Compte, Utilisateur } from './models'
import { Store } from './store'

// Qui est connecté. L'e-mail est gardé dans le navigateur pour survivre au rechargement.
// (Démonstration : plus tard, la connexion se fera avec l'API.)
const CLE = 'civadis-compte'

@Injectable({ providedIn: 'root' })
export class Session {
  private router = inject(Router)
  private store = inject(Store)
  readonly compte = signal<Compte | null>(this.lire())
  readonly role = computed(() => this.compte()?.role ?? null)
  readonly info = computed(() => (this.role() ? ROLES[this.role()!] : null))
  readonly utilisateur = computed(() => this.compte()?.nom ?? '')
  readonly initiales = computed(() => this.utilisateur().split(' ').map((m) => m[0]).join('').slice(0, 2))

  // Un compte actif de la liste des utilisateurs, trouvé par son e-mail
  private trouver(email: string): Compte | null {
    const u: Utilisateur | undefined = this.store.utilisateurs().find((x) => x.actif && x.email === email.trim().toLowerCase())
    return u ? { email: u.email, nom: u.nom, role: ROLE_CLE[u.role] } : null
  }
  private lire(): Compte | null {
    try { return this.trouver(localStorage.getItem(CLE) ?? '') } catch { return null }
  }

  // Vérifie l'e-mail et le mot de passe. Renvoie le compte, ou null si c'est faux.
  verifier(email: string, motDePasse: string): Compte | null {
    const compte = this.trouver(email)
    return compte && motDePasse === MOT_DE_PASSE_DEMO ? compte : null
  }

  connecter(compte: Compte) {
    this.compte.set(compte)
    try { localStorage.setItem(CLE, compte.email) } catch { /* navigation privée : on ignore */ }
  }

  deconnecter() {
    this.compte.set(null)
    try { localStorage.removeItem(CLE) } catch { /* idem */ }
    this.router.navigateByUrl('/connexion')
  }
}
