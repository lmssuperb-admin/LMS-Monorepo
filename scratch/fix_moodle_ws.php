<?php
define('CLI_SCRIPT', true);
$moodlePath = 'C:/wamp64/www/moodle';
require($moodlePath . '/config.php');

try {
    $serviceId = $DB->get_field('external_services', 'id', ['shortname' => 'superblms']);
    if (!$serviceId) {
        $serviceId = $DB->get_field_sql("SELECT externalserviceid FROM {external_services_functions} sf JOIN {external_functions} f ON f.id = sf.functionid WHERE f.name = 'core_user_create_users' LIMIT 1");
    }

    if (!$serviceId) {
        die("❌ Service not found");
    }

    $functions = [
        'core_course_create_module',
        'core_course_update_module',
        'core_course_delete_module',
        'mod_url_get_urls_by_courses',
        'mod_resource_get_resources_by_courses'
    ];

    foreach ($functions as $name) {
        $fId = $DB->get_field('external_functions', 'id', ['name' => $name]);
        if ($fId && !$DB->record_exists('external_services_functions', ['externalserviceid' => $serviceId, 'functionid' => $fId])) {
            $DB->insert_record('external_services_functions', (object)['externalserviceid' => $serviceId, 'functionid' => $fId]);
            echo "➕ Added $name\n";
        } else {
            echo "✔️ Skip $name\n";
        }
    }
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
