package com.project.backend_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.data.jpa.repository.config.EnableJpaAuditing(auditorAwareRef = "springSecurityAuditorAware")
public class BackendApiApplication {

    @jakarta.annotation.PostConstruct
    public void init() {
        // Set the default timezone for the application
        java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("America/Bogota"));
    }

    public static void main(String[] args) {
        SpringApplication.run(BackendApiApplication.class, args);
    }

}
