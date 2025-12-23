package com.project.backend_api.security;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(1) // Run before other filters
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitingService rateLimitingService;
    private final com.project.backend_api.repository.LoginLogRepository loginLogRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Apply rate limiting only to login endpoint
        if (request.getRequestURI().contains("/api/auth/login") && "POST".equals(request.getMethod())) {

            // 2. Get real IP (Compatible with Cloudflare/Nginx)
            String ip = request.getHeader("X-Forwarded-For");
            if (ip == null || ip.isEmpty()) {
                ip = request.getRemoteAddr();
            } else {
                // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
                // Take the first one (the real client)
                ip = ip.split(",")[0].trim();
            }

            // 3. Get the bucket for this IP
            Bucket bucket = rateLimitingService.resolveBucket(ip);

            // 4. Try to consume 1 token
            ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

            if (!probe.isConsumed()) {
                // BLOCKED: No tokens remaining, return 429 error with Retry-After and JSON body
                long nanosToWait = probe.getNanosToWaitForRefill();
                long secondsToWait = java.util.concurrent.TimeUnit.NANOSECONDS.toSeconds(nanosToWait) + 1; // round up

                // Logging for audit
                org.slf4j.LoggerFactory.getLogger(RateLimitFilter.class)
                        .warn("Rate limit exceeded for IP {} - retry after {}s", ip, secondsToWait);

                // --- NUEVO: GUARDAR EN BASE DE DATOS ---
                try {
                    com.project.backend_api.model.LoginLog auditLog = com.project.backend_api.model.LoginLog.builder()
                            .ipAddress(ip)
                            .loginTime(java.time.LocalDateTime.now())
                            .expirationTime(null)
                            .userAgent(request.getHeader("User-Agent"))
                            .status("BLOCKED")
                            .failureReason("Rate Limit Exceeded (429)")
                            .active(false)
                            .build();

                    loginLogRepository.save(auditLog);
                } catch (Exception e) {
                    org.slf4j.LoggerFactory.getLogger(RateLimitFilter.class).error("No se pudo guardar el log de auditoría: {}", e.getMessage());
                }
                // ---------------------------------------

                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");

                // Add security headers so blocked responses are also hardened
                response.addHeader("X-Content-Type-Options", "nosniff");
                response.addHeader("X-Frame-Options", "DENY");
                response.addHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
                response.addHeader("Content-Security-Policy-Report-Only", SecurityConfig.CSP_REPORT_ONLY.replaceAll("[\\r\\n]", ""));

                // Inform client how long to wait
                response.addHeader("Retry-After", String.valueOf(secondsToWait));
                response.getWriter().write("{\"message\": \"Demasiados intentos. Por favor espere " + secondsToWait + " segundos.\", \"retry_after_seconds\": " + secondsToWait + "}");
                return; // Stop execution here
            }

            // Add informational headers
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
        }

        // If passed, continue to next filter
        filterChain.doFilter(request, response);
    }
}
