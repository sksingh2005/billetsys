/*
 * Eclipse Public License - v 2.0
 *
 *   THE ACCOMPANYING PROGRAM IS PROVIDED UNDER THE TERMS OF THIS ECLIPSE
 *   PUBLIC LICENSE ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION
 *   OF THE PROGRAM CONSTITUTES RECIPIENT'S ACCEPTANCE OF THIS AGREEMENT.
 */

import { useParams } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useJson from "../hooks/useJson";
import useSubmissionGuard from "../hooks/useSubmissionGuard";
import DataState from "../components/common/DataState";
import PageHeader from "../components/layout/PageHeader";
import MarkdownContent from "../components/markdown/MarkdownContent";
import { resolvePostRedirectPath, SmartLink } from "../utils/routing";
import { postForm } from "../utils/api";
import type { SessionPageProps } from "../types/app";
import type { ArticleRecord } from "../types/domain";
import { Button } from "../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

interface DeleteArticleButtonProps {
  articleId: string | number;
  label?: string;
}

function DeleteArticleButton({
  articleId,
  label = "Delete article",
}: DeleteArticleButtonProps) {
  const navigate = useNavigate();

  const [deleting, setDeleting] = useState(false);
  const submissionGuard = useSubmissionGuard();

  const remove = async () => {
    if (!submissionGuard.tryEnter()) {
      return;
    }
    try {
      setDeleting(true);
      const response = await postForm(`/articles/${articleId}/delete`, []);
      toast.success("Article deleted.");
      navigate(await resolvePostRedirectPath(response, "/articles"));
    } catch (submitError: unknown) {
      setDeleting(false);
      toast.error(
        submitError instanceof Error
          ? submitError.message
          : "Unable to delete article.",
      );
      return;
    } finally {
      submissionGuard.exit();
    }
    setDeleting(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" disabled={deleting}>
          {deleting ? "Deleting..." : label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            article.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={remove}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { DeleteArticleButton };

export default function ArticleDetailPage(props: SessionPageProps) {
  void props;
  const { id } = useParams();
  const articleState = useJson<ArticleRecord>(
    id ? `/api/articles/${id}` : null,
  );
  const article = articleState.data;

  return (
    <section className="w-full mt-4 flex flex-col min-h-[calc(100vh-140px)]">
      <DataState state={articleState} emptyMessage="Article not found.">
        {article && (
          <div className="flex flex-col flex-1">
            <PageHeader
              title={article.title || "Article"}
              subtitle={
                article.tags ? (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Tags:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.split(",").map((tag) => (
                        <span
                          key={tag.trim()}
                          className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null
              }
            />

            <div className="w-full flex flex-col flex-1">
              <div className="w-full">
                <div className="text-foreground/90">
                  {article.body ? (
                    <div className="max-w-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:mb-6 [&_h1]:mt-2 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-border/50 [&_h3]:text-xl [&_h3]:font-medium [&_h3]:mb-3 [&_h3]:mt-6 [&_ul]:my-4 [&_ul]:ms-6 [&_ul]:list-disc [&_ul_li]:pl-1 [&_ol]:my-4 [&_ol]:ms-6 [&_ol]:list-decimal [&_ol_li]:pl-1 [&_p]:my-4 [&_p]:leading-relaxed [&_p]:first:mt-0 [&_p]:last:mb-0 [&_a]:text-primary hover:[&_a]:underline [&_a]:underline-offset-4 [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-sm [&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground">
                      <MarkdownContent>{article.body}</MarkdownContent>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No body content.
                    </p>
                  )}
                </div>

                {article.attachments && article.attachments.length > 0 && (
                  <div className="w-full pt-8 mt-12 border-t border-border/60">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                      Attachments
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {article.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.downloadPath}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative flex flex-col justify-center gap-1.5 p-4 pr-10 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-all w-72 shadow-sm hover:shadow-md"
                        >
                          <div className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {attachment.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground/80 font-medium">
                            <span className="uppercase tracking-wider text-primary/80">
                              {attachment.mimeType?.split("/").pop() || "FILE"}
                            </span>
                            <span>•</span>
                            <span>{attachment.sizeLabel}</span>
                          </div>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-primary"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" x2="12" y1="15" y2="3" />
                            </svg>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {(article.canDelete || (article.canEdit && article.editPath)) && (
                <div className="w-full flex items-center justify-between pt-8 mt-auto mb-4">
                  <div>
                    {article.canDelete && (
                      <DeleteArticleButton
                        articleId={article.id}
                        label="Delete"
                      />
                    )}
                  </div>
                  <div>
                    {article.canEdit && article.editPath && (
                      <Button asChild className="px-8">
                        <SmartLink href={article.editPath}>Edit</SmartLink>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DataState>
    </section>
  );
}
