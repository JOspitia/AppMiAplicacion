INSERT INTO configuration.email_templates (
        id,
        template_key,
        name,
        subject,
        html_content,
        plain_text_content,
        available_placeholders,
        active,
        created_at,
        updated_at
    )
VALUES (
        gen_random_uuid(),
        'CONTACT_FORM',
        'Solicitud de Atención Personalizada',
        'Nueva solicitud de contacto: {{company}}',
        '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin:0; padding:0; background-color:#f4f7fa; font-family:Arial, Helvetica, sans-serif;">
    <div style="margin:0;padding:0;background-color:#f4f7fa;font-family:Arial,Helvetica,sans-serif">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f7fa;padding:40px 0">
            <tbody>
                <tr>
                    <td align="center">
                        <table width="90%" border="0" cellspacing="0" cellpadding="0" style="max-width:90%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08)">
                            <tbody>
                                <tr>
                                    <td style="background:linear-gradient(135deg,#4F46E5 0%,#7c3aed 100%);padding:30px">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="color:#ffffff;">
                                                    <p style="margin:0; font-size:12px; text-transform:uppercase; letter-spacing:1px; opacity:0.8; font-weight:bold">Landing Page</p>
                                                    <h1 style="margin:5px 0 0 0; font-size:22px; font-weight:bold">Nueva Solicitud de Contacto</h1>
                                                </td>
                                                <td align="right" style="font-size:30px">
                                                    📝
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:35px 30px;">
                                        <p style="font-size:15px; color:#6b7280; margin:0 0 25px 0">
                                            Se ha recibido un nuevo mensaje a través del formulario de atención personalizada:
                                        </p>

                                        <div style="margin-bottom:20px">
                                            <span style="display:block; font-size:12px; font-weight:bold; color:#4F46E5; text-transform:uppercase; margin-bottom:6px">Nombre completo</span>
                                            <div style="background-color:#f9fafb; padding:12px 15px; border-radius:8px; border:1px solid #e5e7eb; color:#111827; font-size:15px">
                                                {{name}}
                                            </div>
                                        </div>

                                        <div style="margin-bottom:20px">
                                            <span style="display:block; font-size:12px; font-weight:bold; color:#4F46E5; text-transform:uppercase; margin-bottom:6px">Correo electrónico</span>
                                            <div style="background-color:#f9fafb; padding:12px 15px; border-radius:8px; border:1px solid #e5e7eb; color:#111827; font-size:15px">
                                                <a href="mailto:{{fromEmail}}" style="color:#4F46E5; text-decoration:none">{{fromEmail}}</a>
                                            </div>
                                        </div>

                                        <div style="margin-bottom:20px">
                                            <span style="display:block; font-size:12px; font-weight:bold; color:#4F46E5; text-transform:uppercase; margin-bottom:6px">Empresa</span>
                                            <div style="background-color:#f9fafb; padding:12px 15px; border-radius:8px; border:1px solid #e5e7eb; color:#111827; font-size:15px">
                                                {{company}}
                                            </div>
                                        </div>

                                        <div style="margin-bottom:10px">
                                            <span style="display:block; font-size:12px; font-weight:bold; color:#4F46E5; text-transform:uppercase; margin-bottom:6px">Mensaje / Consulta</span>
                                            <div style="background-color:#f9fafb; padding:15px; border-radius:8px; border:1px solid #e5e7eb; color:#111827; font-size:15px; line-height:1.6; white-space:pre-wrap italic">
                                                "{{message}}"
                                            </div>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td align="center" style="background-color:#f9fafb; padding:25px; border-top:1px solid #e5e7eb">
                                        <p style="margin:0; font-size:12px; color:#9ca3af; line-height:1.4">
                                            Este es un correo automático generado por el sistema de <strong>{{appName}}</strong>.<br>
                                            Puedes responder directamente a este email para contactar al cliente.
                                        </p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>',
        'Nueva solicitud de contacto\n\nNombre: {{name}}\nEmail: {{fromEmail}}\nEmpresa: {{company}}\nMensaje:\n{{message}}',
        'name,fromEmail,company,message',
        true,
        now(),
        now()
    ) ON CONFLICT (template_key) DO
UPDATE
SET name = EXCLUDED.name,
    subject = EXCLUDED.subject,
    html_content = EXCLUDED.html_content,
    plain_text_content = EXCLUDED.plain_text_content;