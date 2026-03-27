import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DataState from '../components/common/DataState';
import useJson from '../hooks/useJson';
import { PATHS } from '../routes/paths';
import { postForm } from '../utils/api';
import { levelColorMarker } from '../utils/formatting';
import { SmartLink } from '../utils/routing.jsx';

export default function LevelFormPage({ sessionState, mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const levelState = useJson(mode === 'edit' && id ? `/api/levels/${id}` : '/api/levels/bootstrap');
  const level = levelState.data;
  const [formState, setFormState] = useState(null);
  const [saveState, setSaveState] = useState({ saving: false, error: '' });
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!level) {
      return;
    }
    setFormState({
      name: level.name || '',
      description: level.description || '',
      level: String(level.level ?? level.defaultLevel ?? 0),
      color: level.color || level.defaultColor || 'White',
      fromDay: String(level.fromDay ?? level.defaultFromDay ?? 1),
      fromTime: String(level.fromTime ?? level.defaultFromTime ?? 0),
      toDay: String(level.toDay ?? level.defaultToDay ?? 7),
      toTime: String(level.toTime ?? level.defaultToTime ?? 23),
      countryId: level.countryId ? String(level.countryId) : level.defaultCountryId ? String(level.defaultCountryId) : '',
      timezoneId: level.timezoneId ? String(level.timezoneId) : level.defaultTimezoneId ? String(level.defaultTimezoneId) : ''
    });
  }, [level]);

  const availableTimezones = level?.timezones?.filter(timezone => !formState?.countryId || String(timezone.countryId) === formState.countryId) || [];

  const submit = async event => {
    event.preventDefault();
    if (!formState) {
      return;
    }
    setSaveState({ saving: true, error: '' });
    try {
      await postForm(isEdit ? `${PATHS.levels}/${id}` : PATHS.levels, [
        ['name', formState.name],
        ['description', formState.description],
        ['level', formState.level],
        ['color', formState.color],
        ['fromDay', formState.fromDay],
        ['fromTime', formState.fromTime],
        ['toDay', formState.toDay],
        ['toTime', formState.toTime],
        ['countryId', formState.countryId],
        ['timezoneId', formState.timezoneId]
      ]);
      navigate(PATHS.levels);
    } catch (error) {
      setSaveState({ saving: false, error: error.message || 'Unable to save level.' });
      return;
    }
    setSaveState({ saving: false, error: '' });
  };

  const deleteLevel = async () => {
    if (!id || !window.confirm('Delete this level?')) {
      return;
    }
    setSaveState({ saving: true, error: '' });
    try {
      await postForm(`${PATHS.levels}/${id}/delete`, []);
      navigate(PATHS.levels);
    } catch (error) {
      setSaveState({ saving: false, error: error.message || 'Unable to delete level.' });
      return;
    }
    setSaveState({ saving: false, error: '' });
  };

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>{isEdit ? 'Edit level' : 'New level'}</h2>
        </div>
      </div>

      <DataState state={levelState} emptyMessage="Level not found." signInHref={sessionState.data?.homePath || '/login'}>
        {formState && level && (
          <form className="owner-form" onSubmit={submit}>
            <div className={isEdit ? 'form-card ticket-detail-card' : ''}>
              <div className={isEdit ? 'owner-form owner-detail-form' : ''}>
                <div className={`owner-form-grid${isEdit ? ' ticket-detail-grid' : ''}`}>
                  <label>
                    Name
                    <input value={formState.name} onChange={event => setFormState(current => ({ ...current, name: event.target.value }))} required />
                  </label>
                  <label>
                    Level
                    <input type="number" min="0" value={formState.level} onChange={event => setFormState(current => ({ ...current, level: event.target.value }))} required />
                  </label>
                  <label>
                    Color
                    <select value={formState.color} onChange={event => setFormState(current => ({ ...current, color: event.target.value }))}>
                      {(level.colorOptions || []).map(option => (
                        <option key={option.value} value={option.value}>
                          {`${levelColorMarker(option.value)} ${option.display || `(${option.value})`}`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Country
                    <select
                      value={formState.countryId}
                      onChange={event => {
                        const nextCountryId = event.target.value;
                        const timezoneStillValid = availableTimezones.some(timezone => String(timezone.id) === formState.timezoneId);
                        setFormState(current => ({
                          ...current,
                          countryId: nextCountryId,
                          timezoneId: timezoneStillValid ? current.timezoneId : ''
                        }));
                      }}
                    >
                      <option value="">Select a country</option>
                      {(level.countries || []).map(country => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    From day
                    <select value={formState.fromDay} onChange={event => setFormState(current => ({ ...current, fromDay: event.target.value }))}>
                      {(level.dayOptions || []).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    To day
                    <select value={formState.toDay} onChange={event => setFormState(current => ({ ...current, toDay: event.target.value }))}>
                      {(level.dayOptions || []).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Time zone
                    <select value={formState.timezoneId} onChange={event => setFormState(current => ({ ...current, timezoneId: event.target.value }))}>
                      <option value="">Select a time zone</option>
                      {availableTimezones.map(timezone => (
                        <option key={timezone.id} value={timezone.id}>
                          {timezone.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="detail-card-spacer" aria-hidden="true" />
                  <label>
                    From time
                    <select value={formState.fromTime} onChange={event => setFormState(current => ({ ...current, fromTime: event.target.value }))}>
                      {(level.hourOptions || []).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    To time
                    <select value={formState.toTime} onChange={event => setFormState(current => ({ ...current, toTime: event.target.value }))}>
                      {(level.hourOptions || []).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-span-2">
                    Description
                    <textarea rows={6} value={formState.description} onChange={event => setFormState(current => ({ ...current, description: event.target.value }))} required />
                  </label>
                </div>
              </div>
            </div>

            {saveState.error && <p className="error-text">{saveState.error}</p>}

            <div className={`button-row${isEdit ? ' button-row-split' : ''}`}>
              {isEdit && (
                <button type="button" className="secondary-button danger-button" onClick={deleteLevel} disabled={saveState.saving}>
                  Delete
                </button>
              )}
              <button type="submit" className="primary-button" disabled={saveState.saving}>
                {saveState.saving ? 'Saving...' : isEdit ? 'Save' : 'Create level'}
              </button>
              {!isEdit && (
                <SmartLink className="secondary-button" href={isEdit && id ? `${PATHS.levels}/${id}` : PATHS.levels}>
                  Cancel
                </SmartLink>
              )}
            </div>
          </form>
        )}
      </DataState>
    </section>
  );
}
