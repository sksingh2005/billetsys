import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useJson from '../hooks/useJson';
import DataState from '../components/common/DataState';
import MarkdownEditor from '../components/markdown/MarkdownEditor';
import AttachmentPicker from '../components/common/AttachmentPicker';
import { postMultipart } from '../utils/api';
import { DeleteArticleButton } from './ArticleDetailPage';

export default function ArticleFormPage({ sessionState, mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const articleState = useJson(mode === 'edit' && id ? `/api/articles/${id}` : '/api/articles/bootstrap');
  const article = articleState.data;
  const [formState, setFormState] = useState(null);
  const [saveState, setSaveState] = useState({ saving: false, error: '' });
  const [files, setFiles] = useState([]);
  const bodyInputRef = useRef(null);
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!article) {
      return;
    }
    if (isEdit) {
      setFormState({
        title: article.title || '',
        tags: article.tags || '',
        body: article.body || ''
      });
      return;
    }
    setFormState({ title: '', tags: '', body: '' });
  }, [article, isEdit]);

  const submit = async event => {
    event.preventDefault();
    if (!formState) {
      return;
    }
    setSaveState({ saving: true, error: '' });
    try {
      await postMultipart(isEdit ? `/articles/${id}` : '/articles', [
        ['title', formState.title],
        ['tags', formState.tags],
        ['body', formState.body],
        ...files.map(file => ['attachments', file])
      ]);
      navigate(isEdit && id ? `/articles/${id}` : '/articles');
    } catch (error) {
      setSaveState({ saving: false, error: error.message || 'Unable to save article.' });
      return;
    }
    setSaveState({ saving: false, error: '' });
  };

  return (
    <section className="panel">
      <DataState state={articleState} emptyMessage="Article unavailable." signInHref={sessionState.data?.homePath || '/login'}>
        {formState && article && article.canEdit && (
          <div className="form-card ticket-detail-card">
            {isEdit && <h1>{formState.title || 'Edit article'}</h1>}
            <form className="owner-form" onSubmit={submit}>
              <div className="owner-form-grid ticket-detail-grid">
                <label>
                  Title
                  <input value={formState.title} onChange={event => setFormState(current => ({ ...current, title: event.target.value }))} required />
                </label>
                <label>
                  Tags
                  <input value={formState.tags} onChange={event => setFormState(current => ({ ...current, tags: event.target.value }))} />
                </label>
                <label className="form-span-2">
                  Body
                  <MarkdownEditor
                    value={formState.body}
                    onChange={value => setFormState(current => ({ ...current, body: value }))}
                    inputRef={bodyInputRef}
                    rows={12}
                    required
                  />
                </label>
              </div>

              <AttachmentPicker files={files} onFilesChange={setFiles} existingAttachments={article.attachments || []} />

              {saveState.error && <p className="error-text">{saveState.error}</p>}

              <div className={`button-row${isEdit ? ' button-row-split' : ' button-row-end'}`}>
                {isEdit && article.id && article.canDelete && <DeleteArticleButton articleId={article.id} label="Delete" />}
                <button type="submit" className="primary-button" disabled={saveState.saving}>
                  {saveState.saving ? 'Saving...' : isEdit ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}
      </DataState>
    </section>
  );
}
