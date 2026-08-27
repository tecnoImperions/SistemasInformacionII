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

$type = $input['type'] ?? 'resend';

if ($type === 'resend') {
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
