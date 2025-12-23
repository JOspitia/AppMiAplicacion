package com.project.backend_api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class CsrfCookieFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Obtener el token (esto recupera el objeto, pero no necesariamente el valor
        // string aun)
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());

        // 2. Renderizar el token en la respuesta (escribe la cookie)
        // Al llamar a .getToken(), Spring Security verifica si el token ya está en la
        // respuesta;
        // si no, lo genera y lo adjunta como cookie gracias al
        // CookieCsrfTokenRepository.
        if (csrfToken != null) {
            csrfToken.getToken();
        }

        // 3. Continuar
        filterChain.doFilter(request, response);
    }
}
