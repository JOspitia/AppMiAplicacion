---
description: WORKFLOW 1: BACKEND (Spring Boot API)
---

### Objetivo
Crear una API REST segura, persistente y desacoplada del frontend, lista para escalar.

### 1. Inicialización del Proyecto
Genera el proyecto en [start.spring.io](https://start.spring.io) con esta configuración:

- **Project**: Maven
- **Language**: Java 21 (LTS)
- **Spring Boot**: 3.4.x (o superior)
- **Dependencies**:
    - **Spring Web** (API REST)
    - **Spring Security** (Autenticación blindada)
    - **Spring Data JPA** (Persistencia)
    - **PostgreSQL Driver** (Motor DB)
    - **Flyway Migration** (Migraciones de BD: `configuration`, `security`, `business`)
    - **Validation** (Validación de DTOs)
    - **Lombok** (Productividad)
    - **AWS SDK for S3** (Para integración con **MinIO**)

### 2. Configuración de Seguridad (SecurityConfig.java)
Implementación de seguridad stateless con JWT entregado vía Cookies HttpOnly.

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()) // Sincronizado con el frontend
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Restringido al dominio del frontend
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .addFilterBefore(new JwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Definir origen del frontend (ej: http://localhost:4200)
        configuration.setAllowedOrigins(List.of("http://localhost:4200")); 
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowCredentials(true); // Vital para Cookies HttpOnly
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-XSRF-TOKEN"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 3. Estructura y Almacenamiento
- **DDD (Domain Driven Design)**: Organizar por módulos de dominio.
- **Flyway**: Organizar scripts en `src/main/resources/db/migration` siguiendo prefijos como `configuration`, `security`, `business`.
- **MinIO**: Implementar un Service que use el SDK de S3 para el manejo de documentos.

```plaintext
src/main/java/com/tuempresa/backend_api
├── auth/            # Security & JWT logic
├── storage/         # S3 / MinIO Integration
├── employees/       # Business Domain
├── payroll/         # Business Domain
└── shared/          # Global Configs
```

### 4. Dockerfile (Backend)
Optimizado para despliegue productivo.

```dockerfile
# Etapa 1: Builder
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```
