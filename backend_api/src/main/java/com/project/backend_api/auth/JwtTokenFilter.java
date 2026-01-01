package com.project.backend_api.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import com.project.backend_api.security.JwtUtils;
import com.project.backend_api.security.CustomUserDetailsService;
import com.project.backend_api.security.CustomUserDetails;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

@Component
public class JwtTokenFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenFilter.class);

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String jwt = parseJwt(request);

            logger.debug("JwtTokenFilter - Path: {}, JWT found: {}", request.getRequestURI(), jwt != null);

            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                logger.debug("JwtTokenFilter - Valid JWT for user: {}", username);

                // Extract company context if present
                java.util.UUID companyId = null;
                if (request.getCookies() != null) {
                    for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                        if ("companyContext".equals(cookie.getName())) {
                            try {
                                companyId = java.util.UUID.fromString(cookie.getValue());
                            } catch (Exception e) {
                                // Ignore invalid UUID
                            }
                            break;
                        }
                    }
                }

                CustomUserDetails userDetails = userDetailsService
                        .loadUserByUsernameAndCompany(username, companyId);

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.debug("JwtTokenFilter - Authentication set for user: {}", username);
            } else {
                logger.debug("JwtTokenFilter - No valid JWT found");
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        // HYBRID STRATEGY: Prioritize Authorization Header (more reliable for SPAs)
        // 1. Try Authorization Header first
        String headerAuth = request.getHeader("Authorization");
        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            logger.debug("parseJwt - JWT found in Authorization header");
            return headerAuth.substring(7);
        }

        // 2. Fallback: Try Cookie (for initial requests or legacy support)
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    logger.debug("parseJwt - JWT cookie found!");
                    return cookie.getValue();
                }
            }
        }

        logger.debug("parseJwt - No JWT found in headers or cookies for path: {}", request.getRequestURI());
        return null;
    }
}
