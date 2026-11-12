import { Component, DestroyRef, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { Session } from './session'

// Page de connexion : le même écran que dans la maquette, en plein écran.
// Téléphone : écran complet. PC : décor à gauche, formulaire à droite.
@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="scene mob">
      <!-- Décor comme la maquette Figma : bloc beige arrondi, logo qui flotte, deux blocs en bas -->
      <div class="art">
        <div class="tete"></div>
        <div class="pied lav"></div>
        <div class="pied nuit"></div>
        <div class="logo" title="Rejouer l'intro" (click)="intro()">
          <img src="logo.png" alt="Civadis" /><div class="sh"></div>
          <span class="slogan">Anomalies &amp; incidents</span>
        </div>
      </div>

      <div class="panels">
        <!-- Panneau 1 : connexion -->
        <form class="panel login" aria-label="Connexion" (submit)="seConnecter($event)" novalidate>
          <h1>Connexion</h1>
          <p class="lead">Accédez à votre espace Civadis.</p>
          <div class="fld">
            <svg class="i" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 8 8 6 8-6" /></svg>
            <input type="email" placeholder="prenom.nom@civadis.ci" aria-label="E-mail" autocomplete="username" [ngModel]="email()" (ngModelChange)="email.set($event)" name="em" />
          </div>
          <div class="fld">
            <svg class="i" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
            <input [type]="voir() ? 'text' : 'password'" placeholder="••••••••" aria-label="Mot de passe" style="padding-right:78px" autocomplete="current-password" [ngModel]="mdp()" (ngModelChange)="mdp.set($event)" name="mp" />
            <button class="eye" type="button" (click)="voir.set(!voir())">{{ voir() ? 'Masquer' : 'Afficher' }}</button>
          </div>
          <div class="row">
            <label><input type="checkbox" checked /> Rester connecté</label>
            <button class="link" type="button">Mot de passe oublié ?</button>
          </div>
          <div class="erreur" role="alert" [hidden]="!erreur()">{{ erreur() }}</div>
          <button class="btn" [class.busy]="busyLogin()" type="submit"><span>{{ busyLogin() ? 'Connexion…' : 'Se connecter' }}</span><b>→</b></button>
        </form>
      </div>
    </div>


    <!-- PC : plein écran, panneau organique + vagues -->
    <main class="pc">
      <div class="card">
        <div class="slider">
          <svg class="shape n" viewBox="0 0 660 660" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="pd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4A423B" /><stop offset="1" stop-color="#1F1B18" /></linearGradient>
              <linearGradient id="pl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D6CFF6" /><stop offset="1" stop-color="#B9AEEF" /></linearGradient>
              <linearGradient id="pb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EDE5D4" /><stop offset=".6" stop-color="#F1EBDD" /><stop offset="1" stop-color="#F6F1E6" /></linearGradient>
            </defs>
            <path [attr.fill]="degrade('pd')" d="M0 0H616 C556 120 706 225 646 340 C586 455 476 535 526 660H0Z"/>
            <path [attr.fill]="degrade('pl')" d="M0 0H588 C528 120 678 225 618 340 C558 455 448 535 498 660H0Z"/>
            <path [attr.fill]="degrade('pb')" d="M0 0H560C500 120 650 225 590 340C530 455 420 535 470 660H0Z">
              <animate attributeName="d" dur="9s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"
                values="M0 0H560C500 120 650 225 590 340C530 455 420 535 470 660H0Z;M0 0H540C520 130 620 215 610 340C600 465 450 545 450 660H0Z;M0 0H560C500 120 650 225 590 340C530 455 420 535 470 660H0Z" />
            </path>
          </svg>
          <section class="hero">
            <div class="fl"><img src="logo.png" alt="Civadis" /><div class="sh"></div></div>
            <div class="txt">
              <div class="a"><h3>Content de vous revoir</h3><p>Suivez vos incidents en temps réel.</p></div>
            </div>
          </section>
        </div>

        <div class="lab haut at-l show-login">Gestion des anomalies et incidents</div>
        <div class="lab bas-l at-l show-login">© 2026 Civadis</div>
        <div class="lab bas-r at-r show-login">Un problème ? Contactez votre administrateur.</div>

        <div class="side r">
          <section class="pane login" aria-label="Connexion">
            <form (submit)="seConnecter($event)" novalidate>
              <h1>Connexion</h1>
              <p class="lead">Accédez à votre espace Civadis.</p>
              <label for="pc-em">Adresse e-mail</label>
              <input id="pc-em" type="email" placeholder="nom@civadis.ci" autocomplete="username" [ngModel]="email()" (ngModelChange)="email.set($event)" name="em" />
              <label for="pc-pw">Mot de passe</label>
              <div class="field">
                <input id="pc-pw" [type]="voir() ? 'text' : 'password'" placeholder="Votre mot de passe" autocomplete="current-password" style="padding-right:70px" [ngModel]="mdp()" (ngModelChange)="mdp.set($event)" name="mp" />
                <button type="button" class="eye" (click)="voir.set(!voir())">{{ voir() ? 'Masquer' : 'Afficher' }}</button>
              </div>
              <div class="row">
                <label class="check"><input type="checkbox" checked /> Rester connecté</label>
                <button type="button" class="link">Mot de passe oublié ?</button>
              </div>
              <div class="erreur" role="alert" [hidden]="!erreur()">{{ erreur() }}</div>
              <button class="btn" [class.busy]="busyLogin()" type="submit"><span>{{ busyLogin() ? 'Connexion…' : 'Se connecter' }}</span><b>→</b></button>
            </form>
          </section>
        </div>
      </div>
    </main>

    <!-- Intro : l'écran de démarrage qui monte et disparaît -->
      @if (splashActif()) {
        <div class="splash" [class.out]="splashOut()" (click)="cacherSplash()">
          <div class="q1"></div><div class="q2"></div>
          <div class="fl"><img src="logo.png" alt="Civadis" /><div class="sh"></div></div>
          <div class="tg">Anomalies &amp; incidents</div>
          <div class="bar"><i></i></div>
        </div>
      }`,
})
export class Login {
  private router = inject(Router)
  private session = inject(Session)

  email = signal('')
  mdp = signal('')
  erreur = signal('')

  voir = signal(false)          // afficher le mot de passe
  busyLogin = signal(false)

  // Intro
  splashActif = signal(true)
  splashOut = signal(false)
  private minuteries: ReturnType<typeof setTimeout>[] = []

  // Les dégradés SVG : on donne l'adresse complète de la page, sinon certains
  // navigateurs ne les trouvent pas à cause de <base href="/">.
  private base = location.href.split('#')[0]
  degrade(id: string) { return `url(${this.base}#${id})` }

  constructor() {
    this.lancerIntro()
    inject(DestroyRef).onDestroy(() => { this.minuteries.forEach(clearTimeout);  })
  }

  // ----- intro -----
  private apres(ms: number, f: () => void) { this.minuteries.push(setTimeout(f, ms)) }
  private lancerIntro() {
    this.splashOut.set(false)
    this.splashActif.set(true)
    this.apres(2300, () => this.cacherSplash())
  }
  cacherSplash() {
    this.splashOut.set(true)
    this.apres(1500, () => this.splashActif.set(false))
  }
  intro() {                       // clic sur le logo : rejoue l'intro
    this.minuteries.forEach(clearTimeout)
    this.splashActif.set(false)
    this.apres(30, () => this.lancerIntro())
  }

  // ----- boutons (démonstration : pas encore de serveur) -----
  seConnecter(e?: Event) {
    e?.preventDefault()
    this.erreur.set('')
    this.busyLogin.set(true)
    this.apres(700, () => {
      this.busyLogin.set(false)
      const compte = this.session.verifier(this.email(), this.mdp())
      if (!compte) { this.erreur.set('E-mail ou mot de passe incorrect.'); return }
      this.session.connecter(compte)
      this.router.navigateByUrl('/app')
    })
  }
}
