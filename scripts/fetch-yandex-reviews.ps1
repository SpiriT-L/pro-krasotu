param(
  [string]$OutputPath = "$(Join-Path $PSScriptRoot '..\src\data\comments.json')"
)

$ErrorActionPreference = 'Stop'
$pageUrl = 'https://yandex.by/maps/157/minsk/?l=sat%2Cskl&ll=27.478432%2C53.852510&mode=poi&poi%5Bpoint%5D=27.477996%2C53.852486&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D168094301476&tab=reviews&z=19'
$apiOrigin = 'https://yandex.by'
$businessId = '168094301476'

function Get-Signature([string]$Query) {
  [uint64]$hash = 5381
  foreach ($character in $Query.ToCharArray()) { $hash = ((($hash * 33) -bxor [uint64][char]$character) % 4294967296) }
  return [string]$hash
}

function Get-SignedReviews([object]$State, [Microsoft.PowerShell.Commands.WebRequestSession]$Session, [int]$Page) {
  $parameters = [ordered]@{
    ajax = '1'; businessId = $businessId; csrfToken = [string]$State.config.csrfToken; locale = 'ru_RU'; page = [string]$Page; pageSize = '50'; ranking = 'by_time'; reqId = [string]$State.config.requestId; sessionId = [string]$State.config.counters.analytics.sessionId
  }
  $parts = @()
  foreach ($key in ($parameters.Keys | Sort-Object { $_.ToLowerInvariant() })) { $parts += [uri]::EscapeDataString($key) + '=' + [uri]::EscapeDataString([string]$parameters[$key]) }
  $query = $parts -join '&'
  $url = "$apiOrigin/maps/api/business/fetchReviews?$query&s=$(Get-Signature $query)"
  return Invoke-WebRequest -Uri $url -UseBasicParsing -WebSession $Session -Headers @{ Accept = 'application/json, text/plain, */*'; Referer = $pageUrl; 'X-Retpath-Y' = $pageUrl } -TimeoutSec 40
}

function Get-AvatarColor([string]$Name) {
  $palette = @('#B59A6A', '#8A6B57', '#6E8376', '#9A7180', '#6D7894', '#A47C50', '#787D5B', '#8D6F9E')
  $sum = 0
  foreach ($character in $Name.ToCharArray()) { $sum = ($sum + [int][char]$character) % $palette.Count }
  return $palette[$sum]
}

function Get-Initial([string]$Name) { return (($Name.Trim() -split '\s+')[0].Substring(0, 1)).ToUpperInvariant() }

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$page = Invoke-WebRequest -Uri $pageUrl -UseBasicParsing -WebSession $session -TimeoutSec 40
$stateMatch = [regex]::Match($page.Content, '<script type="application/json" class="state-view">(?<json>[\s\S]*?)</script>')
if (!$stateMatch.Success) { throw 'Yandex state-view was not found' }
$state = $stateMatch.Groups['json'].Value | ConvertFrom-Json
$reviews = @()
$totalPages = 2

for ($pageNumber = 1; $pageNumber -le $totalPages; $pageNumber++) {
  $payload = (Get-SignedReviews $state $session $pageNumber).Content | ConvertFrom-Json
  if ($payload.csrfToken) { $state.config.csrfToken = $payload.csrfToken; $payload = (Get-SignedReviews $state $session $pageNumber).Content | ConvertFrom-Json }
  if (!$payload.data.reviews) { throw "Yandex returned no reviews for page $pageNumber" }
  if ($pageNumber -eq 1) { $totalPages = [int]$payload.data.params.totalPages }
  $reviews += @($payload.data.reviews)
}

$result = @($reviews | ForEach-Object {
  $name = [string]$_.author.name
  [ordered]@{
    id = "yandex-$($_.reviewId)"
    source = 'Yandex Maps'
    sourceUrl = $pageUrl
    name = $name
    rating = [int]$_.rating
    createdAt = if ($_.updatedTime -is [datetime]) { $_.updatedTime.ToUniversalTime().ToString('o') } else { [string]$_.updatedTime }
    text = [string]$_.text
    avatar = [ordered]@{ initial = Get-Initial $name; color = Get-AvatarColor $name }
  }
})

$result | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $OutputPath -Encoding UTF8
Write-Output "Saved $($result.Count) Yandex reviews to $OutputPath"
