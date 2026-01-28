-- =====================================================
-- TABLA: relationships (Parentescos/Relaciones) en esquema PUBLIC (Datos Maestros)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_family BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT fk_relationships_created_by FOREIGN KEY (created_by) REFERENCES security.users(id) ON DELETE SET NULL,
    CONSTRAINT fk_relationships_updated_by FOREIGN KEY (updated_by) REFERENCES security.users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX idx_relationships_code ON public.relationships(code);
CREATE INDEX idx_relationships_active ON public.relationships(active);
CREATE INDEX idx_relationships_is_family ON public.relationships(is_family);

-- Datos iniciales
INSERT INTO public.relationships (code, name, description, is_family, display_order, active) VALUES
-- Familia Nuclear
('FATHER', 'Padre', 'Padre biológico o adoptivo', TRUE, 1, TRUE),
('MOTHER', 'Madre', 'Madre biológica o adoptiva', TRUE, 2, TRUE),
('SON', 'Hijo', 'Hijo biológico o adoptivo', TRUE, 3, TRUE),
('DAUGHTER', 'Hija', 'Hija biológica o adoptiva', TRUE, 4, TRUE),
('SPOUSE', 'Cónyuge', 'Esposo o esposa', TRUE, 5, TRUE),
('PARTNER', 'Pareja', 'Pareja de hecho o compañero(a) permanente', TRUE, 6, TRUE),

-- Hermanos
('BROTHER', 'Hermano', 'Hermano biológico o adoptivo', TRUE, 7, TRUE),
('SISTER', 'Hermana', 'Hermana biológica o adoptiva', TRUE, 8, TRUE),

-- Familia Extendida
('GRANDFATHER', 'Abuelo', 'Abuelo paterno o materno', TRUE, 9, TRUE),
('GRANDMOTHER', 'Abuela', 'Abuela paterna o materna', TRUE, 10, TRUE),
('GRANDSON', 'Nieto', 'Nieto', TRUE, 11, TRUE),
('GRANDDAUGHTER', 'Nieta', 'Nieta', TRUE, 12, TRUE),

-- Tíos y Sobrinos
('UNCLE', 'Tío', 'Tío paterno o materno', TRUE, 13, TRUE),
('AUNT', 'Tía', 'Tía paterna o materna', TRUE, 14, TRUE),
('NEPHEW', 'Sobrino', 'Sobrino', TRUE, 15, TRUE),
('NIECE', 'Sobrina', 'Sobrina', TRUE, 16, TRUE),

-- Primos
('COUSIN', 'Primo/Prima', 'Primo o prima', TRUE, 17, TRUE),

-- Familia Política
('FATHER_IN_LAW', 'Suegro', 'Padre del cónyuge', TRUE, 18, TRUE),
('MOTHER_IN_LAW', 'Suegra', 'Madre del cónyuge', TRUE, 19, TRUE),
('SON_IN_LAW', 'Yerno', 'Esposo de la hija', TRUE, 20, TRUE),
('DAUGHTER_IN_LAW', 'Nuera', 'Esposa del hijo', TRUE, 21, TRUE),
('BROTHER_IN_LAW', 'Cuñado', 'Hermano del cónyuge', TRUE, 22, TRUE),
('SISTER_IN_LAW', 'Cuñada', 'Hermana del cónyuge', TRUE, 23, TRUE),

-- Padrastros/Hijastros
('STEPFATHER', 'Padrastro', 'Esposo de la madre (no padre biológico)', TRUE, 24, TRUE),
('STEPMOTHER', 'Madrastra', 'Esposa del padre (no madre biológica)', TRUE, 25, TRUE),
('STEPSON', 'Hijastro', 'Hijo del cónyuge (no hijo biológico)', TRUE, 26, TRUE),
('STEPDAUGHTER', 'Hijastra', 'Hija del cónyuge (no hija biológica)', TRUE, 27, TRUE),

-- No Familiares
('FRIEND', 'Amigo/Amiga', 'Amigo cercano o amiga cercana', FALSE, 28, TRUE),
('NEIGHBOR', 'Vecino/Vecina', 'Vecino o vecina', FALSE, 29, TRUE),
('COWORKER', 'Compañero de Trabajo', 'Colega o compañero laboral', FALSE, 30, TRUE),
('ACQUAINTANCE', 'Conocido/Conocida', 'Conocido o conocida', FALSE, 31, TRUE),
('OTHER', 'Otro', 'Otra relación no especificada', FALSE, 32, TRUE)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- TABLA: occupations (Ocupaciones) en esquema PUBLIC (Datos Maestros)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.occupations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(255),
    category VARCHAR(100),
    display_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT fk_occupations_created_by FOREIGN KEY (created_by) REFERENCES security.users(id) ON DELETE SET NULL,
    CONSTRAINT fk_occupations_updated_by FOREIGN KEY (updated_by) REFERENCES security.users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX idx_occupations_code ON public.occupations(code);
