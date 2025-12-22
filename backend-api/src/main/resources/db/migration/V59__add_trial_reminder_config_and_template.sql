-- Migration V59: Add TRIAL_EXPIRATION_WARNING template and global config
-- 1. Insert Global Configuration for warning days
INSERT INTO "configuration".global_configurations (variable_key, variable_value, description)
VALUES (
        'TRIAL_REMINDER_DAYS',
        '2',
        'Dias de anticipacion para notificar vencimiento del trial'
    ) ON CONFLICT (variable_key) DO NOTHING;
-- 2. Insert Email Template
INSERT INTO "configuration".email_templates (
        template_key,
        "name",
        subject,
        html_content,
        plain_text_content,
        available_placeholders,
        active,
        created_at,
        updated_at
    )
VALUES (
        'TRIAL_EXPIRATION_WARNING',
        'Advertencia Vencimiento Trial',
        'IMPORTANTE: Tu prueba gratuita en {{appName}} vence en {{daysLeft}} días',
        '<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafb; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #EF4444; color: white; padding: 24px; text-align: center; }
        .content { padding: 32px; }
        .alert-box { background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 16px; margin-bottom: 24px; color: #991B1B; }
        .button { display: inline-block; background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; text-align: center; margin-top: 16px; }
        .button:hover { background-color: #DC2626; }
        .footer { background-color: #F3F4F6; text-align: center; font-size: 12px; color: #6B7280; padding: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0; font-size: 24px;">Acción Requerida</h1>
        </div>
        <div class="content">
            <p style="font-size: 16px; margin-top: 0;">Hola <strong>{{firstName}}</strong>,</p>
            
            <p>Notamos que tu periodo de prueba en <strong>{{companyName}}</strong> está por finalizar.</p>
            
            <div class="alert-box">
                <p style="margin: 0; font-weight: bold;">Tu prueba gratuita vencerá en {{daysLeft}} días ({{trialEndDate}}).</p>
            </div>

            <p>No queremos que pierdas el acceso a tus datos ni a las configuraciones que has realizado. Para asegurar la continuidad de tu servicio, te recomendamos suscribirte a nuestro Plan Básico hoy mismo.</p>

            <div style="text-align: center; margin: 32px 0;">
                <a href="{{subscriptionLink}}" class="button">Suscribirme Ahora y Guardar mi Progreso</a>
            </div>

            <p style="font-size: 14px; color: #666;">Nota: Si no seleccionas un plan antes de la fecha de vencimiento, tu acceso será restringido temporalmente.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 {{appName}}. Todos los derechos reservados.</p>
            <p>Si necesitas ayuda o más tiempo, contáctanos a soporte.</p>
        </div>
    </div>
</body>
</html>',
        'Hola {{firstName}},\n\nTu prueba gratuita para {{companyName}} vencerá en {{daysLeft}} días ({{trialEndDate}}).\n\nPara evitar interrupciones y perder tu progreso, por favor suscríbete al Plan Básico aquí: {{subscriptionLink}}\n\nSaludos,\nEl equipo de {{appName}}',
        'appName,firstName,companyName,daysLeft,trialEndDate,subscriptionLink',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) ON CONFLICT (template_key) DO NOTHING;