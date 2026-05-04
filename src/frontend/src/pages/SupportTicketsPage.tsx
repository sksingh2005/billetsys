/*
 * Eclipse Public License - v 2.0
 *
 *   THE ACCOMPANYING PROGRAM IS PROVIDED UNDER THE TERMS OF THIS ECLIPSE
 *   PUBLIC LICENSE ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION
 *   OF THE PROGRAM CONSTITUTES RECIPIENT'S ACCEPTANCE OF THIS AGREEMENT.
 */

import { useEffect } from "react";
import DataState from "../components/common/DataState";
import PageHeader from "../components/layout/PageHeader";
import useJson from "../hooks/useJson";
import { shouldUseLightTextOnColor, toQueryString } from "../utils/formatting";
import { SmartLink } from "../utils/routing";
import type { SessionPageProps } from "../types/app";
import type { CollectionResponse, TicketListItem } from "../types/domain";
import { Button } from "../components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

interface SupportTicketsPageProps extends SessionPageProps {
  view: "assigned" | "open" | "closed";
  apiBase?: string;
  createFallbackPath?: string;
  title?: string;
}

interface TicketListResponse extends CollectionResponse<TicketListItem> {
  view?: "assigned" | "open" | "closed";
  searchTerm?: string;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName.toLowerCase();
  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    Boolean(target.closest("[contenteditable='true']"))
  );
}

export default function SupportTicketsPage({
  title,
  view,
  apiBase = "/api/support/tickets",
  createFallbackPath = "/support/tickets/new",
}: SupportTicketsPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const locationSearchTerm =
    new URLSearchParams(location.search).get("q") || "";
  const query = toQueryString({
    view: view !== "assigned" ? view : undefined,
    q: locationSearchTerm || undefined,
  });
  const ticketsState = useJson<TicketListResponse>(`${apiBase}${query}`);
  const currentView = ticketsState.data?.view || view || "assigned";
  const activeSearch = ticketsState.data?.searchTerm || locationSearchTerm;
  const showLevelColumn = apiBase !== "/api/user/tickets";
  const showCreateButton = !(
    apiBase === "/api/user/tickets" && currentView === "closed"
  );
  const pageTitle =
    title ||
    (currentView === "open"
      ? "Open tickets"
      : currentView === "closed"
        ? "Closed tickets"
        : "Active tickets");
  const emptyMessage = activeSearch
    ? `No tickets matched "${activeSearch}".`
    : "No tickets";
  const shortcutTickets = (ticketsState.data?.items || []).slice(0, 10);

  useEffect(() => {
    if (shortcutTickets.length === 0) {
      return undefined;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        !event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        isEditableTarget(event.target)
      ) {
        return;
      }
      const shortcutIndex =
        event.key === "0" ? 10 : Number.parseInt(event.key, 10);
      if (
        Number.isNaN(shortcutIndex) ||
        shortcutIndex < 1 ||
        shortcutIndex > 10
      ) {
        return;
      }
      const ticket = shortcutTickets[shortcutIndex - 1];
      if (!ticket?.detailPath) {
        return;
      }
      event.preventDefault();
      navigate(ticket.detailPath);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate, shortcutTickets]);

  return (
    <div className="w-full mx-auto mt-2">
      <PageHeader
        title={pageTitle}
        actions={
          <div className="flex flex-wrap gap-2">
            {showCreateButton ? (
              <Button asChild>
                <SmartLink
                  href={ticketsState.data?.createPath || createFallbackPath}
                >
                  Create
                </SmartLink>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="w-full">
        <DataState state={ticketsState} emptyMessage={emptyMessage}>
          <div className="max-w-full overflow-x-auto">
            <Table className="text-base">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="whitespace-nowrap">Name</TableHead>
                  <TableHead className="min-w-[160px]">Title</TableHead>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Category</TableHead>
                  <TableHead className="whitespace-nowrap">Support</TableHead>
                  <TableHead className="whitespace-nowrap">Company</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Entitlement
                  </TableHead>
                  {showLevelColumn && (
                    <TableHead className="whitespace-nowrap">Level</TableHead>
                  )}
                  <TableHead className="whitespace-nowrap">Affects</TableHead>
                  {currentView === "closed" && (
                    <TableHead className="whitespace-nowrap">
                      Resolved
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(ticketsState.data?.items || []).map(
                  (ticket: TicketListItem) => {
                    const useLightText = shouldUseLightTextOnColor(
                      ticket.slaColor,
                    );
                    const linkClass = useLightText
                      ? "text-white"
                      : ticket.slaColor
                        ? "text-[#111827]"
                        : "text-primary";
                    const secondaryClass = ticket.slaColor
                      ? ""
                      : "text-muted-foreground";
                    return (
                      <TableRow
                        key={ticket.id}
                        className={
                          useLightText
                            ? "hover:opacity-90 transition-opacity"
                            : ""
                        }
                        style={
                          ticket.slaColor
                            ? {
                                backgroundColor: ticket.slaColor,
                                color: useLightText ? "#ffffff" : "#111827",
                              }
                            : undefined
                        }
                      >
                        <TableCell className="font-medium py-3 px-4">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <SmartLink
                              className={`font-semibold hover:underline ${linkClass}`}
                              href={ticket.detailPath}
                            >
                              {ticket.name}
                            </SmartLink>
                            {ticket.messageDirectionArrow && (
                              <span className="opacity-70 text-sm translate-y-px">
                                {ticket.messageDirectionArrow}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={`py-3 px-4 ${secondaryClass}`}>
                          {ticket.title || "-"}
                        </TableCell>
                        <TableCell
                          className={`whitespace-nowrap py-3 px-4 ${secondaryClass}`}
                        >
                          {ticket.messageDateLabel || "-"}
                        </TableCell>
                        <TableCell
                          className={`whitespace-nowrap py-3 px-4 ${secondaryClass}`}
                        >
                          {ticket.status || "-"}
                        </TableCell>
                        <TableCell
                          className={`whitespace-nowrap py-3 px-4 ${secondaryClass}`}
                        >
                          {ticket.categoryName || "-"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap py-3 px-4">
                          {ticket.supportUser ? (
                            <a
                              className={`hover:underline ${linkClass}`}
                              href={ticket.supportUser.detailPath}
                            >
                              {ticket.supportUser.displayName ||
                                ticket.supportUser.username}
                            </a>
                          ) : (
                            <span className={secondaryClass}>—</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap py-3 px-4">
                          {ticket.companyPath ? (
                            <a
                              className={`hover:underline ${linkClass}`}
                              href={ticket.companyPath}
                            >
                              {ticket.companyName}
                            </a>
                          ) : (
                            <span className={secondaryClass}>
                              {ticket.companyName || "—"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell
                          className={`whitespace-nowrap py-3 px-4 ${secondaryClass}`}
                        >
                          {ticket.entitlementName || "-"}
                        </TableCell>
                        {showLevelColumn && (
                          <TableCell
                            className={`whitespace-nowrap py-3 px-4 ${secondaryClass}`}
                          >
                            {ticket.levelName || "-"}
                          </TableCell>
                        )}
                        <TableCell
                          className={`whitespace-nowrap py-3 px-4 ${secondaryClass}`}
                        >
                          {ticket.affectsVersionName || "-"}
                        </TableCell>
                        {currentView === "closed" && (
                          <TableCell
                            className={`whitespace-nowrap py-3 px-4 ${secondaryClass}`}
                          >
                            {ticket.resolvedVersionName || "-"}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>
          </div>
        </DataState>
      </div>
    </div>
  );
}
