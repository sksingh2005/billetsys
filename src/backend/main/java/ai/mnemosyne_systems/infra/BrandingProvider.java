/*
 * Eclipse Public License - v 2.0
 *
 *   THE ACCOMPANYING PROGRAM IS PROVIDED UNDER THE TERMS OF THIS ECLIPSE
 *   PUBLIC LICENSE ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION
 *   OF THE PROGRAM CONSTITUTES RECIPIENT'S ACCEPTANCE OF THIS AGREEMENT.
 */

package ai.mnemosyne_systems.infra;

import ai.mnemosyne_systems.model.Company;
import ai.mnemosyne_systems.model.Installation;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Named;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

@Named("branding")
@ApplicationScoped
public class BrandingProvider {

    private static final String DEFAULT_INSTALLATION_LOGO_PATH = "doc/logo/logo.svg";

    public String installationCompanyName() {
        Installation installation = installation();
        if (installation != null) {
            if (installation.name != null && !installation.name.isBlank()) {
                return installation.name;
            }
            if (installation.company != null && installation.company.name != null
                    && !installation.company.name.isBlank()) {
                return installation.company.name;
            }
        }
        return "billetsys";
    }

    public String installationLogoBase64() {
        Installation installation = installation();
        if (installation != null && installation.logoBase64 != null && !installation.logoBase64.isBlank()) {
            return installation.logoBase64;
        }
        return defaultInstallationLogoBase64();
    }

    public String defaultInstallationLogoBase64() {
        try {
            Path repoLogo = Path.of(DEFAULT_INSTALLATION_LOGO_PATH);
            if (Files.exists(repoLogo)) {
                return svgDataUri(Files.readAllBytes(repoLogo));
            }
            try (InputStream stream = BrandingProvider.class.getResourceAsStream("/branding/logo.svg")) {
                if (stream == null) {
                    throw new IllegalStateException("Default installation logo resource is missing");
                }
                return svgDataUri(stream.readAllBytes());
            }
        } catch (IOException e) {
            throw new IllegalStateException("Unable to load default installation logo", e);
        }
    }

    private Installation installation() {
        return Installation.find("singletonKey", "installation").firstResult();
    }

    private String svgDataUri(byte[] svgBytes) {
        return "data:image/svg+xml;base64," + Base64.getEncoder().encodeToString(svgBytes);
    }
}
