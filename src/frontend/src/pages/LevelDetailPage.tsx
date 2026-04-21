/*
 * Eclipse Public License - v 2.0
 *
 *   THE ACCOMPANYING PROGRAM IS PROVIDED UNDER THE TERMS OF THIS ECLIPSE
 *   PUBLIC LICENSE ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION
 *   OF THE PROGRAM CONSTITUTES RECIPIENT'S ACCEPTANCE OF THIS AGREEMENT.
 */

import { useParams } from "react-router-dom";
import DataState from "../components/common/DataState";
import { LevelColorFieldValue } from "../components/common/LevelColorBadge";
import PageHeader from "../components/layout/PageHeader";
import useJson from "../hooks/useJson";
import { SmartLink } from "../utils/routing";
import type { SessionPageProps } from "../types/app";
import type { LevelRecord } from "../types/domain";
import { Button } from "../components/ui/button";
import { Field, FieldLabel } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import MarkdownContent from "../components/markdown/MarkdownContent";

export default function LevelDetailPage(props: SessionPageProps) {
  void props;
  const { id } = useParams();
  const levelState = useJson<LevelRecord>(id ? `/api/levels/${id}` : null);
  const level = levelState.data;

  return (
    <section className="w-full mt-4">
      <PageHeader title={level?.name || "Support level"} />

      <DataState state={levelState} emptyMessage="Level not found.">
        {level && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Field>
                <FieldLabel className="text-[var(--color-header-bg)]">
                  Name
                </FieldLabel>
                <Input value={level.name || "—"} readOnly />
              </Field>
              <Field>
                <FieldLabel className="text-[var(--color-header-bg)]">
                  Level
                </FieldLabel>
                <Input value={level.level ?? "—"} readOnly />
              </Field>
              <Field>
                <FieldLabel className="text-[var(--color-header-bg)]">
                  Color
                </FieldLabel>
                <div className="h-10 px-3 py-2 border rounded-md bg-muted/50 flex items-center">
                  <LevelColorFieldValue
                    color={level.color}
                    display={level.colorDisplay}
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel className="text-[var(--color-header-bg)]">
                  Country
                </FieldLabel>
                <Input value={level.countryName || "—"} readOnly />
              </Field>
              <Field>
                <FieldLabel className="text-[var(--color-header-bg)]">
                  From
                </FieldLabel>
                <Input value={level.fromLabel || "—"} readOnly />
              </Field>
              <Field>
                <FieldLabel className="text-[var(--color-header-bg)]">
                  To
                </FieldLabel>
                <Input value={level.toLabel || "—"} readOnly />
              </Field>
              <Field>
                <FieldLabel className="text-[var(--color-header-bg)]">
                  Time zone
                </FieldLabel>
                <Input value={level.timezoneName || "—"} readOnly />
              </Field>
              <div className="hidden md:block" aria-hidden="true" />
              <Field className="md:col-span-2">
                <FieldLabel className="text-[var(--color-header-bg)]">
                  Description
                </FieldLabel>
                {level.description ? (
                  <div className="w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:mb-6 [&_h1]:mt-2 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-border/50 [&_h3]:text-xl [&_h3]:font-medium [&_h3]:mb-3 [&_h3]:mt-6 [&_ul]:my-4 [&_ul]:ms-6 [&_ul]:list-disc [&_ul_li]:pl-1 [&_ol]:my-4 [&_ol]:ms-6 [&_ol]:list-decimal [&_ol_li]:pl-1 [&_p]:my-4 [&_p]:leading-relaxed [&_p]:first:mt-0 [&_p]:last:mb-0 [&_a]:text-primary hover:[&_a]:underline [&_a]:underline-offset-4 [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-sm [&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground">
                    <MarkdownContent>{level.description}</MarkdownContent>
                  </div>
                ) : (
                  <Textarea
                    value="—"
                    readOnly
                    rows={1}
                    className="resize-none"
                  />
                )}
              </Field>
            </div>

            {level.editPath && (
              <div className="flex justify-end pt-6">
                <Button asChild>
                  <SmartLink href={level.editPath}>Edit</SmartLink>
                </Button>
              </div>
            )}
          </div>
        )}
      </DataState>
    </section>
  );
}
