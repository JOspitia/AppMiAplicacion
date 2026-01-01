package com.project.backend_api.controller.core.management;



import com.project.backend_api.dto.core.management.EconomicSectorDTO;
import com.project.backend_api.model.core.management.EconomicSector;
import com.project.backend_api.repository.core.management.EconomicSectorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/configuration/economic-sectors")
public class EconomicSectorController {

    @Autowired
    private EconomicSectorRepository economicSectorRepository;

    @GetMapping
    public ResponseEntity<List<EconomicSectorDTO>> getActiveSectors() {
        List<EconomicSector> sectors = economicSectorRepository.findByActiveTrue();
        List<EconomicSectorDTO> dtos = sectors.stream()
                .map(s -> new EconomicSectorDTO(s.getId(), s.getName(), s.getDescription(), s.getActive()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}






