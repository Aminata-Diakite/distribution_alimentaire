// Formes décoratives de la page de connexion : forme A (connexion) et forme B (demande d'accès).
// L'animation passe de A à B en calculant les points intermédiaires.
export const FORMES = {
  tp: ['M0,0H390V196C390,262 300,296 195,296C90,296 0,262 0,196Z',
       'M0,0H390V170C390,250 320,272 230,282C130,294 0,300 0,226Z'],
  bg: ['M0,70C70,20 150,110 240,80C310,57 350,30 390,40V190H0Z',
       'M0,40C40,30 80,57 150,80C240,110 320,20 390,70V190H0Z'],
  bn: ['M0,120C80,75 170,150 260,118C320,96 360,80 390,86V190H0Z',
       'M0,86C30,80 70,96 130,118C220,150 310,75 390,120V190H0Z'],
} as const

export type NomForme = keyof typeof FORMES

const NOMBRE = /-?\d+(\.\d+)?/g
const CHIFFRES = Object.fromEntries(
  Object.entries(FORMES).map(([k, [a, b]]) => [k, [a.match(NOMBRE)!.map(Number), b.match(NOMBRE)!.map(Number)]]),
) as Record<NomForme, number[][]>

// Dessine la forme entre A (t = 0) et B (t = 1)
export function formeEntre(k: NomForme, t: number): string {
  const [a, b] = CHIFFRES[k]
  let i = 0
  return FORMES[k][0].replace(NOMBRE, () => {
    const v = a[i] + (b[i] - a[i]) * t
    i++
    return v.toFixed(1)
  })
}
