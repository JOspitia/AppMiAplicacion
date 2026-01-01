package com.project.backend_api.repository.core.management;

import com.project.backend_api.model.core.management.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

  // Busca un usuario por su nombre de usuario.
  Optional<User> findByUsername(String username);

  // Busca un usuario por su correo electrónico.
  Optional<User> findByEmail(String email);

  // Busca un usuario por su token de confirmación de correo electrónico
  // pendiente.
  Optional<User> findByPendingEmailToken(String pendingEmailToken);

  // Busca un usuario por nombre de usuario o correo electrónico (para login)
  @Query("SELECT u FROM User u WHERE u.username = :identifier OR u.email = :identifier")
  Optional<User> findByUsernameOrEmail(@Param("identifier") String identifier);

  @Query("""
          SELECT DISTINCT u
          FROM User u
          JOIN UserCompanyRole ucr ON ucr.user.id = u.id
          WHERE ucr.company.id = :companyId
            AND u.id NOT IN (
              SELECT ucr_root.user.id
              FROM UserCompanyRole ucr_root
              JOIN ucr_root.role r
              WHERE r.name = 'ROOT'
          )
          ORDER BY u.firstName, u.firstSurname
      """)
  List<User> findNonRootUsersByCompanyId(@Param("companyId") UUID companyId);
}
