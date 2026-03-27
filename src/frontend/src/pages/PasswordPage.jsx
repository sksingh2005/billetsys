import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import DataState from '../components/common/DataState';

export default function PasswordPage({ sessionState }) {
  const location = useLocation();
  const [formState, setFormState] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [saveState, setSaveState] = useState({ saving: false, error: '', saved: false });
  const routeError = new URLSearchParams(location.search).get('error') || '';

  const submit = async event => {
    event.preventDefault();
    setSaveState({ saving: true, error: '', saved: false });
    try {
      const response = await fetch('/api/profile/password', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      });
      if (!response.ok) {
        throw new Error((await response.text()) || 'Unable to update password.');
      }
      setFormState({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setSaveState({ saving: false, error: '', saved: true });
    } catch (error) {
      setSaveState({ saving: false, error: error.message || 'Unable to update password.', saved: false });
    }
  };

  return (
    <section className="panel auth-panel">
      <DataState
        state={{ loading: false, unauthorized: !sessionState.data?.authenticated, forbidden: false, error: '', empty: false }}
        emptyMessage=""
        signInHref="/login"
      >
        <form className="auth-form" onSubmit={submit}>
          <label>
            Old password
            <input
              type="password"
              value={formState.oldPassword}
              onChange={event => setFormState(current => ({ ...current, oldPassword: event.target.value }))}
              required
            />
          </label>
          <label>
            New password
            <input
              type="password"
              value={formState.newPassword}
              onChange={event => setFormState(current => ({ ...current, newPassword: event.target.value }))}
              required
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              value={formState.confirmPassword}
              onChange={event => setFormState(current => ({ ...current, confirmPassword: event.target.value }))}
              required
            />
          </label>
          {(saveState.error || (!saveState.saved && routeError)) && <p className="error-text">{saveState.error || routeError}</p>}
          {saveState.saved && <p className="success-text">Password updated.</p>}
          <div className="button-row">
            <button type="submit" className="primary-button" disabled={saveState.saving}>
              {saveState.saving ? 'Saving...' : 'Update'}
            </button>
          </div>
        </form>
      </DataState>
    </section>
  );
}
