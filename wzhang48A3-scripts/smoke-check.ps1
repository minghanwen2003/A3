param(
  [string]$ApiBase = 'http://localhost:3000/api',
  [string]$ClientBase = 'http://localhost:5500',
  [string]$AdminBase = 'http://localhost:5501'
)

$ErrorActionPreference = 'Stop'
foreach ($url in @("$ClientBase/", "$ClientBase/event.html?id=1", "$AdminBase/", "$AdminBase/edit.html?id=1")) {
  $response = Invoke-WebRequest -UseBasicParsing $url
  if ($response.StatusCode -ne 200) { throw "$url returned $($response.StatusCode)" }
  Write-Host "OK static $url"
}

try {
  $health = Invoke-WebRequest -UseBasicParsing "$ApiBase/health"
  Write-Host "OK API health: $($health.StatusCode)"
} catch {
  Write-Warning "API health failed. Import api/sql/charityevents_db.sql and configure api/.env first."
}
