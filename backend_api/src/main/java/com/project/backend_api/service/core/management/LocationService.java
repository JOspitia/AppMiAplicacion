package com.project.backend_api.service.core.management;



import com.project.backend_api.model.core.management.Location;
import com.project.backend_api.dto.core.management.LocationDto;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.repository.core.management.LocationRepository;
import com.project.backend_api.service.core.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LocationService {

    private final LocationRepository locationRepository;
    private final AuthService authService;

    private UUID getCurrentCompanyId() {
        return authService.getSelectedCompanyId();
    }

    public List<LocationDto> getAllLocations() {
        return locationRepository.findByCompanyId(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<LocationDto> getActiveLocations() {
        return locationRepository.findByCompanyIdAndActiveTrue(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(java.util.stream.Collectors.toList());
    }

    public LocationDto getLocationById(UUID id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sede no encontrada"));
        return toDto(location);
    }

    @Transactional
    public LocationDto saveLocation(LocationDto dto) {
        Location location;
        if (dto.getId() != null) {
            location = locationRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Sede no encontrada for update"));
            updateEntity(location, dto);
        } else {
            location = toEntity(dto);
            location.setCompany(Company.builder().id(getCurrentCompanyId()).build());
        }

        Location saved = locationRepository.save(location);
        return toDto(saved);
    }

    @Transactional
    public void toggleActive(UUID id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sede no encontrada"));
        location.setActive(!location.getActive());
        locationRepository.save(location);
    }

    private LocationDto toDto(Location entity) {
        return LocationDto.builder()
                .id(entity.getId())
                .companyId(entity.getCompany() != null ? entity.getCompany().getId() : null)
                .name(entity.getName())
                .address(entity.getAddress())
                .city(entity.getCity())
                .department(entity.getDepartment())
                .country(entity.getCountry())
                .isMain(entity.getIsMain())
                .active(entity.getActive())
                .build();
    }

    private Location toEntity(LocationDto dto) {
        return Location.builder()
                .id(dto.getId())
                .name(dto.getName())
                .address(dto.getAddress())
                .city(dto.getCity())
                .department(dto.getDepartment())
                .country(dto.getCountry())
                .isMain(dto.getIsMain())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
    }

    private void updateEntity(Location entity, LocationDto dto) {
        entity.setName(dto.getName());
        entity.setAddress(dto.getAddress());
        entity.setCity(dto.getCity());
        entity.setDepartment(dto.getDepartment());
        entity.setCountry(dto.getCountry());
        entity.setIsMain(dto.getIsMain());
        if (dto.getActive() != null) {
            entity.setActive(dto.getActive());
        }
    }
}







