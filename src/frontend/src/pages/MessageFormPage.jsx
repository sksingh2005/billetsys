import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AttachmentPicker from '../components/common/AttachmentPicker';
import DataState from '../components/common/DataState';
import useJson from '../hooks/useJson';
import { postForm, postMultipart } from '../utils/api';
import { toQueryString } from '../utils/formatting';
import { PATHS } from '../routes/paths';
import { SmartLink } from '../utils/routing.jsx';

export default function MessageFormPage({ sessionState }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const bootstrapState = useJson(`/api/messages/bootstrap${toQueryString({ messageId: id })}`);
  const bootstrap = bootstrapState.data;
  const [formState, setFormState] = useState(null);
  const [saveState, setSaveState] = useState({ saving: false, error: '' });

  useEffect(() => {
    if (!bootstrap) {
      return;
    }
    setFormState({
      body: bootstrap.message?.body || '',
      date: bootstrap.message?.date || '',
      ticketId: bootstrap.message?.ticketId ? String(bootstrap.message.ticketId) : '',
      files: []
    });
  }, [bootstrap]);

  const submit = async event => {
    event.preventDefault();
    if (!bootstrap || !formState) {
      return;
    }
    setSaveState({ saving: true, error: '' });
    try {
      await postMultipart(bootstrap.submitPath, [
        ['body', formState.body],
        ['date', formState.date],
        ['ticketId', formState.ticketId],
        ['attachments', formState.files]
      ]);
      navigate(PATHS.messages);
    } catch (error) {
      setSaveState({ saving: false, error: error.message || 'Unable to save message.' });
      return;
    }
    setSaveState({ saving: false, error: '' });
  };

  const deleteMessage = async () => {
    if (!id || !window.confirm('Delete this message?')) {
      return;
    }
    setSaveState({ saving: true, error: '' });
    try {
      await postForm(`/messages/${id}/delete`, []);
      navigate(PATHS.messages);
    } catch (error) {
      setSaveState({ saving: false, error: error.message || 'Unable to delete message.' });
      return;
    }
    setSaveState({ saving: false, error: '' });
  };

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <SmartLink className="inline-link back-link" href={PATHS.messages}>
            Back to messages
          </SmartLink>
          <h2>{bootstrap?.title || 'Message form'}</h2>
        </div>
        <div className="button-row">
          {id && (
            <button type="button" className="secondary-button danger-button" onClick={deleteMessage} disabled={saveState.saving}>
              Delete message
            </button>
          )}
        </div>
      </div>

      <DataState state={bootstrapState} emptyMessage="Unable to load the message form." signInHref={sessionState.data?.homePath || '/login'}>
        {bootstrap && formState && (
          <form className="owner-form" onSubmit={submit}>
            <div className="owner-form-grid">
              <label className="form-span-2">
                Body
                <textarea rows={8} value={formState.body} onChange={event => setFormState(current => ({ ...current, body: event.target.value }))} required />
              </label>
              <label>
                Date
                <input type="datetime-local" value={formState.date} onChange={event => setFormState(current => ({ ...current, date: event.target.value }))} required />
              </label>
              <label>
                Ticket
                <select value={formState.ticketId} onChange={event => setFormState(current => ({ ...current, ticketId: event.target.value }))} required>
                  <option value="">Select ticket</option>
                  {(bootstrap.tickets || []).map(ticket => (
                    <option key={ticket.id} value={ticket.id ? String(ticket.id) : ''}>
                      {ticket.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <AttachmentPicker files={formState.files} onFilesChange={files => setFormState(current => ({ ...current, files }))} existingAttachments={bootstrap.attachments || []} />

            {saveState.error && <p className="error-text">{saveState.error}</p>}

            <div className="button-row">
              <button type="submit" className="primary-button" disabled={saveState.saving}>
                {saveState.saving ? 'Saving...' : bootstrap.edit ? 'Save message' : 'Create message'}
              </button>
              <SmartLink className="secondary-button" href={bootstrap.cancelPath || PATHS.messages}>
                Cancel
              </SmartLink>
            </div>
          </form>
        )}
      </DataState>
    </section>
  );
}
