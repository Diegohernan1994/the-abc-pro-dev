<?php
// ADU-only endpoint. Deploy to PHP hosting, never GitHub Pages.
declare(strict_types=1);
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');

function reply(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body);
    exit;
}
$origins = ['https://theabcpro.com', 'https://www.theabcpro.com', 'https://diegohernan1994.github.io'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, $origins, true)) reply(403, ['success'=>false]);
if ($origin !== '') header('Access-Control-Allow-Origin: '.$origin);
header('Vary: Origin');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'OPTIONS') reply(204, []);
if (!in_array($method, ['GET','POST'], true)) reply(405, ['success'=>false]);

// Environment variables keep both secrets outside public source files.
$privateConfig = dirname(__DIR__,2).'/adu-form-config.php';
$config = is_file($privateConfig) ? require $privateConfig : [];
$webhook = getenv('ZAP_WEBHOOK_ADU') ?: ($config['webhook'] ?? '');
$secret = getenv('ADU_FORM_SECRET') ?: ($config['secret'] ?? '');
if (strlen($secret) < 32 || !preg_match('~^https://hooks\.zapier\.com/hooks/catch/[A-Za-z0-9/_-]+/$~', $webhook)) {
    reply(503, ['success'=>false, 'error'=>'Form temporarily unavailable. Please call (818) 457-3390.']);
}
$ip = $_SERVER['REMOTE_ADDR'] ?? '';
function signature(string $issued, string $nonce, string $ip, string $secret): string {
    return hash_hmac('sha256', $issued.'.'.$nonce.'.'.$ip, $secret);
}
// Bounded per-IP request window, protected against simultaneous requests.
$dir = sys_get_temp_dir().'/theabcpro-adu-'.substr(hash('sha256', __FILE__),0,16);
if (!is_dir($dir) && !@mkdir($dir,0700,true) && !is_dir($dir)) reply(503,['success'=>false]);
// Remove expired buckets probabilistically; filenames contain no IP addresses.
if (random_int(1,100) === 1) foreach (glob($dir.'/*.json') ?: [] as $file) {
    if (filemtime($file) < time()-7200) @unlink($file);
}
$bucket = $dir.'/'.hash_hmac('sha256',$ip,$secret).'.json';
$lock = @fopen($bucket,'c+');
if (!$lock || !flock($lock,LOCK_EX)) reply(503,['success'=>false]);
@chmod($bucket,0600);
$state = json_decode(stream_get_contents($lock),true) ?: [];
$now = time();
if (($state['start'] ?? 0) < $now-3600) $state=['start'=>$now,'get'=>0,'post'=>0,'used'=>$state['used'] ?? []];
$state['used'] = array_filter($state['used'] ?? [], function ($issued) use ($now) { return $issued >= $now-7200; });
$key = $method === 'GET' ? 'get' : 'post';
$state[$key] = ($state[$key] ?? 0)+1;
$limited = $state[$key] > ($key === 'get' ? 60 : 10);
function saveBucket($lock, array $state): void {
    rewind($lock); ftruncate($lock,0); fwrite($lock,json_encode($state)); fflush($lock);
    flock($lock,LOCK_UN); fclose($lock);
}
if ($limited) { saveBucket($lock,$state); header('Retry-After: 3600'); reply(429,['success'=>false]); }
if ($method === 'GET') {
    saveBucket($lock,$state);
    $issued = (string)$now;
    $nonce = bin2hex(random_bytes(16));
    reply(200,['token'=>$issued.'.'.$nonce.'.'.signature($issued,$nonce,$ip,$secret)]);
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 8192) {saveBucket($lock,$state); reply(413,['success'=>false]);}
$raw = file_get_contents('php://input',false,null,0,8193);
$data = strlen($raw) <= 8192 ? json_decode($raw,true) : null;
if (!is_array($data)) {saveBucket($lock,$state); reply(400,['success'=>false]);}
// Reject traps, expired signatures, automated immediate sends and token replays.
$token = is_string($data['form_token'] ?? null) ? explode('.',$data['form_token']) : [];
$validToken = count($token) === 3 && ctype_digit($token[0]) && preg_match('/^[a-f0-9]{32}$/',$token[1])
    && $now-(int)$token[0] >= 3 && $now-(int)$token[0] <= 7200
    && hash_equals(signature($token[0],$token[1],$ip,$secret),$token[2]);
if (!$validToken || !empty($data['website']) || isset($state['used'][$token[1] ?? ''])) {
    saveBucket($lock,$state); reply(400,['success'=>false,'error'=>'Please reload the form and try again.']);
}
function field(array $data, string $key, int $length): string {
    return is_string($data[$key] ?? null) ? trim(substr($data[$key],0,$length)) : '';
}
$name = field($data,'name',120);
$phone = field($data,'phone',40);
$email = field($data,'email',180);
$zip = field($data,'zip',5);
$project = field($data,'project_type',80);
$projects = ['Garage Conversion','Detached ADU','Attached ADU','Junior ADU / JADU','Not Sure Yet'];
$fullUrl = field($data,'full_url',2048);
$url = parse_url($fullUrl);
$urlOrigin = ($url['scheme'] ?? '').'://'.($url['host'] ?? '');
if (strlen($name)<2 || strlen(preg_replace('/\D/','',$phone))<10 || !filter_var($email,FILTER_VALIDATE_EMAIL)
    || !preg_match('/^\d{5}$/',$zip) || !in_array($project,$projects,true)
    || !in_array($urlOrigin,$origins,true) || strpos($url['path'] ?? '', '/landing-adu/') === false) {
    saveBucket($lock,$state); reply(400,['success'=>false,'error'=>'Please check your contact details.']);
}
$state['used'][$token[1]] = $now;
saveBucket($lock,$state);
$parts = explode(' ',$name,2);
date_default_timezone_set('America/Los_Angeles');
// Same field names used by the existing landing webhook proxy.
$payload = [
    'first_name'=>$parts[0], 'last_name'=>$parts[1] ?? '', 'name'=>$name,
    'phone'=>$phone, 'email'=>$email, 'zip'=>$zip, 'message'=>field($data,'message',2000),
    'areas'=>$project, 'project_type'=>$project,
    'landing_key'=>'adu', 'landing_title'=>'Custom ADUs & Garage Conversions',
    'submission_date_time'=>date('Y-m-d H:i:s T'), 'submission_date_iso'=>date('c'),
    'full_url'=>$fullUrl, 'client_ip'=>$ip, 'user_agent'=>substr($_SERVER['HTTP_USER_AGENT'] ?? '',0,512)
];
$ch = curl_init($webhook);
curl_setopt_array($ch,[CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>json_encode($payload),
    CURLOPT_HTTPHEADER=>['Content-Type: application/json','Accept: application/json'],
    CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>5,CURLOPT_TIMEOUT=>12,
    CURLOPT_SSL_VERIFYPEER=>true,CURLOPT_SSL_VERIFYHOST=>2]);
$result = curl_exec($ch);
$status = curl_getinfo($ch,CURLINFO_HTTP_CODE);
curl_close($ch);
if ($result !== false && $status>=200 && $status<300) reply(200,['success'=>true,'landing'=>'adu']);
reply(502,['success'=>false,'error'=>'Unable to send. Please call (818) 457-3390.']);
