/*
 * Eclipse Public License - v 2.0
 *
 *   THE ACCOMPANYING PROGRAM IS PROVIDED UNDER THE TERMS OF THIS ECLIPSE
 *   PUBLIC LICENSE ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION
 *   OF THE PROGRAM CONSTITUTES RECIPIENT'S ACCEPTANCE OF THIS AGREEMENT.
 */

package ai.mnemosyne_systems.resource;

import ai.mnemosyne_systems.model.Attachment;
import ai.mnemosyne_systems.model.Category;
import ai.mnemosyne_systems.model.CompanyEntitlement;
import ai.mnemosyne_systems.model.Level;
import ai.mnemosyne_systems.model.Message;
import ai.mnemosyne_systems.model.Ticket;
import ai.mnemosyne_systems.model.User;
import ai.mnemosyne_systems.model.Version;
import ai.mnemosyne_systems.util.AuthHelper;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

@QuarkusTest
class MessagePrivacyAccessTest extends AccessTestSupport {

    @Test
    void privateMessagesAreVisibleOnlyToMatchingGroups() {
        ensureUser("support1", "support1@mnemosyne-systems.ai", User.TYPE_SUPPORT, "support1");
        ensureUser("tam1", "tam1@mnemosyne-systems.ai", User.TYPE_TAM, "tam1");
        ensureUser("user", "user@mnemosyne-systems.ai", User.TYPE_USER, "user");
        ensureUser("superuser1", "superuser1@mnemosyne-systems.ai", User.TYPE_SUPERUSER, "superuser1");

        Long companyId = ensureCompany("Message Privacy Co");
        ensureCompanyUsers(companyId, "user@mnemosyne-systems.ai", "superuser1@mnemosyne-systems.ai",
                "tam1@mnemosyne-systems.ai");
        Ticket ticket = ensureTicket(companyId);
        String publicBody = "public-visible-" + System.nanoTime();
        String internalBody = "internal-private-" + System.nanoTime();
        String externalBody = "external-private-" + System.nanoTime();
        ensureTimedMessage(ticket, publicBody, "support1@mnemosyne-systems.ai",
                java.time.LocalDateTime.now().minusMinutes(1), true);
        Message internalMessage = ensureTimedMessage(ticket, internalBody, "support1@mnemosyne-systems.ai",
                java.time.LocalDateTime.now().minusMinutes(2), false);
        Message externalMessage = ensureTimedMessage(ticket, externalBody, "user@mnemosyne-systems.ai",
                java.time.LocalDateTime.now().minusMinutes(3), false);
        Attachment internalAttachment = ensureAttachment(internalMessage, "internal-private.txt");
        Attachment externalAttachment = ensureAttachment(externalMessage, "external-private.txt");

        String supportCookie = login("support1", "support1");
        String tamCookie = login("tam1", "tam1");
        String userCookie = login("user", "user");
        String superuserCookie = login("superuser1", "superuser1");

        RestAssured.given().cookie(AuthHelper.AUTH_COOKIE, supportCookie).get("/api/support/tickets/" + ticket.id)
                .then().statusCode(200).body("messages.body", Matchers.hasItems(publicBody, internalBody))
                .body("messages.body", Matchers.not(Matchers.hasItem(externalBody)))
                .body("messages.find { it.body == '" + internalBody + "' }.isPublic", Matchers.equalTo(false));

        RestAssured.given().cookie(AuthHelper.AUTH_COOKIE, tamCookie).get("/api/user/tickets/" + ticket.id).then()
                .statusCode(200).body("messages.body", Matchers.hasItems(publicBody, internalBody))
                .body("messages.body", Matchers.not(Matchers.hasItem(externalBody)));

        RestAssured.given().cookie(AuthHelper.AUTH_COOKIE, userCookie).get("/api/user/tickets/" + ticket.id).then()
                .statusCode(200).body("messages.body", Matchers.hasItems(publicBody, externalBody))
                .body("messages.body", Matchers.not(Matchers.hasItem(internalBody)))
                .body("messages.find { it.body == '" + externalBody + "' }.isPublic", Matchers.equalTo(false));

        RestAssured.given().cookie(AuthHelper.AUTH_COOKIE, superuserCookie).get("/api/superuser/tickets/" + ticket.id)
                .then().statusCode(200).body("messages.body", Matchers.hasItems(publicBody, externalBody))
                .body("messages.body", Matchers.not(Matchers.hasItem(internalBody)));

        RestAssured.given().cookie(AuthHelper.AUTH_COOKIE, userCookie).get("/api/attachments/" + internalAttachment.id)
                .then().statusCode(404);
        RestAssured.given().cookie(AuthHelper.AUTH_COOKIE, supportCookie)
                .get("/attachments/" + externalAttachment.id + "/data").then().statusCode(404);
    }

