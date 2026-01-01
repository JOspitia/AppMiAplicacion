package com.project.backend_api.service.core;

import com.project.backend_api.model.core.administration.EmailTemplate;
import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final EmailTemplateService emailTemplateService;

    @Value("${spring.mail.enabled:false}")
    private boolean emailEnabled;

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.from.email:onboarding@resend.dev}")
    private String fromEmail;

    @Value("${app.base-url:https://appmiaplicacion.com}")
    private String baseUrl;

    @Value("${app.contact.email:admin@example.com}")
    private String contactEmail;

    /**
     * Generic method to send an email using a template key from the database.
     * This avoids having to create a specific method for every new template.
     */
    public boolean sendTemplateEmail(String toEmail, String templateKey, Map<String, String> variables) {
        try {
            EmailTemplate template = emailTemplateService.getTemplate(templateKey);

            // Inject global variables if not present
            variables.putIfAbsent("appName", "Mi Aplicación");
            variables.putIfAbsent("baseUrl", baseUrl);
            variables.putIfAbsent("supportEmail", fromEmail);

            String subject = emailTemplateService.processSubject(template, variables);
            String htmlContent = emailTemplateService.processHtmlContent(template, variables);
            String plainText = emailTemplateService.processPlainTextContent(template, variables);

            return sendHtmlEmail(toEmail, subject, htmlContent, plainText);
        } catch (Exception e) {
            log.error("Failed to send template email ({}) to: {}", templateKey, toEmail, e);
            return false;
        }
    }

    /**
     * Send HTML email via Resend
     */
    private boolean sendHtmlEmail(String to, String subject, String htmlContent, String plainText) {
        if (!emailEnabled) {
            log.info("==================================================");
            log.info("MOCK EMAIL SERVICE");
            log.info("To: {}", to);
            log.info("Subject: {}", subject);
            log.info("Content (Preview): {}",
                    plainText.length() > 100 ? plainText.substring(0, 100) + "..." : plainText);
            log.info("==================================================");
            return true;
        }

        try {
            if (resendApiKey == null || resendApiKey.isBlank()) {
                log.warn("Resend API key is not configured, falling back to mock");
                return true;
            }

            Resend resend = new Resend(resendApiKey);

            CreateEmailOptions options = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(to)
                    .subject(subject)
                    .html(htmlContent)
                    .text(plainText)
                    .build();

            CreateEmailResponse response = resend.emails().send(options);
            log.info("Email sent successfully via Resend. ID: {}", response.getId());
            return response != null && response.getId() != null;
        } catch (Exception e) {
            log.error("Error in Resend API sending to {}: {}", to, e.getMessage());
            return false;
        }
    }
}
