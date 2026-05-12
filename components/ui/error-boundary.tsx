"use client"

import {
  Component,
  type ComponentType,
  type GetDerivedStateFromError,
  type PropsWithChildren,
} from "react"

export interface ErrorBoundaryProps extends PropsWithChildren {
  fallback: ComponentType<{ error: Error | string | null }>
}

interface ErrorBoundaryState {
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {}

  static getDerivedStateFromError: GetDerivedStateFromError<ErrorBoundaryProps, ErrorBoundaryState> = (error) => ({ error })

  componentDidCatch(error: Error) {
    console.error("Unhandled React error:", error)
    this.setState({ error })
  }

  render() {
    const { fallback: Fallback, children } = this.props
    const { error } = this.state

    return error ? <Fallback error={error} /> : children
  }
}