    @Test
    void privateVisibilityFlagPersistsForCreatedAndReplyMessages() {
        ensureUser("support1", "support1@mnemosyne-systems.ai", User.TYPE_SUPPORT, "support1");
        ensureUser("tam1", "tam1@mnemosyne-systems.ai", User.TYPE_TAM, "tam1");
        ensureDefaultCategories();

        Long companyId = ensureCompany("Private Create Co");
        ensureCompanyUsers(companyId, "tam1@mnemosyne-systems.ai");
        Ticket ticket = ensureTicket(companyId);
        CompanyEntitlement entitlement = CompanyEntitlement.find("company.id = ?1 order by id asc", companyId)
                .firstResult();
        Assertions.assertNotNull(entitlement);
        Version affectsVersion = Version.find("entitlement = ?1 order by date asc, id asc", entitlement.entitlement)
                .firstResult();
        Assertions.assertNotNull(affectsVersion);

        String supportCookie = login("support1", "support1");
        String privateCreateBody = "private-create-message-" + System.nanoTime();
        String privateReplyBody = "private-reply-message-" + System.nanoTime();

        RestAssured.given().redirects().follow(false).cookie(AuthHelper.AUTH_COOKIE, supportCookie)
                .multiPart("status", "Open").multiPart("title", "Private create title")
                .multiPart("message", privateCreateBody).multiPart("isPublic", "false")
                .multiPart("companyId", companyId).multiPart("companyEntitlementId", entitlement.id)
                .multiPart("categoryId", Category.findDefault().id).multiPart("affectsVersionId", affectsVersion.id)
                .post("/support/tickets").then().statusCode(303);

        Message createdMessage = Message.find("body", privateCreateBody).firstResult();
        Assertions.assertNotNull(createdMessage);
        Assertions.assertFalse(createdMessage.isPublic);

        RestAssured.given().redirects().follow(false).cookie(AuthHelper.AUTH_COOKIE, supportCookie)
                .multiPart("body", privateReplyBody).multiPart("isPublic", "false")
                .post("/support/tickets/" + ticket.id + "/messages").then().statusCode(303);

        Message replyMessage = Message.find("ticket = ?1 and body = ?2", ticket, privateReplyBody).firstResult();
        Assertions.assertNotNull(replyMessage);
        Assertions.assertFalse(replyMessage.isPublic);

        RestAssured.given().cookie(AuthHelper.AUTH_COOKIE, supportCookie).get("/api/support/tickets/" + ticket.id)
                .then().statusCode(200)
                .body("messages.find { it.body == '" + privateReplyBody + "' }.isPublic", Matchers.equalTo(false));
    }

