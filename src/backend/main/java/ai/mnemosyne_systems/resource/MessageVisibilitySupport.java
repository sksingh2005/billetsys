package ai.mnemosyne_systems.resource;

import ai.mnemosyne_systems.model.Message;
import ai.mnemosyne_systems.model.Ticket;
import ai.mnemosyne_systems.model.User;
import ai.mnemosyne_systems.util.AuthHelper;
import ai.mnemosyne_systems.util.MessageAudienceSupport;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

final class MessageVisibilitySupport {

    private MessageVisibilitySupport() {
    }

    static List<Message> loadMessagesForViewer(Ticket ticket, User viewer) {
        if (ticket == null) {
            return List.of();
        }
        List<Message> messages = Message.find(
                "select distinct m from Message m left join fetch m.attachments where m.ticket = ?1 order by m.date desc",
                ticket).list();
        return filterVisibleMessages(messages, viewer);
    }

    static List<Message> filterVisibleMessages(List<Message> messages, User viewer) {
        if (messages == null || messages.isEmpty()) {
            return List.of();
        }
        List<Message> visible = new ArrayList<>();
        Set<Long> seenIds = new LinkedHashSet<>();
        for (Message message : messages) {
            if (!canViewMessage(viewer, message)) {
                continue;
            }
            if (message == null || message.id == null || seenIds.add(message.id)) {
                visible.add(message);
            }
        }
        return visible;
    }

    static boolean canViewMessage(User viewer, Message message) {
        if (viewer == null || message == null) {
            return false;
        }
        if (message.isPublic) {
            return true;
        }
        MessageAudienceSupport.Audience audience = MessageAudienceSupport.audienceFor(message.author);
        return audience != null && MessageAudienceSupport.belongsToAudience(viewer, audience);
    }

    static boolean canAccessTicket(User user, Ticket ticket) {
        if (user == null || ticket == null) {
            return false;
        }
        if (AuthHelper.isSupport(user)) {
            return true;
        }
        if (AuthHelper.isTam(user) || AuthHelper.isSuperuser(user)) {
            if (ticket.company == null || ticket.company.users == null || user.id == null) {
                return false;
            }
            return ticket.company.users.stream()
                    .anyMatch(existing -> existing.id != null && existing.id.equals(user.id));
        }
        return User.TYPE_USER.equalsIgnoreCase(user.type) && ticket.requester != null && ticket.requester.id != null
                && ticket.requester.id.equals(user.id);
    }

}
