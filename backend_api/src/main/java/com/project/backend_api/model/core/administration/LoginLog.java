package com.project.backend_api.model.core.administration;



import com.project.backend_api.model.core.management.User;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "login_logs", schema = "security")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String token;

    @Column(name = "login_time")
    private LocalDateTime loginTime;

    @Column(name = "expiration_time")
    private LocalDateTime expirationTime;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    private String status;

    @Builder.Default
    private Boolean active = true;

    @Column(name = "failure_reason")
    private String failureReason;
}




