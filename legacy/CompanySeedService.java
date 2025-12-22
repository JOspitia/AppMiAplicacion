package com.project.project.service.rrhh;

import com.project.project.model.Company;
import com.project.project.persistence.entity.rrhh.ClothingSize;
import com.project.project.persistence.entity.rrhh.EducationLevel;
import com.project.project.repository.rrhh.ClothingSizeRepository;
import com.project.project.repository.rrhh.EducationLevelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanySeedService {

    private final ClothingSizeRepository clothingSizeRepository;
    private final EducationLevelRepository educationLevelRepository;

    @Transactional
    public void seedCompanyData(Company company) {
        log.info("Seeding default RRHH data for company: {}", company.getName());
        seedClothingSizes(company);
        seedEducationLevels(company);
    }

    private void seedClothingSizes(Company company) {
        if (clothingSizeRepository.findByCompanyIdAndActiveTrue(company.getId()).isEmpty()) {
            // Shirt sizes
            List<String[]> shirtSizes = List.of(
                    new String[] { "XS", "Extra Small", "1" },
                    new String[] { "S", "Small", "2" },
                    new String[] { "M", "Medium", "3" },
                    new String[] { "L", "Large", "4" },
                    new String[] { "XL", "Extra Large", "5" },
                    new String[] { "XXL", "Doble Extra Large", "6" },
                    new String[] { "3XL", "Triple Extra Large", "7" });
            for (String[] s : shirtSizes) {
                clothingSizeRepository.save(ClothingSize.builder()
                        .company(company)
                        .code(s[0])
                        .name(s[1])
                        .category("SHIRT")
                        .sortOrder(Integer.parseInt(s[2]))
                        .build());
            }

            // Pants sizes
            for (int i = 28; i <= 44; i += 2) {
                clothingSizeRepository.save(ClothingSize.builder()
                        .company(company)
                        .code(String.valueOf(i))
                        .name("Talla " + i)
                        .category("PANTS")
                        .sortOrder((i - 28) / 2 + 1)
                        .build());
            }

            // Shoe sizes
            for (int i = 35; i <= 46; i++) {
                clothingSizeRepository.save(ClothingSize.builder()
                        .company(company)
                        .code(String.valueOf(i))
                        .name("Talla " + i)
                        .category("SHOES")
                        .sortOrder(i - 34)
                        .build());
            }
        }
    }

    private void seedEducationLevels(Company company) {
        if (educationLevelRepository.findByCompanyIdAndActiveTrue(company.getId()).isEmpty()) {
            List<String[]> levels = List.of(
                    new String[] { "PRIMARIA", "Primaria", "1" },
                    new String[] { "BACHILLER", "Bachillerato", "2" },
                    new String[] { "TECNICO", "Técnico", "3" },
                    new String[] { "TECNOLOGO", "Tecnólogo", "4" },
                    new String[] { "PROFESIONAL", "Profesional", "5" },
                    new String[] { "ESPECIALIZACION", "Especialización", "6" },
                    new String[] { "MAESTRIA", "Maestría", "7" },
                    new String[] { "DOCTORADO", "Doctorado", "8" });
            for (String[] l : levels) {
                educationLevelRepository.save(EducationLevel.builder()
                        .company(company)
                        .code(l[0])
                        .name(l[1])
                        .sortOrder(Integer.parseInt(l[2]))
                        .build());
            }
        }
    }
}
