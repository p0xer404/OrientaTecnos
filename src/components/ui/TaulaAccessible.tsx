/** Taula de dades oculta visualment (però llegible per lectors de pantalla) que acompanya
 * un gràfic, perquè les dades no quedin només disponibles com a forma visual. */
export function TaulaAccessible({ titol, columnes, files }: { titol: string; columnes: string[]; files: (string | number)[][] }) {
  return (
    <table className="sr-only">
      <caption>{titol}</caption>
      <thead>
        <tr>
          {columnes.map((c) => (
            <th key={c} scope="col">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {files.map((fila, i) => (
          <tr key={i}>
            {fila.map((valor, j) => (
              <td key={j}>{valor}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
