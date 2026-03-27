import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useJson from '../hooks/useJson';
import DataState from '../components/common/DataState';
import { SmartLink } from '../utils/routing.jsx';
import { postForm } from '../utils/api';
import { resolvePostRedirectPath } from '../utils/routing.jsx';
import { isNetworkRequestError, submitBrowserForm } from '../utils/forms';
import { SelectableUserPicker, SelectableUserSummary } from '../components/users/UserComponents';

export default function CompanyFormPage({ sessionState, mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const companyState = useJson(mode === 'edit' && id ? `/api/companies/${id}` : '/api/companies/bootstrap');
  const company = companyState.data;
  const [formState, setFormState] = useState(null);
  const [saveState, setSaveState] = useState({ saving: false, error: '' });
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!company) {
      return;
    }
    if (isEdit) {
      setFormState({
        name: company.name || '',
        address1: company.address1 || '',
        address2: company.address2 || '',
        city: company.city || '',
        state: company.state || '',
        zip: company.zip || '',
        phoneNumber: company.phoneNumber || '',
        countryId: company.countryId ? String(company.countryId) : company.defaultCountryId ? String(company.defaultCountryId) : '',
        timezoneId: company.timezoneId ? String(company.timezoneId) : company.defaultTimezoneId ? String(company.defaultTimezoneId) : '',
        selectedUserIds: company.selectedUserIds || [],
        selectedTamIds: company.selectedTamIds || [],
        entitlements:
          company.entitlementAssignments?.map(entry => ({
            entitlementId: entry.entitlementId ? String(entry.entitlementId) : '',
            levelId: entry.levelId ? String(entry.levelId) : '',
            date: entry.date || company.todayDate || '',
            duration: entry.duration ? String(entry.duration) : String(2)
          })) || [],
        primaryContactId: company.primaryContactId ? String(company.primaryContactId) : ''
      });
      return;
    }
    setFormState({
      name: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      phoneNumber: '',
      countryId: company.defaultCountryId ? String(company.defaultCountryId) : '',
      timezoneId: company.defaultTimezoneId ? String(company.defaultTimezoneId) : '',
      selectedUserIds: [],
      selectedTamIds: [],
      entitlements: [],
      primaryContactUsername: '',
      primaryContactFullName: '',
      primaryContactEmail: '',
      primaryContactSocial: '',
      primaryContactPhoneNumber: '',
      primaryPhoneNumberExtension: '',
      primaryContactCountry: company.defaultCountryId ? String(company.defaultCountryId) : '',
      primaryContactTimeZone: company.defaultTimezoneId ? String(company.defaultTimezoneId) : '',
      primaryContactPassword: ''
    });
  }, [company, isEdit]);

  const availableTimezones =
    company?.timezones?.filter(timezone => !formState?.countryId || String(timezone.countryId) === formState.countryId) || [];
  const availablePrimaryContactTimezones =
    company?.timezones?.filter(
      timezone => !formState?.primaryContactCountry || String(timezone.countryId) === formState.primaryContactCountry
    ) || [];

  const toggleSelection = (field, idToToggle) => {
    setFormState(current => ({
      ...current,
      [field]: current[field].includes(idToToggle)
        ? current[field].filter(existing => existing !== idToToggle)
        : [...current[field], idToToggle]
    }));
  };

  const updateEntitlement = (index, field, value) => {
    setFormState(current => ({
      ...current,
      entitlements: current.entitlements.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const addEntitlement = () => {
    setFormState(current => ({
      ...current,
      entitlements: [
        ...current.entitlements,
        {
          entitlementId: '',
          levelId: '',
          date: company?.todayDate || '',
          duration: String(company?.durations?.[1]?.value || 2)
        }
      ]
    }));
  };

  const removeEntitlement = index => {
    setFormState(current => ({
      ...current,
      entitlements: current.entitlements.filter((_, entryIndex) => entryIndex !== index)
    }));
  };

  const submit = async event => {
    event.preventDefault();
    if (!formState) {
      return;
    }
    setSaveState({ saving: true, error: '' });
    try {
      const entries = [
        ['name', formState.name],
        ['address1', formState.address1],
        ['address2', formState.address2],
        ['city', formState.city],
        ['state', formState.state],
        ['zip', formState.zip],
        ['phoneNumber', formState.phoneNumber],
        ['countryId', formState.countryId],
        ['timezoneId', formState.timezoneId],
        ...formState.selectedUserIds.map(userId => ['userIds', String(userId)]),
        ...formState.selectedTamIds.map(userId => ['tamIds', String(userId)]),
        ...formState.entitlements.flatMap(entry => [
          ['entitlementIds', entry.entitlementId],
          ['levelIds', entry.levelId],
          ['entitlementDates', entry.date],
          ['entitlementDurations', entry.duration]
        ])
      ];

      if (isEdit) {
        entries.push(['primaryContact', formState.primaryContactId]);
      } else {
        entries.push(
          ['primaryContactUsername', formState.primaryContactUsername],
          ['primaryContactFullName', formState.primaryContactFullName],
          ['primaryContactEmail', formState.primaryContactEmail],
          ['primaryContactSocial', formState.primaryContactSocial],
          ['primaryContactPhoneNumber', formState.primaryContactPhoneNumber],
          ['primaryPhoneNumberExtension', formState.primaryPhoneNumberExtension],
          ['primaryContactCountry', formState.primaryContactCountry],
          ['primaryContactTimeZone', formState.primaryContactTimeZone],
          ['primaryContactPassword', formState.primaryContactPassword]
        );
      }

      const response = await postForm(isEdit ? `/companies/${id}` : '/companies', entries);
      navigate(await resolvePostRedirectPath(response, '/companies'));
    } catch (error) {
      if (isNetworkRequestError(error)) {
        setSaveState({ saving: false, error: '' });
        submitBrowserForm(isEdit ? `/companies/${id}` : '/companies', entries);
        return;
      }
      setSaveState({ saving: false, error: error.message || 'Unable to save company.' });
      return;
    }
    setSaveState({ saving: false, error: '' });
  };

  const deleteCompany = async () => {
    if (!id || !window.confirm('Delete this company?')) {
      return;
    }
    setSaveState({ saving: true, error: '' });
    try {
      await postForm(`/companies/${id}/delete`, []);
      navigate('/companies');
    } catch (error) {
      setSaveState({ saving: false, error: error.message || 'Unable to delete company.' });
      return;
    }
    setSaveState({ saving: false, error: '' });
  };

  return (
    <section className="panel">
      {!isEdit && (
        <div className="section-header">
          <div>
            <SmartLink className="inline-link back-link" href={isEdit && id ? `/companies/${id}` : '/companies'}>
              Back to companies
            </SmartLink>
            <h2>{isEdit ? 'Edit company' : 'New company'}</h2>
          </div>
        </div>
      )}

      <DataState state={companyState} emptyMessage="Company not found." signInHref={sessionState.data?.homePath || '/login'}>
        {formState && company && (
          <form className="owner-form" onSubmit={submit}>
            {isEdit ? (
              <div className="form-card ticket-detail-card">
                <div className="owner-form owner-detail-form">
                  <div className="owner-form-grid ticket-detail-grid">
                    <label>
                      Name
                      <input value={formState.name} onChange={event => setFormState(current => ({ ...current, name: event.target.value }))} required />
                    </label>
                    <label>
                      Phone
                      <input value={formState.phoneNumber} onChange={event => setFormState(current => ({ ...current, phoneNumber: event.target.value }))} />
                    </label>
                    <label>
                      Country
                      <select
                        value={formState.countryId}
                        onChange={event => {
                          const nextCountryId = event.target.value;
                          const timezoneStillValid = (company.timezones || []).some(
                            timezone => String(timezone.id) === formState.timezoneId && String(timezone.countryId) === nextCountryId
                          );
                          setFormState(current => ({
                            ...current,
                            countryId: nextCountryId,
                            timezoneId: timezoneStillValid ? current.timezoneId : ''
                          }));
                        }}
                      >
                        <option value="">Select a country</option>
                        {(company.countries || []).map(country => (
                          <option key={country.id} value={country.id}>
                            {country.name}
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
                    <label>
                      Address1
                      <input value={formState.address1} onChange={event => setFormState(current => ({ ...current, address1: event.target.value }))} />
                    </label>
                    <label>
                      Address2
                      <input value={formState.address2} onChange={event => setFormState(current => ({ ...current, address2: event.target.value }))} />
                    </label>
                    <label>
                      City
                      <input value={formState.city} onChange={event => setFormState(current => ({ ...current, city: event.target.value }))} />
                    </label>
                    <label>
                      State
                      <input value={formState.state} onChange={event => setFormState(current => ({ ...current, state: event.target.value }))} />
                    </label>
                    <label>
                      Zip
                      <input value={formState.zip} onChange={event => setFormState(current => ({ ...current, zip: event.target.value }))} />
                    </label>
                    <div className="owner-detail-panel">
                      <div className="owner-detail-panel-label">Superuser</div>
                      <div className="owner-detail-panel-body">
                        <SelectableUserSummary users={company.selectedSuperusers} />
                      </div>
                    </div>
                    <SelectableUserPicker
                      title="User"
                      users={company.userOptions || []}
                      selectedIds={formState.selectedUserIds}
                      onToggle={userId => toggleSelection('selectedUserIds', userId)}
                    />
                    <SelectableUserPicker
                      title="TAMs"
                      users={company.tamOptions || []}
                      selectedIds={formState.selectedTamIds}
                      onToggle={userId => toggleSelection('selectedTamIds', userId)}
                    />
                    <div className="detail-card-spacer" aria-hidden="true" />
                  </div>
                  <section className="detail-card">
                    <div className="section-header compact-header">
                      <div>
                        <h3>Entitlements</h3>
                      </div>
                    </div>
                    <div className="version-editor-list">
                      {formState.entitlements.map((entry, index) => (
                        <div key={`${entry.entitlementId || 'new'}-${entry.levelId || 'level'}-${index}`} className="version-editor-card">
                          <div className="owner-form-grid">
                            <label>
                              Entitlement
                              <select value={entry.entitlementId} onChange={event => updateEntitlement(index, 'entitlementId', event.target.value)} required>
                                <option value="">Select entitlement</option>
                                {(company.entitlements || []).map(option => (
                                  <option key={option.id} value={option.id}>
                                    {option.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Level
                              <select value={entry.levelId} onChange={event => updateEntitlement(index, 'levelId', event.target.value)} required>
                                <option value="">Select level</option>
                                {(company.levels || []).map(option => (
                                  <option key={option.id} value={option.id}>
                                    {option.name} ({option.level})
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Date
                              <input type="date" value={entry.date} onChange={event => updateEntitlement(index, 'date', event.target.value)} required />
                            </label>
                            <label>
                              Duration
                              <select value={entry.duration} onChange={event => updateEntitlement(index, 'duration', event.target.value)} required>
                                {(company.durations || []).map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <div className="button-row button-row-end">
                          <button type="button" className="secondary-button danger-button" onClick={() => removeEntitlement(index)}>
                            Remove
                          </button>
                        </div>
                        </div>
                      ))}
                      {formState.entitlements.length === 0 && <p className="muted-text">No entitlements selected yet.</p>}
                    </div>
                    <div className="button-row button-row-end">
                      <button type="button" className="secondary-button danger-button" onClick={addEntitlement}>
                        Add
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <>
                <div className="owner-form-grid">
                  <label>
                    Name
                    <input value={formState.name} onChange={event => setFormState(current => ({ ...current, name: event.target.value }))} required />
                  </label>
                  <label>
                    Phone number
                    <input value={formState.phoneNumber} onChange={event => setFormState(current => ({ ...current, phoneNumber: event.target.value }))} />
                  </label>
                  <label>
                    Address1
                    <input value={formState.address1} onChange={event => setFormState(current => ({ ...current, address1: event.target.value }))} />
                  </label>
                  <label>
                    Address2
                    <input value={formState.address2} onChange={event => setFormState(current => ({ ...current, address2: event.target.value }))} />
                  </label>
                  <label>
                    City
                    <input value={formState.city} onChange={event => setFormState(current => ({ ...current, city: event.target.value }))} />
                  </label>
                  <label>
                    State
                    <input value={formState.state} onChange={event => setFormState(current => ({ ...current, state: event.target.value }))} />
                  </label>
                  <label>
                    Zip
                    <input value={formState.zip} onChange={event => setFormState(current => ({ ...current, zip: event.target.value }))} />
                  </label>
                  <label>
                    Country
                    <select
                      value={formState.countryId}
                      onChange={event => {
                        const nextCountryId = event.target.value;
                        const timezoneStillValid = (company.timezones || []).some(
                          timezone => String(timezone.id) === formState.timezoneId && String(timezone.countryId) === nextCountryId
                        );
                        setFormState(current => ({
                          ...current,
                          countryId: nextCountryId,
                          timezoneId: timezoneStillValid ? current.timezoneId : ''
                        }));
                      }}
                    >
                      <option value="">Select a country</option>
                      {(company.countries || []).map(country => (
                        <option key={country.id} value={country.id}>
                          {country.name}
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
                  <label>
                    Username
                    <input value={formState.primaryContactUsername} onChange={event => setFormState(current => ({ ...current, primaryContactUsername: event.target.value }))} required />
                  </label>
                  <label>
                    Full name
                    <input value={formState.primaryContactFullName} onChange={event => setFormState(current => ({ ...current, primaryContactFullName: event.target.value }))} />
                  </label>
                  <label>
                    Email
                    <input type="email" value={formState.primaryContactEmail} onChange={event => setFormState(current => ({ ...current, primaryContactEmail: event.target.value }))} required />
                  </label>
                  <label>
                    Social
                    <input value={formState.primaryContactSocial} onChange={event => setFormState(current => ({ ...current, primaryContactSocial: event.target.value }))} />
                  </label>
                  <label>
                    Phone number
                    <input value={formState.primaryContactPhoneNumber} onChange={event => setFormState(current => ({ ...current, primaryContactPhoneNumber: event.target.value }))} />
                  </label>
                  <label>
                    Phone extension
                    <input value={formState.primaryPhoneNumberExtension} onChange={event => setFormState(current => ({ ...current, primaryPhoneNumberExtension: event.target.value }))} />
                  </label>
                  <label>
                    Country
                    <select
                      value={formState.primaryContactCountry}
                      onChange={event => {
                        const nextCountryId = event.target.value;
                        const timezoneStillValid = (company.timezones || []).some(
                          timezone =>
                            String(timezone.id) === formState.primaryContactTimeZone &&
                            String(timezone.countryId) === nextCountryId
                        );
                        setFormState(current => ({
                          ...current,
                          primaryContactCountry: nextCountryId,
                          primaryContactTimeZone: timezoneStillValid ? current.primaryContactTimeZone : ''
                        }));
                      }}
                    >
                      <option value="">Select a country</option>
                      {(company.countries || []).map(country => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Time zone
                    <select
                      value={formState.primaryContactTimeZone}
                      onChange={event => setFormState(current => ({ ...current, primaryContactTimeZone: event.target.value }))}
                    >
                      <option value="">Select a time zone</option>
                      {availablePrimaryContactTimezones.map(timezone => (
                        <option key={timezone.id} value={timezone.id}>
                          {timezone.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      value={formState.primaryContactPassword}
                      onChange={event => setFormState(current => ({ ...current, primaryContactPassword: event.target.value }))}
                      required
                    />
                  </label>
                </div>
                <div className="owner-picker-grid">
                  <SelectableUserPicker
                    title="Users"
                    users={company.userOptions || []}
                    selectedIds={formState.selectedUserIds}
                    onToggle={userId => toggleSelection('selectedUserIds', userId)}
                  />
                  <SelectableUserPicker
                    title="TAMs"
                    users={company.tamOptions || []}
                    selectedIds={formState.selectedTamIds}
                    onToggle={userId => toggleSelection('selectedTamIds', userId)}
                  />
                </div>
                <section className="detail-card">
                  <div className="section-header compact-header">
                    <div>
                      <h3>Entitlements</h3>
                    </div>
                  </div>
                  <div className="version-editor-list">
                    {formState.entitlements.map((entry, index) => (
                      <div key={`${entry.entitlementId || 'new'}-${entry.levelId || 'level'}-${index}`} className="version-editor-card">
                        <div className="owner-form-grid">
                          <label>
                            Entitlement
                            <select value={entry.entitlementId} onChange={event => updateEntitlement(index, 'entitlementId', event.target.value)} required>
                              <option value="">Select entitlement</option>
                              {(company.entitlements || []).map(option => (
                                <option key={option.id} value={option.id}>
                                  {option.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Level
                            <select value={entry.levelId} onChange={event => updateEntitlement(index, 'levelId', event.target.value)} required>
                              <option value="">Select level</option>
                              {(company.levels || []).map(option => (
                                <option key={option.id} value={option.id}>
                                  {option.name} ({option.level})
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Date
                            <input type="date" value={entry.date} onChange={event => updateEntitlement(index, 'date', event.target.value)} required />
                          </label>
                          <label>
                            Duration
                            <select value={entry.duration} onChange={event => updateEntitlement(index, 'duration', event.target.value)} required>
                              {(company.durations || []).map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <div className="button-row button-row-end">
                          <button type="button" className="secondary-button danger-button" onClick={() => removeEntitlement(index)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    {formState.entitlements.length === 0 && <p className="muted-text">No entitlements selected yet.</p>}
                  </div>
                  <div className="button-row button-row-end">
                    <button type="button" className="secondary-button" onClick={addEntitlement}>
                      Add entitlement
                    </button>
                  </div>
                </section>
              </>
            )}

            {saveState.error && <p className="error-text">{saveState.error}</p>}

            <div className={`button-row${isEdit ? ' button-row-split' : ''}`}>
              {isEdit ? (
                <button type="button" className="secondary-button danger-button" onClick={deleteCompany} disabled={saveState.saving}>
                  Delete
                </button>
              ) : (
                <SmartLink className="secondary-button" href={isEdit && id ? `/companies/${id}` : '/companies'}>
                  Cancel
                </SmartLink>
              )}
              <button type="submit" className="primary-button" disabled={saveState.saving}>
                {saveState.saving ? 'Saving...' : isEdit ? 'Save' : 'Create company'}
              </button>
            </div>
          </form>
        )}
      </DataState>
    </section>
  );
}
