/** Bloc bàsic d'esquelet (placeholder animat) mentre es carreguen dades. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}

/** Targeta genèrica amb un títol i N línies de text, amb la mateixa forma que Card. */
export function SkeletonCard({ lines = 3, hasButton = false, className = '' }: { lines?: number; hasButton?: boolean; className?: string }) {
  const amplades = ['w-full', 'w-11/12', 'w-2/3', 'w-5/6', 'w-3/4']
  return (
    <div className={`rounded-lg border border-line bg-surface p-4 shadow-sm sm:p-5 ${className}`}>
      <Skeleton className="mb-3 h-4 w-1/2" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={`h-3 ${amplades[i % amplades.length]}`} />
        ))}
      </div>
      {hasButton && <Skeleton className="mt-4 h-8 w-28" />}
    </div>
  )
}

/** Targeta amb la mateixa silueta que TargetaEstudi (resultats de cerca/recomanacions). */
export function SkeletonTargetaEstudi() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 shadow-sm">
      <div>
        <Skeleton className="mb-2 h-3 w-24" />
        <Skeleton className="mb-1.5 h-5 w-5/6" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-14" />
      </div>
      <div className="mt-auto flex gap-2 pt-1">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

export function SkeletonGridTargetes({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => <SkeletonTargetaEstudi key={i} />)}
    </div>
  )
}

/** Esquelet genèric de pàgina, només com a darrer recurs quan cap esquelet específic
 * encaixa amb la ruta (p. ex. pàgines d'error). */
