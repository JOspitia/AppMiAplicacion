package com.project.backend_api.controller.rrhh;

import com.project.backend_api.dto.rrhh.SkillLevelDto;
import com.project.backend_api.service.rrhh.SkillLevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rrhh/skill-levels")
@RequiredArgsConstructor
public class SkillLevelController {

    private final SkillLevelService skillLevelService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('RRHH_POSITION_VIEW', 'ROLE_ROOT')")
    public ResponseEntity<List<SkillLevelDto>> getAll() {
        return ResponseEntity.ok(skillLevelService.getAll());
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('RRHH_POSITION_VIEW', 'ROLE_ROOT')")
    public ResponseEntity<List<SkillLevelDto>> getActive() {
        return ResponseEntity.ok(skillLevelService.getActive());
    }
}
