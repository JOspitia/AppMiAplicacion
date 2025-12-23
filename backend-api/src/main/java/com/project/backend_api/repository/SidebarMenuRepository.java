package com.project.backend_api.repository;

import com.project.backend_api.model.SidebarMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface SidebarMenuRepository extends JpaRepository<SidebarMenu, UUID> {

    @Query("SELECT m FROM SidebarMenu m WHERE m.active = true ORDER BY m.orderIndex ASC")
    List<SidebarMenu> findAllActive();

    @Query("SELECT m FROM SidebarMenu m WHERE m.active = true AND m.parent IS NULL ORDER BY m.orderIndex ASC")
    List<SidebarMenu> findRootActive();
}
