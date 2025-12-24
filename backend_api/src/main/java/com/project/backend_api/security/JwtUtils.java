package com.project.backend_api.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.project.backend_api.model.User;

import java.security.Key;
import java.util.Date;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtUtils {

    // -------------------------------------------------------------------
    // private fields
    // -------------------------------------------------------------------

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    // -------------------------------------------------------------------
    // @Value
    // -------------------------------------------------------------------

    @Value("${app.jwtSecret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs:3600000}")
    private int jwtExpirationMs;

    @Value("${app.jwtRefreshExpirationMs:86400000}")
    private int jwtRefreshExpirationMs;

    @Value("${app.jwtCookieName:jwt}")
    private String jwtCookie;

    @Value("${app.jwtRefreshCookieName:refresh-jwt}")
    private String jwtRefreshCookie;

    @Value("${app.security.cookie-secure:false}")
    private boolean cookieSecure;

    // -------------------------------------------------------------------
    // public methods generate cookies
    // -------------------------------------------------------------------

    // Generate JWT cookie for CustomUserDetails
    public ResponseCookie generateJwtCookie(CustomUserDetails userPrincipal) {
        String jwt = generateTokenFromUsername(userPrincipal.getUsername());
        return generateCookie(jwtCookie, jwt, 24 * 60 * 60);
    }

    // Generate JWT cookie for User
    public ResponseCookie generateJwtCookie(User user) {
        String jwt = generateTokenFromUsername(user.getUsername());
        return generateCookie(jwtCookie, jwt, 24 * 60 * 60);
    }

    // Generate Refresh JWT cookie
    public ResponseCookie generateRefreshJwtCookie(String refreshToken) {
        return generateCookie(jwtRefreshCookie, refreshToken, jwtRefreshExpirationMs / 1000);
    }

    // Clean JWT cookie
    public ResponseCookie getCleanJwtCookie() {
        return generateCookie(jwtCookie, "", 0);
    }

    // Clean Refresh JWT cookie
    public ResponseCookie getCleanRefreshJwtCookie() {
        return generateCookie(jwtRefreshCookie, "", 0);
    }

    // -------------------------------------------------------------------
    // Private methods helpers
    // -------------------------------------------------------------------

    // Generate cookie with dynamic configuration
    private ResponseCookie generateCookie(String name, String value, long maxAgeSeconds) {
        // Path Strategy:
        // - Refresh Token: Strict path to endpoint ("/api/auth/refreshtoken")
        // - Access Token / Others: Root directory ("/") for maximum SPA compatibility
        // and to overwrite old cookies
        String path = name.equals(jwtRefreshCookie) ? "/api/auth/refreshtoken" : "/";

        return ResponseCookie.from(name, value)
                .path(path)
                .maxAge(maxAgeSeconds)
                .httpOnly(true)
                .secure(cookieSecure) // true en producción, false en desarrollo
                .sameSite(cookieSecure ? "None" : "Lax") // None requiere Secure=true
                .build();
    }

    // -------------------------------------------------------------------
    // Logic jwt
    // -------------------------------------------------------------------

    // Generate token
    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return generateTokenFromUsername(userPrincipal.getUsername());
    }

    // Generate token from username
    public String generateTokenFromUsername(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Generate JWT cookie for UserDetails
    public ResponseCookie generateJwtCookie(UserDetails userPrincipal) {
        String jwt = generateTokenFromUsername(userPrincipal.getUsername());
        return ResponseCookie.from(jwtCookie, jwt)
                .path("/")
                .maxAge(24 * 60 * 60)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .build();
    }

    /**
     * Compute the expiration Date that will be used for a newly generated token.
     * Useful to persist token expiry alongside the login event.
     */

    // Compute expiration date from now
    public java.util.Date computeExpirationDateFromNow() {
        return new Date((new Date()).getTime() + jwtExpirationMs);
    }

    // Generate key
    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    // Get username from JWT token
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    // Validate JWT token
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }

        return false;
    }

    // Parse JWT from cookie
    public String parseJwtFromCookie(HttpServletRequest request) {
        return getCookieValueByName(request, jwtCookie);
    }

    // Parse JWT refresh from cookie
    public String parseJwtRefreshFromCookie(HttpServletRequest request) {
        return getCookieValueByName(request, jwtRefreshCookie);
    }

    // Get cookie value by name
    private String getCookieValueByName(HttpServletRequest request, String name) {
        jakarta.servlet.http.Cookie cookie = org.springframework.web.util.WebUtils.getCookie(request, name);
        if (cookie != null) {
            return cookie.getValue();
        }
        return null;
    }

    // Keep the old one for backward compatibility if needed, but better to use the
    // new one
    public String parseJwtFromCookie(HttpServletRequest request, String cookieName) {
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if (cookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
