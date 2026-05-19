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
import java.util.ArrayList;
import java.util.List;

public class StackTraceExtractor {

    public static List<String> extractStackTraces(String text) {
        List<String> traces = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return traces;
        }
        String[] lines = text.split("\\R");
        int i = 0;
        while (i < lines.length) {
            String line = lines[i].trim();
            if (isFrameLine(line)) {
                List<String> block = new ArrayList<>();
                // Look backward for exception/header line
                String header = null;
                if (i > 0) {
                    String prev = lines[i - 1].trim();
                    if (!isFrameLine(prev) && (prev.contains("Exception") || prev.contains("Error")
                            || prev.contains("Throwable") || prev.contains("at "))) {
                        header = prev;
                    }
                }
                if (header != null) {
                    block.add(header);
                }

                int frameCount = 0;
                while (i < lines.length) {
                    String curr = lines[i].trim();
                    if (isFrameLine(curr) || curr.startsWith("Caused by:")
                            || curr.matches("^\\s*\\.\\.\\.\\s+\\d+\\s+more\\s*$")) {
                        block.add(curr);
                        if (isFrameLine(curr)) {
                            frameCount++;
                        }
                        i++;
                    } else {
                        break;
                    }
                }
                if (frameCount >= 2) {
                    traces.add(String.join("\n", block));
                }
            } else {
                i++;
            }
        }
        return traces;
    }

    public static List<String> extractStackTracesFromAttachments(List<Attachment> attachments) {
        List<String> traces = new ArrayList<>();
        if (attachments == null) {
            return traces;
        }
        for (Attachment attachment : attachments) {
            if (attachment.data != null) {
                String text = new String(attachment.data, StandardCharsets.UTF_8);
                traces.addAll(extractStackTraces(text));
            }
        }
        return traces;
    }

    public static String normalizeStackTrace(String trace) {
        if (trace == null) {
            return "";
        }
        // Remove line numbers like :123) with )
        String withoutLineNumbers = trace.replaceAll(":\\d+\\)", ")");
        // Replace all whitespace with a single space to ignore formatting differences
        return withoutLineNumbers.replaceAll("\\s+", " ").trim();
    }

    private static boolean isFrameLine(String line) {
        return line.startsWith("at ") && line.contains("(") && line.contains(")");
    }
}
