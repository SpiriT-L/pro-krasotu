param(
  [string]$OutputDirectory = "$(Join-Path $PSScriptRoot '..\src\data')"
)

$ErrorActionPreference = 'Stop'
$serviceUrl = 'https://dikidi.ru/209507?p=1.pi-ssm&o=7'
$mastersUrl = 'https://dikidi.ru/209507?p=0.pi-ssm'
$baseUrl = 'https://dikidi.ru'

function Get-Page([string]$Url) {
  return (Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 40).Content
}

function Decode([string]$Value) {
  if ($null -eq $Value) { return '' }
  return [System.Net.WebUtility]::HtmlDecode(($Value -replace '\s+', ' ').Trim())
}

function Get-Options([string]$Html) {
  $match = [regex]::Match($Html, "data-options='([^']+)'")
  if (!$match.Success) { throw 'Dikidi data-options was not found' }
  return ($match.Groups[1].Value | ConvertFrom-Json)
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

$serviceOptions = Get-Options (Get-Page $serviceUrl)
$serviceCategories = @($serviceOptions.step_data.list | ForEach-Object {
  $categoryName = Decode $_.name
  [ordered]@{
    id = [string]$_.id
    name = $categoryName
    services = @($_.services | ForEach-Object {
      [ordered]@{
        id = [string]$_.id
        name = Decode $_.name
        serviceValue = Decode $_.service_value
        description = Decode $_.service_value
        image = [string]$_.image
        price = [string]$_.price
        cost = [string]$_.cost
        currency = 'BYN'
        durationMinutes = [int]$_.time
        floatingPrice = [bool]$_.floating
        discount = [string]$_.discount
        share = [string]$_.share
        points = [string]$_.service_points
        customSort = [int]$_.service_custom_sort
        icon = [ordered]@{
          id = [string]$_.icon.id
          url = [string]$_.icon.url
        }
        bookingUrl = "$baseUrl/ru/record/209507?ss_s=$($_.id)"
        category = $categoryName
      }
    })
  }
})

$serviceJobs = foreach ($category in $serviceCategories) {
  foreach ($service in $category.services) {
    [pscustomobject]@{ id = $service.id; detailUrl = "$baseUrl/ru/profile/salon_krasoty_pro_krasotu_209507/service/$($service.id)" }
  }
}
$serviceDetails = $serviceJobs | ForEach-Object -Parallel {
  $job = $_
  try {
    $html = (Invoke-WebRequest -Uri $job.detailUrl -UseBasicParsing -TimeoutSec 30).Content
    $matches = [regex]::Matches($html, '<script type="application/ld\+json">(?<json>[\s\S]*?)</script>')
    foreach ($match in $matches) {
      try { $detail = $match.Groups['json'].Value | ConvertFrom-Json } catch { continue }
      if ($detail.'@type' -eq 'Service') {
        [pscustomobject]@{ id = $job.id; detailUrl = $job.detailUrl; description = [System.Net.WebUtility]::HtmlDecode(($detail.description -replace '\s+', ' ').Trim()); image = [string]$detail.image; availability = [string]$detail.offers.availability; detailSource = 'Dikidi JSON-LD Service' }
        return
      }
    }
  } catch { }
  [pscustomobject]@{ id = $job.id; detailUrl = $job.detailUrl; description = ''; image = ''; availability = ''; detailSource = 'Dikidi listing data; detail page unavailable during collection' }
} -ThrottleLimit 10
$detailById = @{}
foreach ($detail in $serviceDetails) { $detailById[$detail.id] = $detail }
foreach ($category in $serviceCategories) {
  foreach ($service in $category.services) {
    $detail = $detailById[$service.id]
    if ($null -ne $detail) {
      $service.detailUrl = $detail.detailUrl
      if ($detail.description) { $service.description = $detail.description }
      if ($detail.image) { $service.image = $detail.image }
      $service.availability = $detail.availability
      $service.detailSource = $detail.detailSource
    }
  }
}

$masterOptions = Get-Options (Get-Page $mastersUrl)
$masterMatches = [regex]::Matches($masterOptions.step_data.view, '<a class="master swiper-slide[\s\S]*?</a>')
$masters = @()

foreach ($masterMatch in $masterMatches) {
  $block = $masterMatch.Value
  $id = [regex]::Match($block, 'data-id="(?<value>[^"]+)"').Groups['value'].Value
  $href = [regex]::Match($block, 'href="(?<value>[^"]+)"').Groups['value'].Value
  $name = Decode ([regex]::Match($block, '<div class="name">(?<value>[\s\S]*?)</div>').Groups['value'].Value)
  $role = Decode ([regex]::Match($block, '<div class="title">(?<value>[\s\S]*?)</div>').Groups['value'].Value)
  $image = [regex]::Match($block, '<img[^>]+src="(?<value>[^"]+)"').Groups['value'].Value
  if ($image.StartsWith('/')) { $image = "$baseUrl$image" }
  $profileUrl = "$baseUrl$($href -replace '^/en/', '/ru/')"
  $profileHtml = Get-Page $profileUrl
  $title = Decode ([regex]::Match($profileHtml, '<h1 class="title">(?<value>[\s\S]*?)</h1>').Groups['value'].Value)
  if ($title) { $name = $title }
  $profileRole = Decode ([regex]::Match($profileHtml, '<div class="post">(?<value>[\s\S]*?)</div>').Groups['value'].Value)
  if ($profileRole) { $role = $profileRole }
  $profileImage = [regex]::Match($profileHtml, 'background-image: url\((?<value>[^)]+)\)').Groups['value'].Value
  if ($profileImage) { $image = $profileImage }
  $description = Decode ([regex]::Match($profileHtml, '<meta name="description" content="(?<value>[^"]+)"').Groups['value'].Value)
  $description = ($description -replace '✔[^.!?]*Dikidi', '').Trim()
  $serviceBlocks = [regex]::Matches($profileHtml, '<div class="service\s*">(?<value>[\s\S]*?)(?=<div class="service\s|</div>\s*</div>\s*</div>\s*</div>)')
  $masterServices = @($serviceBlocks | ForEach-Object {
    $serviceBlock = $_.Groups['value'].Value
    $serviceName = Decode ([regex]::Match($serviceBlock, '<div class="title">(?<value>[\s\S]*?)</div>').Groups['value'].Value)
    if (!$serviceName) { return }
    [ordered]@{
      name = $serviceName
      category = Decode ([regex]::Match($serviceBlock, '<div class="type">(?<value>[\s\S]*?)</div>').Groups['value'].Value)
      price = [regex]::Match($serviceBlock, '<div class="price">(?<value>[^<]+)').Groups['value'].Value.Trim()
      durationMinutes = [int]([regex]::Match($serviceBlock, '<div class="time">(?<value>\d+)').Groups['value'].Value)
    }
  })
  $masters += [ordered]@{
    id = $id
    fullName = $name
    photo = $image
    about = $description
    specialization = $role
    profileUrl = $profileUrl
    services = $masterServices
  }
}

$metadata = [ordered]@{
  salon = 'ПРО красоту'
  source = $serviceUrl
  collectedAt = (Get-Date).ToUniversalTime().ToString('o')
  currency = 'BYN'
}
[ordered]@{ metadata = $metadata; categories = $serviceCategories } | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath (Join-Path $OutputDirectory 'services.json') -Encoding UTF8
[ordered]@{ metadata = $metadata; masters = $masters } | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath (Join-Path $OutputDirectory 'masters.json') -Encoding UTF8
Write-Output "Saved $($serviceCategories.Count) categories, $($serviceCategories.services.Count) services and $($masters.Count) masters"
