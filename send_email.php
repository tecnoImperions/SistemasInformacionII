<?php
// Habilitar CORS para permitir llamadas directas de React (localhost:5173)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Manejar solicitud preflight de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Obtener datos del cuerpo de la petición (JSON)
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input) {
    echo json_encode(["success" => false, "message" => "No se recibieron datos válidos"]);
    exit;
}

$type = $input['type'] ?? 'smtp'; // 'smtp' o 'resend'

if ($type === 'smtp') {
    // Reenviar datos de SMTP a smtpjs.com mediante cURL (Cero restricciones CORS)
    $smtpData = [
        'Host' => $input['Host'] ?? '',
        'Username' => $input['Username'] ?? '',
        'Password' => $input['Password'] ?? '',
        'To' => $input['To'] ?? '',
        'From' => $input['From'] ?? '',
        'Subject' => $input['Subject'] ?? '',
        'Body' => $input['Body'] ?? '',
        'Action' => 'Send',
        'nocache' => rand(100000, 999999)
    ];

    $ch = curl_init('https://smtpjs.com/v1/smtp.aspx');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($smtpData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        echo $response; // Retorna la respuesta de SMTPJS ('OK' o mensaje de error)
    } else {
        echo "Error del servidor de correos (HTTP $httpCode)";
    }
    exit;
} else if ($type === 'resend') {
    // Reenviar datos a api.resend.com mediante cURL (Cero restricciones CORS)
    $apiKey = $input['apiKey'] ?? '';
    $resendData = [
        'from' => $input['from'] ?? 'onboarding@resend.dev',
        'to' => $input['to'] ?? [],
        'subject' => $input['subject'] ?? '',
        'html' => $input['html'] ?? ''
    ];

    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($resendData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    http_response_code($httpCode);
    echo $response;
    exit;
}