export function SkeletonPagina({ columnes = 2 }: { columnes?: 1 | 2 | 3 }) {
  return (
    <div className="space-y-5">
      <div>
        <Skeleton className="mb-2 h-3 w-32" />
        <Skeleton className="h-7 w-64" />
      </div>
      <div className={`grid gap-4 ${columnes === 3 ? 'sm:grid-cols-3' : columnes === 2 ? 'sm:grid-cols-2' : ''}`}>
        {Array.from({ length: columnes * 2 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
      </div>
    </div>
  )
}

/** Esquelet per a una pàgina de fitxa/detall: capçalera + dues columnes de targetes.
 * Fa servir /estudi/:id, /orientador/alumne/:id. */
export function SkeletonFitxa() {
  return (
    <div className="space-y-5">
      <div>
        <Skeleton className="mb-2 h-3 w-24" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="mt-2 h-4 w-1/3" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={4} />
        </div>
        <div className="space-y-5">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={2} />
        </div>
      </div>
    </div>
  )
}

/** /cercador: títol, barra de cerca + botó, pestanyes, i graella de filtres + resultats. */
export function SkeletonCercador() {
  return (
    <div className="space-y-5">
      <div>
        <Skeleton className="mb-2 h-3 w-40" />
        <Skeleton className="h-7 w-72" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-10 w-44" />
      </div>
      <Skeleton className="h-10 w-full max-w-xl" />
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <SkeletonCard lines={8} />
        <SkeletonGridTargetes count={6} />
      </div>
    </div>
  )
}

/** /comparar: capçalera amb botó, descripció, i una taula amb una columna per estudi comparat
 * (tantes com `columnes` indiqui) i una filera per cada característica comparada. */
export function SkeletonComparar({ columnes = 2 }: { columnes?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-8 w-40" />
      </div>
      <Skeleton className="h-4 w-full max-w-xl" />
      <div className="overflow-x-auto rounded-lg border border-line bg-surface p-4 shadow-sm sm:p-5">
        <div className="flex gap-4 border-b border-line pb-3">
          <div className="w-24 shrink-0" />
          {Array.from({ length: columnes }).map((_, i) => (
            <div key={i} className="min-w-[120px] flex-1 space-y-1.5">
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
        <div className="space-y-3 pt-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-3 w-20 shrink-0" />
              {Array.from({ length: columnes }).map((_, j) => <Skeleton key={j} className="h-3 min-w-[120px] flex-1" />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** /recomanacions: capçalera, avís de test pendent, i graella de targetes recomanades. */
export function SkeletonRecomanacions() {
  return (
    <div className="space-y-5">
      <div>
        <Skeleton className="mb-2 h-4 w-56" />
        <Skeleton className="h-7 w-72" />
      </div>
      <SkeletonCard lines={2} />
      <Skeleton className="h-5 w-48" />
      <SkeletonGridTargetes count={4} />
    </div>
  )
}

/** /llistes: columna de llistes + cercador a l'esquerra, contingut de la llista a la dreta. */
export function SkeletonLlistes() {
  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <SkeletonCard lines={5} />
    </div>
  )
}

/** /admin: capçalera, 3 targetes d'estadístiques, i dues targetes de llistes. */
export function SkeletonAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-2 h-4 w-40" />
        <Skeleton className="h-7 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <SkeletonCard lines={3} />
      <SkeletonCard lines={3} />
    </div>
  )
}

/** /orientador: capçalera del grup + dues targetes de gràfics. */
export function SkeletonOrientadorDashboard() {
  return (
    <div className="space-y-5">
      <div>
        <Skeleton className="mb-2 h-3 w-24" />
        <Skeleton className="h-7 w-48" />
      </div>
      <SkeletonCard lines={3} />
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonCard lines={5} />
        <SkeletonCard lines={5} />
      </div>
    </div>
  )
}

/** Pàgina d'inici (/): heroi, dues targetes "alumnes/orientadors" i la secció de FAQ. */
export function SkeletonHome() {
  return (
    <div className="space-y-16">
      <section className="skeleton flex flex-col items-center justify-center gap-4 !rounded-2xl px-5 py-16 sm:py-24">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-3/4 max-w-xl" />
        <Skeleton className="h-4 w-2/3 max-w-2xl" />
        <div className="flex gap-3 pt-3">
          <Skeleton className="h-11 w-44" />
          <Skeleton className="h-11 w-48" />
        </div>
      </section>
      <section className="space-y-4">
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-3 w-32" />
          <Skeleton className="mx-auto h-7 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-line bg-surface">
              <Skeleton className="aspect-[4/3] w-full !rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="grid gap-6 sm:grid-cols-2">
        <SkeletonCard lines={5} />
        <SkeletonCard lines={5} />
      </section>
      <section className="space-y-4">
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-3 w-32" />
          <Skeleton className="mx-auto h-7 w-56" />
        </div>
        <div className="mx-auto max-w-2xl space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </section>
    </div>
  )
}

/** /login: panell decoratiu (escriptori) + targeta de formulari. */
export function SkeletonLogin() {
  return (
    <div className="mx-auto grid max-w-4xl gap-10 py-6 lg:grid-cols-2 lg:items-center">
      <Skeleton className="hidden aspect-[3/4] w-full !rounded-2xl lg:block" />
      <div>
        <Skeleton className="mb-4 h-7 w-40 lg:hidden" />
        <SkeletonCard lines={2} hasButton />
      </div>
    </div>
  )
}

/** /registre: capçalera, pestanyes alumne/tutor, i targeta de formulari. */
export function SkeletonRegistre() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-7 w-44" />
      <Skeleton className="h-10 w-full" />
      <SkeletonCard lines={5} hasButton />
    </div>
  )
}

/** /tests: capçalera i graella de 3 targetes de test. */
export function SkeletonTests() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <SkeletonCard lines={3} hasButton />
        <SkeletonCard lines={3} hasButton />
        <SkeletonCard lines={3} hasButton />
      </div>
    </div>
  )
}

/** /tests/:testId: barra de progrés + targeta de la pregunta + botons de navegació. */
export function SkeletonTestDetall() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Skeleton className="h-14 w-full rounded-md" />
      <Skeleton className="h-3 w-40" />
      <SkeletonCard lines={3} />
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  )
}

/** /perfil: avatar + nom, i una pila de targetes (dades, decisió, tests, exportar). */
export function SkeletonPerfil() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-6 w-40" />
        </div>
      </div>
      <SkeletonCard lines={3} hasButton />
      <SkeletonCard lines={1} />
      <SkeletonCard lines={3} />
      <SkeletonCard lines={1} hasButton />
    </div>
  )
}

/** /guia: capçalera i graella d'articles. */
export function SkeletonGuia() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
      </div>
    </div>
  )
}

/** /guia/:slug: enllaç de tornada, títol i una targeta de text llarg. */
export function SkeletonGuiaArticle() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-7 w-2/3" />
      <SkeletonCard lines={6} />
    </div>
  )
}

/** /benvinguda: capçalera curta i una targeta amb diverses preguntes. */
export function SkeletonBenvinguda() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-14 w-full rounded-md" />
      <SkeletonCard lines={6} />
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  )
}

/** Pàgines de text llarg (política de privacitat, avís legal): títol i blocs de paràgrafs. */
export function SkeletonTextPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Skeleton className="h-7 w-56" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  )
}
