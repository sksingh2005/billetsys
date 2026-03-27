import { useEffect, useState } from 'react';

export default function useJson(url) {
  const [state, setState] = useState({
    loading: Boolean(url),
    error: '',
    unauthorized: false,
    forbidden: false,
    empty: false,
    data: null
  });

  useEffect(() => {
    if (!url) {
      setState({ loading: false, error: '', unauthorized: false, forbidden: false, empty: true, data: null });
      return undefined;
    }

    let active = true;
    setState(current => ({ ...current, loading: true, error: '', unauthorized: false, forbidden: false, empty: false }));

    fetch(url, { credentials: 'same-origin', cache: 'no-store' })
      .then(async response => {
        if (response.status === 401) {
          return { unauthorized: true };
        }
        if (response.status === 403) {
          return { forbidden: true };
        }
        if (!response.ok) {
          throw new Error(`Unable to load ${url}`);
        }
        const data = await response.json();
        return { data };
      })
      .then(result => {
        if (!active) {
          return;
        }
        if (result.unauthorized) {
          setState({ loading: false, error: '', unauthorized: true, forbidden: false, empty: false, data: null });
          return;
        }
        if (result.forbidden) {
          setState({ loading: false, error: '', unauthorized: false, forbidden: true, empty: false, data: null });
          return;
        }
        const isEmptyList = Array.isArray(result.data?.items) && result.data.items.length === 0;
        setState({
          loading: false,
          error: '',
          unauthorized: false,
          forbidden: false,
          empty: isEmptyList,
          data: result.data
        });
      })
      .catch(error => {
        if (active) {
          setState({
            loading: false,
            error: error.message || 'Unable to load data',
            unauthorized: false,
            forbidden: false,
            empty: false,
            data: null
          });
        }
      });

    return () => {
      active = false;
    };
  }, [url]);

  return state;
}
