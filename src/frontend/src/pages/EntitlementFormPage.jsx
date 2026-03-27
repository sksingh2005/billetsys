import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useJson from '../hooks/useJson';
import DataState from '../components/common/DataState';
import { SmartLink } from '../utils/routing.jsx';
import { postForm } from '../utils/api';

export default function EntitlementFormPage({ sessionState, mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const entitlementState = useJson(mode === 'edit' && id ? `/api/entitlements/${id}` : '/api/entitlements/bootstrap');
  const entitlement = entitlementState.data;
  const [formState, setFormState] = useState(null);
  const [saveState, setSaveState] = useState({ saving: false, error: '' });
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!entitlement) {
      return;
    }
    if (isEdit) {
      setFormState({
        name: entitlement.name || '',
        description: entitlement.description || '',
        selectedLevelIds: entitlement.selectedLevelIds || [],
        versions:
          entitlement.versions?.map(version => ({
            id: version.id ? String(version.id) : '',
            name: version.name || '',
            date: version.date || ''
          })) || []
      });
      return;
    }
    setFormState({
      name: '',
      description: '',
      selectedLevelIds: [],
      versions: [{ id: '', name: '', date: entitlement.todayDate || '' }]
    });
  }, [entitlement, isEdit]);

  const toggleLevel = levelId => {
    setFormState(current => ({
      ...current,
      selectedLevelIds: current.selectedLevelIds.includes(levelId)
        ? current.selectedLevelIds.filter(existing => existing !== levelId)
        : [...current.selectedLevelIds, levelId]
    }));
  };

  const updateVersion = (index, field, value) => {
    setFormState(current => ({
      ...current,
      versions: current.versions.map((version, versionIndex) =>
        versionIndex === index ? { ...version, [field]: value } : version
      )
    }));
  };

  const addVersion = () => {
    setFormState(current => ({
      ...current,
      versions: [...current.versions, { id: '', name: '', date: entitlement?.todayDate || '' }]
    }));
  };

  const removeVersion = index => {
    setFormState(current => ({
      ...current,
      versions: current.versions.filter((_, versionIndex) => versionIndex !== index)
    }));
  };

  const submit = async event => {
    event.preventDefault();
    if (!formState) {
      return;
    }
    setSaveState({ saving: true, error: '' });
    try {
      await postForm(isEdit ? `/entitlements/${id}` : '/entitlements', [
        ['name', formState.name],
        ['description', formState.description],
        ...formState.selectedLevelIds.map(levelId => ['levelIds', String(levelId)]),
        ...formState.versions.flatMap(version => [
          ['versionIds', version.id || ''],
          ['versionNames', version.name],
          ['versionDates', version.date]
        ])
      ]);
      navigate('/entitlements');
    } catch (error) {
      setSaveState({ saving: false, error: error.message || 'Unable to save entitlement.' });
      return;
    }
    setSaveState({ saving: false, error: '' });
  };

  const deleteEntitlement = async () => {
    if (!id || !window.confirm('Delete this entitlement?')) {
      return;
    }
    setSaveState({ saving: true, error: '' });
    try {
      await postForm(`/entitlements/${id}/delete`, []);
      navigate('/entitlements');
    } catch (error) {
      setSaveState({ saving: false, error: error.message || 'Unable to delete entitlement.' });
      return;
    }
    setSaveState({ saving: false, error: '' });
  };

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <SmartLink className="inline-link back-link" href={isEdit && id ? `/entitlements/${id}` : '/entitlements'}>
            Back to entitlements
          </SmartLink>
          <h2>{isEdit ? 'Edit entitlement' : 'New entitlement'}</h2>
        </div>
        <div className="button-row">
          {isEdit && (
            <button type="button" className="secondary-button danger-button" onClick={deleteEntitlement} disabled={saveState.saving}>
              Delete entitlement
            </button>
          )}
        </div>
      </div>

      <DataState state={entitlementState} emptyMessage="Entitlement not found." signInHref={sessionState.data?.homePath || '/login'}>
        {formState && entitlement && (
          <form className="owner-form" onSubmit={submit}>
            <div className="owner-form-grid">
              <label>
                Name
                <input value={formState.name} onChange={event => setFormState(current => ({ ...current, name: event.target.value }))} required />
              </label>
              <label className="form-span-2">
                Description
                <textarea
                  rows={6}
                  value={formState.description}
                  onChange={event => setFormState(current => ({ ...current, description: event.target.value }))}
                  required
                />
              </label>
            </div>

            <section className="detail-card">
              <h3>Support levels</h3>
              <div className="checkbox-list">
                {(entitlement.supportLevels || []).map(level => (
                  <label key={level.id} className="checkbox-card">
                    <input
                      type="checkbox"
                      checked={formState.selectedLevelIds.includes(level.id)}
                      onChange={() => toggleLevel(level.id)}
                    />
                    <span>
                      <strong>{level.name}</strong>
                      <small>
                        {level.fromLabel} - {level.toLabel}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="detail-card">
              <div className="section-header compact-header">
                <div>
                  <h3>Versions</h3>
                  <p className="section-copy">At least one version is required.</p>
                </div>
                <button type="button" className="secondary-button" onClick={addVersion}>
                  Add version
                </button>
              </div>
              <div className="version-editor-list">
                {formState.versions.map((version, index) => (
                  <div key={`${version.id || 'new'}-${index}`} className="version-editor-card">
                    <div className="owner-form-grid">
                      <label>
                        Version
                        <input value={version.name} onChange={event => updateVersion(index, 'name', event.target.value)} required />
                      </label>
                      <label>
                        Date
                        <input type="date" value={version.date} onChange={event => updateVersion(index, 'date', event.target.value)} required />
                      </label>
                    </div>
                    <div className="button-row">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => removeVersion(index)}
                        disabled={formState.versions.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {saveState.error && <p className="error-text">{saveState.error}</p>}

            <div className="button-row">
              <button type="submit" className="primary-button" disabled={saveState.saving}>
                {saveState.saving ? 'Saving...' : isEdit ? 'Save entitlement' : 'Create entitlement'}
              </button>
              <SmartLink className="secondary-button" href={isEdit && id ? `/entitlements/${id}` : '/entitlements'}>
                Cancel
              </SmartLink>
            </div>
          </form>
        )}
      </DataState>
    </section>
  );
}
