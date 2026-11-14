param(
  [string]$DataDirectory = "$(Join-Path $PSScriptRoot '..\src\data')",
  [string]$AssetsDirectory = "$(Join-Path $PSScriptRoot '..\public\assets\dikidi')"
)

$ErrorActionPreference = 'Stop'
$servicesPath = Join-Path $DataDirectory 'services.json'
$mastersPath = Join-Path $DataDirectory 'masters.json'
New-Item -ItemType Directory -Force -Path $AssetsDirectory | Out-Null

$servicesData = Get-Content -Raw $servicesPath | ConvertFrom-Json
$mastersData = Get-Content -Raw $mastersPath | ConvertFrom-Json
$setProperty = { param($Object, $Name, $Value) if ($Object.PSObject.Properties.Name -contains $Name) { $Object.$Name = $Value } else { $Object | Add-Member -NotePropertyName $Name -NotePropertyValue $Value } }
$serviceByName = @{}
$serviceById = @{}
$serviceMasters = @{}
foreach ($category in @($servicesData.categories)) {
  foreach ($service in @($category.services)) {
    $service.category = [string]$category.name
    & $setProperty $service 'masters' @()
    $serviceByName[[string]$service.name] = $service
    $serviceById[[string]$service.id] = $service
    $serviceMasters[[string]$service.id] = [System.Collections.Generic.List[string]]::new()
  }
}

$downloaded = 0
$masterById = @{}
foreach ($master in @($mastersData.masters)) {
  $master.services = @($master.services)
  $masterServiceIds = [System.Collections.Generic.List[string]]::new()
  $masterImage = [string]$master.photo
  if ($masterImage -and $masterImage -notmatch 'profile/master\.png') {
    $masterFile = "master-$($master.id).jpg"
    try { Invoke-WebRequest -Uri $masterImage -OutFile (Join-Path $AssetsDirectory $masterFile) -UseBasicParsing -TimeoutSec 40; $master.photo = "/assets/dikidi/$masterFile"; $downloaded++ } catch { }
  }
  foreach ($masterService in @($master.services)) {
    $service = $serviceByName[[string]$masterService.name]
    if ($null -ne $service) {
      & $setProperty $masterService 'serviceId' ([string]$service.id)
      & $setProperty $masterService 'category' ([string]$service.category)
      & $setProperty $masterService 'price' ([string]$service.price)
      & $setProperty $masterService 'durationMinutes' ([int]$service.durationMinutes)
      $masterServiceIds.Add([string]$service.id)
      $serviceMasters[[string]$service.id].Add([string]$master.id)
    }
  }
  & $setProperty $master 'serviceIds' @($masterServiceIds)
  $masterById[[string]$master.id] = $master
}

foreach ($category in @($servicesData.categories)) {
  foreach ($service in @($category.services)) {
    $imageUrl = [string]$service.image
    if ($imageUrl) {
      $serviceFile = "service-$($service.id).jpg"
      try { Invoke-WebRequest -Uri $imageUrl -OutFile (Join-Path $AssetsDirectory $serviceFile) -UseBasicParsing -TimeoutSec 40; $service.image = "/assets/dikidi/$serviceFile"; $downloaded++ } catch { }
    }
    & $setProperty $service 'masters' @($serviceMasters[[string]$service.id] | Select-Object -Unique)
  }
}

$collectedAt = (Get-Date).ToUniversalTime().ToString('o')
& $setProperty $servicesData.metadata 'collectedAt' $collectedAt
& $setProperty $servicesData.metadata 'assetsDirectory' '/assets/dikidi'
& $setProperty $mastersData.metadata 'collectedAt' $collectedAt
& $setProperty $mastersData.metadata 'assetsDirectory' '/assets/dikidi'
$servicesData | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $servicesPath -Encoding UTF8
$mastersData | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $mastersPath -Encoding UTF8

$categoryCount = @($servicesData.categories).Count
$serviceCount = @($serviceById.Values).Count
$masterCount = @($mastersData.masters).Count
$linkedServiceCount = @($serviceById.Values | Where-Object { @($_.masters).Count -gt 0 }).Count
Write-Output "Linked $masterCount masters and $serviceCount services across $categoryCount categories; linked services: $linkedServiceCount; downloaded assets: $downloaded"
