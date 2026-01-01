package com.project.backend_api.controller.core.administration;



import com.project.backend_api.dto.core.administration.SimpleOptionDto;
import com.project.backend_api.repository.core.administration.CityRepository;
import com.project.backend_api.repository.core.administration.CountryRepository;
import com.project.backend_api.repository.core.administration.GenderRepository;
import com.project.backend_api.repository.core.administration.StateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/core/administration/geo")
@RequiredArgsConstructor
public class GeoController {

        private final CountryRepository countryRepository;
        private final StateRepository stateRepository;
        private final CityRepository cityRepository;
        private final GenderRepository genderRepository;

        @GetMapping("/countries")
        public ResponseEntity<List<SimpleOptionDto>> getCountries() {
                return ResponseEntity.ok(countryRepository.findAll().stream()
                                .map(c -> SimpleOptionDto.builder()
                                                .id(c.getId())
                                                .name(c.getName())
                                                .phoneCode(c.getPhoneCode())
                                                .build())
                                .collect(Collectors.toList()));
        }

        @GetMapping("/states")
        public ResponseEntity<List<SimpleOptionDto>> getStates(@RequestParam UUID countryId) {
                return ResponseEntity.ok(stateRepository.findByCountryIdOrderByName(countryId).stream()
                                .map(s -> SimpleOptionDto.builder()
                                                .id(s.getId())
                                                .name(s.getName())
                                                .build())
                                .collect(Collectors.toList()));
        }

        @GetMapping("/cities")
        public ResponseEntity<List<SimpleOptionDto>> getCities(@RequestParam UUID stateId) {
                return ResponseEntity.ok(cityRepository.findByStateIdOrderByName(stateId).stream()
                                .map(c -> SimpleOptionDto.builder()
                                                .id(c.getId())
                                                .name(c.getName())
                                                .build())
                                .collect(Collectors.toList()));
        }

        @GetMapping("/genders")
        public ResponseEntity<List<SimpleOptionDto>> getGenders() {
                return ResponseEntity.ok(genderRepository.findAll().stream()
                                .map(g -> SimpleOptionDto.builder()
                                                .id(g.getId())
                                                .name(g.getName())
                                                .build())
                                .collect(Collectors.toList()));
        }
}






