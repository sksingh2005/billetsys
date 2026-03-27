import { Component } from 'react';

export default class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error('Route rendering failed', error);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <section className="panel">
          <h2>Unable to load this page</h2>
          <p className="error-text">{this.state.error?.message || 'A route-level error occurred while loading the page.'}</p>
        </section>
      );
    }

    return this.props.children;
  }
}
