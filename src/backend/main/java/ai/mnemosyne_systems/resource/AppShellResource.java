/*
 * Eclipse Public License - v 2.0
 *
 *   THE ACCOMPANYING PROGRAM IS PROVIDED UNDER THE TERMS OF THIS ECLIPSE
 *   PUBLIC LICENSE ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION
 *   OF THE PROGRAM CONSTITUTES RECIPIENT'S ACCEPTANCE OF THIS AGREEMENT.
 */

package ai.mnemosyne_systems.resource;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

@Path("/app")
public class AppShellResource {

    @GET
    public Response index(@Context UriInfo uriInfo) {
        String query = uriInfo.getRequestUri().getRawQuery();
        String location = query != null ? "/?" + query : "/";
        return Response.status(Response.Status.SEE_OTHER).header("Location", location).build();
    }

    @GET
    @Path("{path:.*}")
    public Response legacyDeepLink(@PathParam("path") String path, @Context UriInfo uriInfo) {
        String query = uriInfo.getRequestUri().getRawQuery();
        String location = query != null ? "/" + path + "?" + query : "/" + path;
        return Response.status(Response.Status.SEE_OTHER).header("Location", location).build();
    }
}
