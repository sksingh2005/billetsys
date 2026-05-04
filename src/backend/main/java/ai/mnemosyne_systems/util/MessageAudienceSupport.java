/*
 * Eclipse Public License - v 2.0
 *
 *   THE ACCOMPANYING PROGRAM IS PROVIDED UNDER THE TERMS OF THIS ECLIPSE
 *   PUBLIC LICENSE ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION
 *   OF THE PROGRAM CONSTITUTES RECIPIENT'S ACCEPTANCE OF THIS AGREEMENT.
 */

package ai.mnemosyne_systems.util;

import ai.mnemosyne_systems.model.User;

public final class MessageAudienceSupport {

    private MessageAudienceSupport() {
    }

    public static Audience audienceFor(User author) {
        if (author == null) {
            return null;
        }
        if (AuthHelper.isSupport(author) || AuthHelper.isTam(author)) {
            return Audience.SUPPORT_TAM;
        }
        if (User.TYPE_USER.equalsIgnoreCase(author.type) || AuthHelper.isSuperuser(author)) {
            return Audience.USER_SUPERUSER;
        }
        return null;
    }

    public static boolean belongsToAudience(User viewer, Audience audience) {
        if (viewer == null || audience == null) {
            return false;
        }
        return switch (audience) {
            case SUPPORT_TAM -> AuthHelper.isSupport(viewer) || AuthHelper.isTam(viewer);
            case USER_SUPERUSER -> User.TYPE_USER.equalsIgnoreCase(viewer.type) || AuthHelper.isSuperuser(viewer);
        };
    }

    public enum Audience {
        SUPPORT_TAM, USER_SUPERUSER
    }
}
