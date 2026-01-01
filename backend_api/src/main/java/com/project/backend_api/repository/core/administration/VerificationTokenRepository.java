package com.project.backend_api.repository.core.administration;



import com.project.backend_api.model.core.administration.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, UUID> {
    Optional<VerificationToken> findByToken(String token);

    Optional<VerificationToken> findByUser_Id(UUID userId);

    void deleteByUser_Id(UUID userId);
}




