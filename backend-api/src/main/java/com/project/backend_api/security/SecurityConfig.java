package com.project.backend_api.security;

import com.project.backend_api.auth.JwtTokenFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtTokenFilter jwtTokenFilter;

    @Autowired
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private CsrfCookieFilter csrfCookieFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                        .ignoringRequestMatchers("/api/auth/**", "/api/public/**", "/api/assets/**",
                                "/api/companies/**"))
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/api/public/**", "/api/assets/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .headers(headers -> {
                    headers.referrerPolicy(referrer -> referrer
                            .policy(ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN));

                    headers.contentSecurityPolicy(csp -> csp
                            .policyDirectives("default-src 'self'; " +
                                    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://sdk.mercadopago.com https://cdn.jsdelivr.net https://npmcdn.com https://ajax.googleapis.com https://cdnjs.cloudflare.com https://*.mercadopago.com https://*.mercadolibre.com https://*.mlstatic.com https://static.cloudflareinsights.com; "
                                    +
                                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://*.mercadopago.com https://*.mlstatic.com; "
                                    +
                                    "font-src 'self' https://fonts.gstatic.com https://*.mercadopago.com https://*.mlstatic.com; "
                                    +
                                    "img-src 'self' data: blob: https://*; " +
                                    "connect-src 'self' https://*; " +
                                    "frame-src 'self' https://*.mercadopago.com https://*.mercadopago.com.co https://*.mercadolibre.com https://*.mercadolibre.com.co;"));

                    headers.permissionsPolicyHeader(permissions -> permissions
                            .policy("camera=(), microphone=(), geolocation=()"));

                    headers.httpStrictTransportSecurity(hsts -> hsts
                            .includeSubDomains(true)
                            .preload(true)
                            .maxAgeInSeconds(31536000));
                })
                // Force CSRF Cookie generation
                .addFilterAfter(csrfCookieFilter,
                        org.springframework.security.web.authentication.www.BasicAuthenticationFilter.class)
                // Add Rate Limiting filter BEFORE authentication
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("https://appmiaplicacion.com", "http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-XSRF-TOKEN"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
