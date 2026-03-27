import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AttachmentPicker from '../components/common/AttachmentPicker';
import DataState from '../components/common/DataState';
import MarkdownEditor from '../components/markdown/MarkdownEditor';
import useJson from '../hooks/useJson';
import { postMultipart } from '../utils/api';
import { toQueryString } from '../utils/formatting';
import { resolvePostRedirectPath, SmartLink } from '../utils/routing.jsx';

export default function SupportTicketCreatePage({
  sessionState,
  apiBase = '/api/support/tickets/bootstrap',
  backPath = '/support/tickets',
  submitFallbackPath = '/support/tickets',
  title = 'New support ticket',
  description = '',
  navigateTo = '/support/tickets',
  compactCreateActions = false,
  hideEntitlementLevel = false
}) {
  const navigate = useNavigate();
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedCompanyEntitlementId, setSelectedCompanyEntitlementId] = useState('');
  const bootstrapState = useJson(
    `${apiBase}${toQueryString({
      companyId: selectedCompanyId || undefined,
      companyEntitlementId: selectedCompanyEntitlementId || undefined
    })}`
  );
  const bootstrap = bootstrapState.data;
  const [formState, setFormState] = useState(null);
  const [files, setFiles] = useState([]);
  const [saveState, setSaveState] = useState({ saving: false, error: '' });
  const messageInputRef = useRef(null);
  const showFixedCompany = sessionState.data?.role === 'superuser';
  const compactCreateHeader = apiBase === '/api/superuser/tickets/bootstrap';

  useEffect(() => {
    if (!bootstrap) {
      return;
    }
    setFormState(current => {
      const initialCompanyId = bootstrap.selectedCompanyId ? String(bootstrap.selectedCompanyId) : '';
      const initialEntitlementId = bootstrap.selectedCompanyEntitlementId ? String(bootstrap.selectedCompanyEntitlementId) : '';
      const initialAffectsVersionId = bootstrap.defaultAffectsVersion?.id ? String(bootstrap.defaultAffectsVersion.id) : '';
      if (!current) {
        setSelectedCompanyId(initialCompanyId);
        setSelectedCompanyEntitlementId(initialEntitlementId);
        return {
          ticketName: bootstrap.ticketName || '',
          companyId: initialCompanyId,
          companyEntitlementId: initialEntitlementId,
          categoryId: bootstrap.defaultCategoryId ? String(bootstrap.defaultCategoryId) : '',
          affectsVersionId: initialAffectsVersionId,
          message: ''
        };
      }
      const validEntitlementIds = (bootstrap.companyEntitlements || []).map(entry => String(entry.id));
      const validVersionIds = (bootstrap.versions || []).map(version => String(version.id));
      const nextEntitlementId = validEntitlementIds.includes(current.companyEntitlementId) ? current.companyEntitlementId : initialEntitlementId;
      setSelectedCompanyEntitlementId(nextEntitlementId);
      return {
        ...current,
        ticketName: bootstrap.ticketName || current.ticketName,
        companyId: initialCompanyId || current.companyId,
        companyEntitlementId: nextEntitlementId,
        categoryId: current.categoryId || (bootstrap.defaultCategoryId ? String(bootstrap.defaultCategoryId) : ''),
        affectsVersionId: validVersionIds.includes(current.affectsVersionId) ? current.affectsVersionId : initialAffectsVersionId
      };
    });
  }, [bootstrap]);

  const submit = async event => {
    event.preventDefault();
    if (!formState) {
      return;
    }
    setSaveState({ saving: true, error: '' });
    try {
      const response = await postMultipart(
        bootstrap?.submitPath || submitFallbackPath,
        [
          ['status', 'Open'],
          ['message', formState.message],
          ['companyId', formState.companyId],
          ['companyEntitlementId', formState.companyEntitlementId],
          ['categoryId', formState.categoryId || null],
          ['affectsVersionId', formState.affectsVersionId || null],
          ...files.map(file => ['attachments', file])
        ],
        {
          headers: { 'X-Billetsys-Client': 'react' }
        }
      );
      navigate(await resolvePostRedirectPath(response, navigateTo));
    } catch (error) {
      setSaveState({ saving: false, error: error.message || 'Unable to create ticket.' });
      return;
    }
    setSaveState({ saving: false, error: '' });
  };

  return (
    <section className="panel">
      {(!compactCreateHeader && title) || description ? (
        <div className="section-header">
          <div>
            {!compactCreateHeader ? (
              <SmartLink className="inline-link back-link" href={backPath}>
                Back to tickets
              </SmartLink>
            ) : null}
            {title ? <h2>{title}</h2> : null}
            {description ? <p className="section-copy">{description}</p> : null}
          </div>
        </div>
      ) : null}

      <DataState state={bootstrapState} emptyMessage="A company is required before creating a support ticket." signInHref={sessionState.data?.homePath || '/login'}>
        {formState && bootstrap && (
          <form className="owner-form" onSubmit={submit}>
            <div className="owner-form-grid">
              <label>
                Ticket
                <input value={formState.ticketName} readOnly />
              </label>
              <label>
                Company
                {showFixedCompany ? (
                  <input value={(bootstrap.companies || []).find(company => String(company.id) === formState.companyId)?.name || ''} readOnly />
                ) : (
                  <select
                    value={formState.companyId}
                    onChange={event => {
                      const nextCompanyId = event.target.value;
                      setSelectedCompanyId(nextCompanyId);
                      setSelectedCompanyEntitlementId('');
                      setFormState(current => ({
                        ...current,
                        companyId: nextCompanyId,
                        companyEntitlementId: '',
                        affectsVersionId: ''
                      }));
                    }}
                    required
                  >
                    {(bootstrap.companies || []).map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                )}
              </label>
              <label>
                Entitlement
                <select
                  value={formState.companyEntitlementId}
                  onChange={event => {
                    const nextEntitlementId = event.target.value;
                    setSelectedCompanyEntitlementId(nextEntitlementId);
                    setFormState(current => ({ ...current, companyEntitlementId: nextEntitlementId, affectsVersionId: '' }));
                  }}
                  required
                >
                  {(bootstrap.companyEntitlements || []).map(entry => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                      {!hideEntitlementLevel && entry.levelName ? ` • ${entry.levelName}` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Category
                <select value={formState.categoryId} onChange={event => setFormState(current => ({ ...current, categoryId: event.target.value }))}>
                  {(bootstrap.categories || []).map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-span-2">
                Message
                <MarkdownEditor
                  value={formState.message}
                  onChange={value => setFormState(current => ({ ...current, message: value }))}
                  inputRef={messageInputRef}
                  rows={10}
                  required
                />
              </label>
            </div>

            <section className="detail-grid">
              <div className="detail-card">
                <h3>Affects</h3>
                <select value={formState.affectsVersionId} onChange={event => setFormState(current => ({ ...current, affectsVersionId: event.target.value }))}>
                  {(bootstrap.versions || []).length === 0 && <option value="">-</option>}
                  {(bootstrap.versions || []).map(version => (
                    <option key={version.id} value={version.id}>
                      {version.name}
                      {version.date ? ` (${version.date})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="detail-card-spacer" aria-hidden="true" />
            </section>

            <AttachmentPicker files={files} onFilesChange={setFiles} />

            {saveState.error && <p className="error-text">{saveState.error}</p>}

            <div className={`button-row${compactCreateHeader || compactCreateActions ? ' button-row-end' : ''}`}>
              <button type="submit" className="primary-button" disabled={saveState.saving}>
                {saveState.saving ? 'Creating...' : compactCreateHeader || compactCreateActions ? 'Create' : 'Create ticket'}
              </button>
              {!compactCreateHeader && !compactCreateActions ? (
                <SmartLink className="secondary-button" href={backPath}>
                  Cancel
                </SmartLink>
              ) : null}
            </div>
          </form>
        )}
      </DataState>
    </section>
  );
}
