/** Domini en minúscules d'un correu ("laia@Escola.CAT" -> "escola.cat"). */
export function dominiDeCorreu(email: string): string {
  return email.trim().toLowerCase().split('@')[1] ?? ''
}
