package com.project.backend_api.dto.core;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileOptionsDto {
    private Integer maxWidth;
    private Integer maxHeight;
    private Long maxFileSize; // In bytes (e.g., 10 * 1024 * 1024 for 10MB)
    private Float quality; // 0.0 to 1.0 (for JPEG)

    /**
     * Preset for profile photos: 200x200, max 10MB
     */
    public static FileOptionsDto profilePhoto() {
        return FileOptionsDto.builder()
                .maxWidth(200)
                .maxHeight(200)
                .maxFileSize(10 * 1024 * 1024L) // 10MB
                .quality(0.85f)
                .build();
    }
}
