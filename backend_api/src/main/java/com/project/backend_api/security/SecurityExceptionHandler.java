package com.project.backend_api.security;



import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class SecurityExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(SecurityExceptionHandler.class);

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        try {
            String path = request.getRequestURI();
            String method = request.getMethod();
            String csrfHeader = request.getHeader("X-XSRF-TOKEN");
            Cookie[] cookies = request.getCookies();
            StringBuilder cookieSummary = new StringBuilder();
            if (cookies != null) {
                for (Cookie c : cookies) {
                    cookieSummary.append(c.getName()).append("=").append(c.getValue()).append("; ");
                }
            }

            logger.warn("AccessDenied for {} {}. Reason: {}. X-XSRF-TOKEN='{}'. Cookies='{}'",
                    method, path, ex.getMessage(), csrfHeader, cookieSummary.toString());
        } catch (Exception e) {
            logger.warn("Error while logging AccessDeniedException details", e);
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
    }
}