CREATE INDEX idx_occupations_category ON public.occupations(category);
CREATE INDEX idx_occupations_active ON public.occupations(active);

-- Datos iniciales de ocupaciones
INSERT INTO public.occupations (code, name, description, category, display_order, active) VALUES
-- Categoría: Educación
('STUDENT', 'Estudiante', 'Persona que estudia en institución educativa', 'Educación', 1, TRUE),
('TEACHER', 'Docente/Profesor', 'Educador en cualquier nivel', 'Educación', 2, TRUE),
-- ... (resto de datos igual) ...
('UNIVERSITY_PROFESSOR', 'Profesor Universitario', 'Docente de educación superior', 'Educación', 3, TRUE),

-- Categoría: Salud
('DOCTOR', 'Médico', 'Profesional de la medicina', 'Salud', 4, TRUE),
('NURSE', 'Enfermero/Enfermera', 'Profesional de enfermería', 'Salud', 5, TRUE),
('DENTIST', 'Odontólogo', 'Profesional de odontología', 'Salud', 6, TRUE),
('PSYCHOLOGIST', 'Psicólogo', 'Profesional de psicología', 'Salud', 7, TRUE),
('PHARMACIST', 'Farmacéutico', 'Profesional farmacéutico', 'Salud', 8, TRUE),

-- Categoría: Tecnología
('SOFTWARE_ENGINEER', 'Ingeniero de Software', 'Desarrollador de software', 'Tecnología', 9, TRUE),
('SYSTEMS_ENGINEER', 'Ingeniero de Sistemas', 'Profesional en sistemas', 'Tecnología', 10, TRUE),
('IT_TECHNICIAN', 'Técnico en Informática', 'Técnico de soporte IT', 'Tecnología', 11, TRUE),
('DATA_ANALYST', 'Analista de Datos', 'Profesional en análisis de datos', 'Tecnología', 12, TRUE),

-- Categoría: Ingeniería
('CIVIL_ENGINEER', 'Ingeniero Civil', 'Profesional en ingeniería civil', 'Ingeniería', 13, TRUE),
('INDUSTRIAL_ENGINEER', 'Ingeniero Industrial', 'Profesional en ingeniería industrial', 'Ingeniería', 14, TRUE),
('MECHANICAL_ENGINEER', 'Ingeniero Mecánico', 'Profesional en ingeniería mecánica', 'Ingeniería', 15, TRUE),
('ELECTRICAL_ENGINEER', 'Ingeniero Eléctrico', 'Profesional en ingeniería eléctrica', 'Ingeniería', 16, TRUE),

-- Categoría: Administración y Negocios
('ACCOUNTANT', 'Contador', 'Profesional contable', 'Administración', 17, TRUE),
('ADMINISTRATOR', 'Administrador', 'Profesional administrativo', 'Administración', 18, TRUE),
('ECONOMIST', 'Economista', 'Profesional en economía', 'Administración', 19, TRUE),
('BUSINESS_MANAGER', 'Gerente de Negocios', 'Administrador de empresas', 'Administración', 20, TRUE),
('FINANCIAL_ANALYST', 'Analista Financiero', 'Profesional en finanzas', 'Administración', 21, TRUE),

-- Categoría: Derecho
('LAWYER', 'Abogado', 'Profesional del derecho', 'Derecho', 22, TRUE),
('JUDGE', 'Juez', 'Magistrado judicial', 'Derecho', 23, TRUE),
('NOTARY', 'Notario', 'Funcionario notarial', 'Derecho', 24, TRUE),

-- Categoría: Servicios
('CHEF', 'Chef/Cocinero', 'Profesional culinario', 'Servicios', 25, TRUE),
('WAITER', 'Mesero/Camarero', 'Trabajador de servicio en restaurante', 'Servicios', 26, TRUE),
('SECURITY_GUARD', 'Vigilante', 'Personal de seguridad', 'Servicios', 27, TRUE),
('CLEANER', 'Personal de Limpieza', 'Trabajador de aseo', 'Servicios', 28, TRUE),
('DRIVER', 'Conductor', 'Conductor profesional', 'Servicios', 29, TRUE),

-- Categoría: Comercio
('SALESPERSON', 'Vendedor', 'Profesional de ventas', 'Comercio', 30, TRUE),
('CASHIER', 'Cajero', 'Operador de caja', 'Comercio', 31, TRUE),
('MERCHANT', 'Comerciante', 'Propietario de negocio', 'Comercio', 32, TRUE),

-- Categoría: Construcción y Oficios
('ELECTRICIAN', 'Electricista', 'Técnico electricista', 'Oficios', 33, TRUE),
('PLUMBER', 'Plomero', 'Técnico en plomería', 'Oficios', 34, TRUE),
('CARPENTER', 'Carpintero', 'Artesano en madera', 'Oficios', 35, TRUE),
('MASON', 'Albañil', 'Trabajador de construcción', 'Oficios', 36, TRUE),
('PAINTER', 'Pintor', 'Profesional en pintura', 'Oficios', 37, TRUE),
('MECHANIC', 'Mecánico', 'Técnico mecánico', 'Oficios', 38, TRUE),

