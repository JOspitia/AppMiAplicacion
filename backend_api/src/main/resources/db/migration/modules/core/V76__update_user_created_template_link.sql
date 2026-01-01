UPDATE configuration.email_templates
SET html_content = REPLACE(
        html_content,
        'href="{{loginLink}}"',
        'href="{{activationLink}}"'
    ),
    plain_text_content = REPLACE(
        plain_text_content,
        'Ingresa aquí: {{loginLink}}',
        'Activa tu cuenta aquí: {{activationLink}}'
    ),
    available_placeholders = 'appName,activationLink,loginLink,username,password'
WHERE template_key = 'USER_ACCOUNT_CREATED';