import { useEffect, useState } from 'react';

export default function useText(url) {
  const [state, setState] = useState({
    loading: Boolean(url),
    error: '',
    data: ''
  });

  useEffect(() => {
    if (!url) {
      setState({ loading: false, error: '', data: '' });
      return undefined;
    }

    let active = true;
    setState(current => ({ ...current, loading: true, error: '' }));

    fetch(url, { credentials: 'same-origin', cache: 'no-store' })
      .then(async response => {
        if (!response.ok) {
          throw new Error(`Unable to load ${url}`);
        }
        return response.text();
      })
      .then(data => {
        if (active) {
          setState({ loading: false, error: '', data });
        }
      })
      .catch(error => {
        if (active) {
          setState({
            loading: false,
            error: error.message || 'Unable to load data',
            data: ''
          });
        }
      });

    return () => {
      active = false;
    };
  }, [url]);

  return state;
}
