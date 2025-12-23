package com.project.backend_api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "login_logs", schema = "security")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    private String token;

    @Column(name = "login_time", nullable = false)
    private LocalDateTime loginTime;

    @Column(name = "expiration_time")
    private LocalDateTime expirationTime;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Builder.Default
    private Boolean active = true;

    // New audit fields
    @Column(name = "status")
    private String status;

    @Column(name = "failure_reason")
    private String failureReason;
}
