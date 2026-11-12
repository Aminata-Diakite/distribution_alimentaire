import { Routes } from '@angular/router'
import { Login } from './login'
import { Shell } from './shell'
import { accueilRole, gardeConnexion, gardePage } from './gardes'
import { Alertes, Profil } from './pages/divers'
import { Declarer, Fiche, Incidents, Qualifier } from './pages/incidents'
import { Dashboard, Rapports } from './pages/tableaux'
import { Services, Utilisateurs, VueEnsemble } from './pages/admin'

export const routes: Routes = [
  { path: 'connexion', component: Login },
  {
    path: 'app',
    component: Shell,
    canActivate: [gardeConnexion],
    canActivateChild: [gardePage],
    children: [
      { path: '', pathMatch: 'full', canActivate: [accueilRole], children: [] },
      { path: 'liste', component: Incidents },
      { path: 'fiche/:id', component: Fiche },
      { path: 'qualifier/:id', component: Qualifier },
      { path: 'declarer', component: Declarer },
      { path: 'alertes', component: Alertes },
      { path: 'profil', component: Profil },
      { path: 'dashboard', component: Dashboard },
      { path: 'rapports', component: Rapports },
      { path: 'vue', component: VueEnsemble },
      { path: 'utilisateurs', component: Utilisateurs },
      { path: 'services', component: Services },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'connexion' },
  { path: '**', redirectTo: 'connexion' },
]
