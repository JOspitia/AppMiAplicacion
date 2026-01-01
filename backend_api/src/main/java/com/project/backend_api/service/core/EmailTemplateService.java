package com.project.backend_api.service.core;

import com.project.backend_api.model.core.administration.EmailTemplate;
import com.project.backend_api.repository.core.administration.EmailTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailTemplateService {

    private final EmailTemplateRepository emailTemplateRepository;

    public EmailTemplate getTemplate(String templateKey) {
        return emailTemplateRepository.findByTemplateKeyAndActiveTrue(templateKey)
                .orElseThrow(() -> new RuntimeException("Email template not found or inactive: " + templateKey));
    }

    public String processSubject(EmailTemplate template, Map<String, String> variables) {
        return replacePlaceholders(template.getSubject(), variables);
    }

    public String processHtmlContent(EmailTemplate template, Map<String, String> variables) {
        return replacePlaceholders(template.getHtmlContent(), variables);
    }

    public String processPlainTextContent(EmailTemplate template, Map<String, String> variables) {
        if (template.getPlainTextContent() == null || template.getPlainTextContent().isEmpty()) {
            return stripHtmlTags(processHtmlContent(template, variables));
        }
        return replacePlaceholders(template.getPlainTextContent(), variables);
    }

    private String replacePlaceholders(String content, Map<String, String> variables) {
        if (content == null)
            return "";
        String result = content;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            String value = entry.getValue() != null ? entry.getValue() : "";
            result = result.replace(placeholder, value);
        }
        return result;
    }

    private String stripHtmlTags(String html) {
        if (html == null)
            return "";
        return html.replaceAll("<[^>]*>", "")
                .replaceAll("&nbsp;", " ")
                .replaceAll("&amp;", "&")
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .trim();
    }
}
