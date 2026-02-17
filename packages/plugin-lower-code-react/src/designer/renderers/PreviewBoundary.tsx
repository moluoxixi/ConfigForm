import type React from 'react'
import { Component } from 'react'

interface PreviewBoundaryProps {
  fallback: React.ReactElement
  children: React.ReactNode
}

interface PreviewBoundaryState {
  hasError: boolean
}

export class PreviewBoundary extends Component<PreviewBoundaryProps, PreviewBoundaryState> {
  state: PreviewBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): PreviewBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(): void {
    // noop: fallback UI is handled by getDerivedStateFromError.
  }

  componentDidUpdate(prevProps: PreviewBoundaryProps): void {
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false })
    }
  }

  render(): React.ReactElement {
    if (this.state.hasError)
      return this.props.fallback
    return <>{this.props.children}</>
  }
}
