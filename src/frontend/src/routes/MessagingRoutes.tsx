/*
 * Eclipse Public License - v 2.0
 *
 *   THE ACCOMPANYING PROGRAM IS PROVIDED UNDER THE TERMS OF THIS ECLIPSE
 *   PUBLIC LICENSE ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION
 *   OF THE PROGRAM CONSTITUTES RECIPIENT'S ACCEPTANCE OF THIS AGREEMENT.
 */

import { lazy } from "react";
import type { AppRoute, SessionState } from "../types/app";

const AttachmentPage = lazy(() => import("../pages/AttachmentPage"));

export function getMessagingRoutes(sessionState: SessionState): AppRoute[] {
  return [
    {
      path: "/attachments/:id",
      element: <AttachmentPage sessionState={sessionState} />,
      requiresAuth: true,
    },
  ];
}
