/*
 * Eclipse Public License - v 2.0
 *
 *   THE ACCOMPANYING PROGRAM IS PROVIDED UNDER THE TERMS OF THIS ECLIPSE
 *   PUBLIC LICENSE ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION
 *   OF THE PROGRAM CONSTITUTES RECIPIENT'S ACCEPTANCE OF THIS AGREEMENT.
 */

import { useParams } from "react-router-dom";
import DataState from "../components/common/DataState";
import useJson from "../hooks/useJson";
import { SmartLink } from "../utils/routing";
import type { SessionPageProps } from "../types/app";
import type { AttachmentDetail } from "../types/domain";

export default function AttachmentPage({ sessionState }: SessionPageProps) {
  const { id } = useParams();
  const attachmentState = useJson<AttachmentDetail>(
    id ? `/api/attachments/${id}` : null,
  );
  const attachment = attachmentState.data;
  const attachmentTitle = attachment?.ticketName
    ? `${attachment.ticketName}: ${attachment.name || "Attachment"}`
    : attachment?.name || "Attachment";
  const actionRowClassName = `button-row${
    attachment?.backPath && attachment?.downloadPath
      ? " button-row-split"
      : attachment?.downloadPath
        ? " button-row-end"
        : ""
  } attachment-detail-actions`;

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>{attachmentTitle}</h2>
        </div>
      </div>

      <DataState
        state={attachmentState}
        emptyMessage="Attachment not found."
        signInHref={sessionState.data?.homePath || "/login"}
      >
        {attachment && (
          <div className="article-detail">
            {attachment.image ? (
              <div className="markdown-card">
                <img
                  src={attachment.downloadPath}
                  alt={attachment.name}
                  style={{ maxWidth: "100%" }}
                />
              </div>
            ) : (
              <pre className="markdown-card attachment-content">
                {(attachment.lines || [])
                  .map((line) => line.content)
                  .join("\n") ||
                  attachment.messageBody ||
                  ""}
              </pre>
            )}

            <div className="attachment-meta-line">
              {attachment.mimeType || "—"}
              {attachment.sizeLabel ? ` (${attachment.sizeLabel})` : ""}
            </div>

            {(attachment.backPath || attachment.downloadPath) && (
              <div className={actionRowClassName}>
                {attachment.backPath ? (
                  <SmartLink
                    className="secondary-button danger-button"
                    href={attachment.backPath}
                  >
                    Ticket
                  </SmartLink>
                ) : (
                  <span aria-hidden="true" />
                )}
                {attachment.downloadPath && (
                  <a
                    className="primary-button"
                    href={attachment.downloadPath}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </DataState>
    </section>
  );
}
