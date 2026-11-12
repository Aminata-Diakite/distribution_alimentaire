import { Location } from '@angular/common'
import { Injectable, inject } from '@angular/core'
import { Router } from '@angular/router'
import { MENUS } from './menus'
import { Session } from './session'

// Navigation entre les pages
@Injectable({ providedIn: 'root' })
export class Nav {
  private router = inject(Router)
  private lieu = inject(Location)
  private session = inject(Session)

  aller(page: string, param?: string) {
    this.router.navigate(param ? ['/app', page, param] : ['/app', page])
    window.scrollTo(0, 0)
  }

  retour() {
    if (history.length > 1) this.lieu.back()
    else this.aller(MENUS[this.session.role() ?? 'salarie'][0].page)
  }
}
