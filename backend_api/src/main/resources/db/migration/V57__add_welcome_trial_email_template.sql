-- Migration V57: Add WELCOME_TRIAL email template
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
        'WELCOME_TRIAL',
        'Bienvenida Prueba Gratuita',
        'Bienvenido a {{appName}} - ¡Tu Prueba Gratuita ha comenzado!',
        '<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 20px; }
        .button { display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Bienvenido a {{appName}}!</h1>
        </div>
        <div class="content">
            <p>Hola <strong>{{firstName}}</strong>,</p>
            <p>¡Felicitaciones! Has creado exitosamente tu empresa <strong>{{companyName}}</strong> en nuestro sistema.</p>
            <p>Tu prueba gratuita de <strong>{{trialDuration}} días</strong> está activa y válida hasta el <strong>{{trialEndDate}}</strong>.</p>
            <p>Para comenzar a utilizar tu cuenta, por favor actívala haciendo clic en el siguiente botón:</p>
            <div style="text-align: center;">
                <a href="{{activationLink}}" class="button">Activar Cuenta</a>
            </div>
            <p>Si tienes alguna pregunta, nuestro equipo de soporte está listo para ayudarte.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 {{appName}}. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>',
        'Hola {{firstName}},\n\n¡Felicitaciones! Has creado exitosamente tu empresa {{companyName}} en nuestro sistema.\n\nTu prueba gratuita de {{trialDuration}} días está activa y válida hasta el {{trialEndDate}}.\n\nPara activar tu cuenta, ingresa aquí: {{activationLink}}\n\nSaludos,\nEl equipo de {{appName}}',
        'appName,firstName,companyName,trialDuration,trialEndDate,activationLink',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) ON CONFLICT (template_key) DO NOTHING;