import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error no controlat a la interfície:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-4 text-center">
        <p className="font-serif text-3xl font-semibold text-ink">Alguna cosa ha fallat</p>
        <p className="max-w-md text-sm text-muted">
          S'ha produït un error inesperat a la pàgina. Prova a recarregar; si el problema continua, contacta amb el
          centre.
        </p>
        <button
          onClick={() => {
            this.setState({ error: null })
            window.location.href = '/'
          }}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-contrast transition-colors hover:bg-primary-hover"
        >
          Torna a l'inici
        </button>
      </div>
    )
  }
}
