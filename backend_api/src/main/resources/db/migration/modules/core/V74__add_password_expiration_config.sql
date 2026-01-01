INSERT INTO configuration.global_configurations (variable_key, variable_value, description)
VALUES (
        'PASSWORD_EXPIRATION_DAYS',
        '90',
        'Días de validez de la contraseña antes de requerir cambio'
    ) ON CONFLICT (variable_key) DO NOTHING;