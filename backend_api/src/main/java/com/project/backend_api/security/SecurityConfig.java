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
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import jakarta.servlet.DispatcherType;

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

        // CSP used for Report-Only responses (start strict but allow style inline
        // temporarily)
        public static final String CSP_REPORT_ONLY = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; upgrade-insecure-requests;";

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf
                                                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                                                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                                                .ignoringRequestMatchers(
                                                                new AntPathRequestMatcher("/api/auth/**"),
                                                                new AntPathRequestMatcher("/api/public/**"),
                                                                new AntPathRequestMatcher("/api/assets/**"),
                                                                new AntPathRequestMatcher("/api/management/**"),
                                                                new AntPathRequestMatcher("/api/core/**"),
                                                                new AntPathRequestMatcher("/api/rrhh/**"),
                                                                new AntPathRequestMatcher("/api/companies/**"),
                                                                new AntPathRequestMatcher("/error")))

                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                                                .requestMatchers("/api/auth/**", "/api/public/**", "/api/assets/**",
                                                                "/api/companies/current", "/error")
                                                .permitAll()
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/private/assets/*/images/**")
                                                .permitAll()
                                                .anyRequest().authenticated())
                                .headers(headers -> {
                                        headers.referrerPolicy(referrer -> referrer
                                                        .policy(ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN));

                                        /* Report-Only CSP: does not block, but informs of violations. */
                                        headers.contentSecurityPolicy(csp -> csp
                                                        .policyDirectives(CSP_REPORT_ONLY)
                                                        .reportOnly());

                                        /* Additional hardening headers */
                                        // X-Content-Type-Options: nosniff and X-XSS-Protection removed (deprecated in
                                        // Spring Security 6.1)
                                        headers.frameOptions(frame -> frame.deny()); // X-Frame-Options: DENY

                                        headers.permissionsPolicyHeader(permissions -> permissions
                                                        .policy("camera=(), microphone=(), geolocation=()"));

                                        headers.httpStrictTransportSecurity(hsts -> hsts
                                                        .includeSubDomains(true)
                                                        .preload(true)
                                                        .maxAgeInSeconds(31536000));
                                })
                                .addFilterAfter(csrfCookieFilter,
                                                org.springframework.security.web.authentication.www.BasicAuthenticationFilter.class)
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
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
                configuration.setAllowCredentials(true);
                configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-XSRF-TOKEN"));
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
