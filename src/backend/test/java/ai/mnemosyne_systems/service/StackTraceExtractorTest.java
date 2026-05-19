/*
 * Eclipse Public License - v 2.0
 *
 *   THE ACCOMPANYING PROGRAM IS PROVIDED UNDER THE TERMS OF THIS ECLIPSE
 *   PUBLIC LICENSE ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION
 *   OF THE PROGRAM CONSTITUTES RECIPIENT'S ACCEPTANCE OF THIS AGREEMENT.
 */

package ai.mnemosyne_systems.service;

import ai.mnemosyne_systems.model.Attachment;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class StackTraceExtractorTest {

    @Test
    public void testExtractStackTracesFromText() {
        String body = "Hey developer,\n" + "I encountered the following issue in production:\n\n"
                + "java.lang.NullPointerException: Cannot invoke \"String.trim()\" because \"body\" is null\n"
                + "    at ai.mnemosyne_systems.service.IncomingEmailService.processIncomingEmail(IncomingEmailService.java:44)\n"
                + "    at ai.mnemosyne_systems.resource.IncomingEmailResource.process(IncomingEmailResource.java:52)\n"
                + "\n" + "Please fix this ASAP!";

        List<String> traces = StackTraceExtractor.extractStackTraces(body);
        Assertions.assertEquals(1, traces.size());

        String trace = traces.get(0);
        Assertions.assertTrue(trace.contains("java.lang.NullPointerException"));
        Assertions.assertTrue(trace.contains("processIncomingEmail"));
        Assertions.assertTrue(trace.contains("process"));
    }

    @Test
    public void testExtractStackTracesFromAttachments() {
        Attachment attachment = new Attachment();
        attachment.name = "error.log";
        attachment.mimeType = "text/plain";
        attachment.data = ("Uncaught exception:\n" + "java.lang.RuntimeException: Something went wrong\n"
                + "    at ai.mnemosyne_systems.service.SomeService.doWork(SomeService.java:12)\n"
                + "    at ai.mnemosyne_systems.service.SomeService.start(SomeService.java:8)\n"
                + "Caused by: java.io.IOException: Disk full\n"
                + "    at java.base/java.io.FileOutputStream.writeBytes(Native Method)\n" + "    ... 3 more")
                        .getBytes(StandardCharsets.UTF_8);

        List<String> traces = StackTraceExtractor
                .extractStackTracesFromAttachments(Collections.singletonList(attachment));
        Assertions.assertEquals(1, traces.size());

        String trace = traces.get(0);
        Assertions.assertTrue(trace.contains("java.lang.RuntimeException"));
        Assertions.assertTrue(trace.contains("doWork"));
        Assertions.assertTrue(trace.contains("Disk full"));
    }

    @Test
    public void testNormalizeStackTrace() {
        String trace1 = "java.lang.NullPointerException\n"
                + "    at ai.mnemosyne_systems.service.IncomingEmailService.processIncomingEmail(IncomingEmailService.java:44)\n"
                + "    at ai.mnemosyne_systems.resource.IncomingEmailResource.process(IncomingEmailResource.java:52)";

        String trace2 = "java.lang.NullPointerException\n"
                + "  at ai.mnemosyne_systems.service.IncomingEmailService.processIncomingEmail(IncomingEmailService.java:46)\n"
                + "  at ai.mnemosyne_systems.resource.IncomingEmailResource.process(IncomingEmailResource.java:53)";

        String normalized1 = StackTraceExtractor.normalizeStackTrace(trace1);
        String normalized2 = StackTraceExtractor.normalizeStackTrace(trace2);

        Assertions.assertEquals(normalized1, normalized2);
        Assertions.assertFalse(normalized1.contains("44"));
        Assertions.assertFalse(normalized2.contains("46"));
    }

    @Test
    public void testNoStackTrace() {
        String body = "Hello, I have a question about how to set up SSO on the business plan.";
        List<String> traces = StackTraceExtractor.extractStackTraces(body);
        Assertions.assertTrue(traces.isEmpty());
    }
}