    @Test
    void privateMessageEmailsStayWithinTheirAudience() {
        mailbox.clear();
        ensureUser("support1", "support1@mnemosyne-systems.ai", User.TYPE_SUPPORT, "support1");
        ensureUser("tam1", "tam1@mnemosyne-systems.ai", User.TYPE_TAM, "tam1");
        ensureUser("user", "user@mnemosyne-systems.ai", User.TYPE_USER, "user");
        ensureUser("superuser1", "superuser1@mnemosyne-systems.ai", User.TYPE_SUPERUSER, "superuser1");

        Long companyId = ensureCompany("Private Mail Co");
        ensureCompanyUsers(companyId, "user@mnemosyne-systems.ai", "superuser1@mnemosyne-systems.ai",
                "tam1@mnemosyne-systems.ai");
        Ticket ticket = ensureTicket(companyId);

        String supportCookie = login("support1", "support1");
        RestAssured.given().redirects().follow(false).cookie(AuthHelper.AUTH_COOKIE, supportCookie)
                .multiPart("body", "Private support email " + System.nanoTime()).multiPart("isPublic", "false")
                .post("/support/tickets/" + ticket.id + "/messages").then().statusCode(303);

        Assertions.assertFalse(mailbox.getMailsSentTo("support1@mnemosyne-systems.ai").isEmpty());
        Assertions.assertFalse(mailbox.getMailsSentTo("tam1@mnemosyne-systems.ai").isEmpty());
        Assertions.assertTrue(mailbox.getMailsSentTo("user@mnemosyne-systems.ai").isEmpty());
        Assertions.assertTrue(mailbox.getMailsSentTo("superuser1@mnemosyne-systems.ai").isEmpty());

        mailbox.clear();

        String userCookie = login("user", "user");
        RestAssured.given().redirects().follow(false).cookie(AuthHelper.AUTH_COOKIE, userCookie)
                .multiPart("body", "Private requester email " + System.nanoTime()).multiPart("isPublic", "false")
                .post("/user/tickets/" + ticket.id + "/messages").then().statusCode(303);

        Assertions.assertFalse(mailbox.getMailsSentTo("user@mnemosyne-systems.ai").isEmpty());
        Assertions.assertFalse(mailbox.getMailsSentTo("superuser1@mnemosyne-systems.ai").isEmpty());
        Assertions.assertTrue(mailbox.getMailsSentTo("support1@mnemosyne-systems.ai").isEmpty());
        Assertions.assertTrue(mailbox.getMailsSentTo("tam1@mnemosyne-systems.ai").isEmpty());
    }

    @Test
    void privateMessagesDoNotChangeOverviewSlaColors() {
        ensureUser("support1", "support1@mnemosyne-systems.ai", User.TYPE_SUPPORT, "support1");
        ensureUser("tam1", "tam1@mnemosyne-systems.ai", User.TYPE_TAM, "tam1");
        ensureUser("user", "user@mnemosyne-systems.ai", User.TYPE_USER, "user");
        ensureUser("superuser1", "superuser1@mnemosyne-systems.ai", User.TYPE_SUPERUSER, "superuser1");

        Long companyId = ensureCompany("Private SLA Co");
        ensureCompanyUsers(companyId, "user@mnemosyne-systems.ai", "superuser1@mnemosyne-systems.ai",
                "tam1@mnemosyne-systems.ai");
        Level urgent = ensureLevel("Normal", "Immediate response", 1, "Red");

        Ticket userViewTicket = ensureTicket(companyId);
        setTicketSupportLevel(userViewTicket.id, urgent.id);
        ensureTimedMessage(userViewTicket, "Old requester message", "user@mnemosyne-systems.ai",
                java.time.LocalDateTime.now().minusMinutes(10), true);

        String userCookie = login("user", "user");
        RestAssured.given().cookie(AuthHelper.AUTH_COOKIE, userCookie).get("/api/user/tickets").then().statusCode(200)
                .body("items.find { it.id == " + userViewTicket.id + " }.slaColor", Matchers.equalTo("Red"));

        ensureTimedMessage(userViewTicket, "Private support update", "support1@mnemosyne-systems.ai",
                java.time.LocalDateTime.now(), false);

        RestAssured.given().cookie(AuthHelper.AUTH_COOKIE, userCookie).get("/api/user/tickets").then().statusCode(200)
                .body("items.find { it.id == " + userViewTicket.id + " }.slaColor", Matchers.equalTo("Red"));

        Ticket supportViewTicket = ensureTicket(companyId);
        setTicketSupportLevel(supportViewTicket.id, urgent.id);
        ensureTimedMessage(supportViewTicket, "Old support message", "support1@mnemosyne-systems.ai",
                java.time.LocalDateTime.now().minusMinutes(10), true);

        String supportCookie = login("support1", "support1");
        RestAssured.given().cookie(AuthHelper.AUTH_COOKIE, supportCookie).get("/api/support/tickets").then()
                .statusCode(200)
                .body("items.find { it.id == " + supportViewTicket.id + " }.slaColor", Matchers.equalTo("Red"));

        ensureTimedMessage(supportViewTicket, "Private user update", "user@mnemosyne-systems.ai",
                java.time.LocalDateTime.now(), false);

        RestAssured.given().cookie(AuthHelper.AUTH_COOKIE, supportCookie).get("/api/support/tickets").then()
                .statusCode(200)
                .body("items.find { it.id == " + supportViewTicket.id + " }.slaColor", Matchers.equalTo("Red"));
    }
}
