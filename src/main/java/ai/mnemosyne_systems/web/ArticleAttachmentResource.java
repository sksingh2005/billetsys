/*
 * Eclipse Public License - v 2.0
 *
 *   THE ACCOMPANYING PROGRAM IS PROVIDED UNDER THE TERMS OF THIS ECLIPSE
 *   PUBLIC LICENSE ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION
 *   OF THE PROGRAM CONSTITUTES RECIPIENT'S ACCEPTANCE OF THIS AGREEMENT.
 */

package ai.mnemosyne_systems.web;

import ai.mnemosyne_systems.model.ArticleAttachment;
import ai.mnemosyne_systems.model.User;
import io.smallrye.common.annotation.Blocking;
import jakarta.ws.rs.CookieParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Path("/article-attachments")
@Produces(MediaType.TEXT_HTML)
@Blocking
public class ArticleAttachmentResource {

    @GET
    @Path("/{id}/data")
    @Produces("*/*")
    public Response data(@CookieParam(AuthHelper.AUTH_COOKIE) String auth, @PathParam("id") Long id) {
        User user = AuthHelper.findUser(auth);
        if (user == null) {
            throw new WebApplicationException(Response.seeOther(URI.create("/")).build());
        }
        ArticleAttachment attachment = ArticleAttachment.findById(id);
        if (attachment == null) {
            throw new NotFoundException();
        }
        String encoded = URLEncoder.encode(attachment.name, StandardCharsets.UTF_8).replace("+", "%20");
        return Response.ok(attachment.data, attachment.mimeType)
                .header("Content-Disposition", "inline; filename*=UTF-8''" + encoded).build();
    }
}