-- Categoría: Arte y Diseño
('GRAPHIC_DESIGNER', 'Diseñador Gráfico', 'Profesional en diseño gráfico', 'Arte y Diseño', 39, TRUE),
('ARCHITECT', 'Arquitecto', 'Profesional en arquitectura', 'Arte y Diseño', 40, TRUE),
('PHOTOGRAPHER', 'Fotógrafo', 'Profesional de fotografía', 'Arte y Diseño', 41, TRUE),
('ARTIST', 'Artista', 'Creador artístico', 'Arte y Diseño', 42, TRUE),

-- Categoría: Comunicación
('JOURNALIST', 'Periodista', 'Profesional del periodismo', 'Comunicación', 43, TRUE),
('PUBLICIST', 'Publicista', 'Profesional en publicidad', 'Comunicación', 44, TRUE),
('SOCIAL_MEDIA_MANAGER', 'Community Manager', 'Gestor de redes sociales', 'Comunicación', 45, TRUE),

-- Categoría: Agricultura y Ganadería
('FARMER', 'Agricultor', 'Trabajador agrícola', 'Agricultura', 46, TRUE),
('RANCHER', 'Ganadero', 'Criador de ganado', 'Agricultura', 47, TRUE),
('VETERINARIAN', 'Veterinario', 'Profesional veterinario', 'Agricultura', 48, TRUE),

-- Categoría: Transporte y Logística
('PILOT', 'Piloto', 'Piloto de aeronave', 'Transporte', 49, TRUE),
('TRUCK_DRIVER', 'Conductor de Camión', 'Transportista de carga', 'Transporte', 50, TRUE),
('LOGISTICS_COORDINATOR', 'Coordinador Logístico', 'Profesional en logística', 'Transporte', 51, TRUE),

-- Categoría: Otros
('RETIRED', 'Pensionado/Jubilado', 'Persona retirada laboralmente', 'Otros', 52, TRUE),
('HOMEMAKER', 'Ama de Casa', 'Persona dedicada al hogar', 'Otros', 53, TRUE),
('UNEMPLOYED', 'Desempleado', 'Sin empleo actual', 'Otros', 54, TRUE),
('INDEPENDENT', 'Trabajador Independiente', 'Profesional independiente', 'Otros', 55, TRUE),
('ENTREPRENEUR', 'Empresario', 'Dueño de empresa', 'Otros', 56, TRUE),
('OTHER', 'Otra', 'Ocupación no especificada', 'Otros', 57, TRUE);

-- =====================================================
-- ACTUALIZAR TABLAS EXISTENTES
-- =====================================================

-- Agregar FK a employee_emergency_contacts
ALTER TABLE business_rrhh.employee_emergency_contacts
    ADD COLUMN IF NOT EXISTS relationship_id UUID,
    ADD CONSTRAINT fk_emergency_contact_relationship 
        FOREIGN KEY (relationship_id) REFERENCES public.relationships(id) ON DELETE SET NULL;

-- Agregar FK a employee_family_nucleus
ALTER TABLE business_rrhh.employee_family_nucleus
    ADD COLUMN IF NOT EXISTS relationship_id UUID,
    ADD COLUMN IF NOT EXISTS occupation_id UUID,
    ADD CONSTRAINT fk_family_member_relationship 
        FOREIGN KEY (relationship_id) REFERENCES public.relationships(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_family_member_occupation 
        FOREIGN KEY (occupation_id) REFERENCES public.occupations(id) ON DELETE SET NULL;

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_relationship ON business_rrhh.employee_emergency_contacts(relationship_id);
CREATE INDEX IF NOT EXISTS idx_family_nucleus_relationship ON business_rrhh.employee_family_nucleus(relationship_id);
CREATE INDEX IF NOT EXISTS idx_family_nucleus_occupation ON business_rrhh.employee_family_nucleus(occupation_id);

-- Hacer que las columnas legacy sean opcionales (para evitar errores de NOT NULL durante la transición)
ALTER TABLE business_rrhh.employee_emergency_contacts ALTER COLUMN relationship DROP NOT NULL;
ALTER TABLE business_rrhh.employee_family_nucleus ALTER COLUMN relationship DROP NOT NULL;
ALTER TABLE business_rrhh.employee_family_nucleus ALTER COLUMN occupation DROP NOT NULL;

-- Comentarios
COMMENT ON TABLE relationships IS 'Catálogo de parentescos y relaciones para contactos de emergencia y núcleo familiar';
COMMENT ON TABLE occupations IS 'Catálogo de ocupaciones laborales para núcleo familiar';
COMMENT ON COLUMN relationships.is_family IS 'Indica si la relación es de tipo familiar (true) o no familiar (false)';
COMMENT ON COLUMN occupations.category IS 'Categoría de la ocupación para facilitar agrupación y búsqueda';
