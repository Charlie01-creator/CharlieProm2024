<?php
// Configuration
$config = [
    'image_quality' => 80,          // WebP quality (0-100)
    'max_conversion_width' => 2000, // Maximum width for converted images
    'cache_expiry' => 31536000,     // 1 year cache expiry
    'allowed_extensions' => ['jpg', 'jpeg', 'png']
];

// Get requested image path
$requestedImage = isset($_GET['img']) ? $_GET['img'] : '';
$sourcePath = realpath(__DIR__ . '/' . urldecode($requestedImage));

// Validate request
if (!file_exists($sourcePath)) {
    header("HTTP/1.0 404 Not Found");
    exit("Image not found");
}

$extension = strtolower(pathinfo($sourcePath, PATHINFO_EXTENSION));
if (!in_array($extension, $config['allowed_extensions'])) {
    header("HTTP/1.0 400 Bad Request");
    exit("Invalid image type");
}

// Set up cache directory
$cacheDir = __DIR__ . '/converted';
if (!file_exists($cacheDir)) {
    mkdir($cacheDir, 0755, true);
}

// Generate cache filename
$cacheFile = $cacheDir . '/' . md5($requestedImage) . '.webp';

// Create WebP version if needed
if (!file_exists($cacheFile) || filemtime($sourcePath) > filemtime($cacheFile)) {
    try {
        switch ($extension) {
            case 'jpg':
            case 'jpeg':
                $image = imagecreatefromjpeg($sourcePath);
                break;
            case 'png':
                $image = imagecreatefrompng($sourcePath);
                imagepalettetotruecolor($image);
                imagealphablending($image, true);
                imagesavealpha($image, true);
                break;
        }

        // Resize if too large
        $width = imagesx($image);
        if ($width > $config['max_conversion_width']) {
            $height = imagesy($image);
            $newHeight = (int)($height * $config['max_conversion_width'] / $width);
            $resized = imagescale($image, $config['max_conversion_width'], $newHeight);
            imagedestroy($image);
            $image = $resized;
        }

        // Save WebP version
        imagewebp($image, $cacheFile, $config['image_quality']);
        imagedestroy($image);
    } catch (Exception $e) {
        header("HTTP/1.0 500 Internal Server Error");
        exit("Conversion failed");
    }
}

// Set caching headers
header('Cache-Control: public, max-age=' . $config['cache_expiry']);
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $config['cache_expiry']) . ' GMT');
header('Content-Type: image/webp');

// Output the image
readfile($cacheFile);
?>
