-- Migration to fix Work Schedule sidebar URL
UPDATE configuration.sidebar_menu
SET url = '/rrhh/work-schedules'
WHERE title = 'Horarios Laborales' 
   OR code = 'MENU_WORK_SCHEDULES';
