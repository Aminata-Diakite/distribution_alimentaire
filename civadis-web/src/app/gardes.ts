import { inject } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router } from '@angular/router'
import { MENUS } from './menus'
import { Session } from './session'

// Pas connecté → retour à la page de connexion
export const gardeConnexion: CanActivateFn = () => {
  const session = inject(Session)
  return session.role() ? true : inject(Router).createUrlTree(['/connexion'])
}

// /app tout seul → première page du menu du rôle
export const accueilRole: CanActivateFn = () => {
  const role = inject(Session).role()
  return inject(Router).createUrlTree(['/app', role ? MENUS[role][0].page : 'liste'])
}

// Chaque rôle n'ouvre que ses pages (même en tapant l'adresse à la main)
export const gardePage: CanActivateChildFn = (route: ActivatedRouteSnapshot) => {
  const role = inject(Session).role()
  const page = (route.routeConfig?.path ?? '').split('/')[0]
  if (page === '') return true
  if (!role) return inject(Router).createUrlTree(['/connexion'])
  const permises = MENUS[role].map((m) => m.page)
  permises.push('fiche')
  if (role === 'responsable') permises.push('qualifier')
  return permises.includes(page) ? true : inject(Router).createUrlTree(['/app', MENUS[role][0].page])
}
