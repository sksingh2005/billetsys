import DataState from '../components/common/DataState';
import useJson from '../hooks/useJson';
import { SmartLink } from '../utils/routing.jsx';

export default function MessagesPage({ sessionState }) {
  const messageState = useJson('/api/messages');
  const messages = messageState.data;

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>{messages?.title || 'Messages'}</h2>
        </div>
        <div className="button-row">
          {messages?.createPath && (
            <SmartLink className="primary-button" href={messages.createPath}>
              New message
            </SmartLink>
          )}
        </div>
      </div>

      <DataState state={messageState} emptyMessage="No messages are available." signInHref={sessionState.data?.homePath || '/login'}>
        <div className="category-list">
          {(messages?.items || []).map(message => (
            <article key={message.id} className="category-card">
              <div className="category-card-head">
                <div>
                  <div className="category-title-row">
                    <h3>{message.ticketName || 'No ticket'}</h3>
                    <span className="status-pill">{message.date || 'No date'}</span>
                  </div>
                  <p className="tag-copy">{message.preview}</p>
                  <p className="muted-text">
                    {message.authorName || 'Unknown author'} • {message.attachmentCount} attachment(s)
                  </p>
                </div>
                <SmartLink className="inline-link" href={message.editPath}>
                  Edit
                </SmartLink>
              </div>
            </article>
          ))}
        </div>
      </DataState>
    </section>
  );
}
