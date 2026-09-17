# 将《非遗项目.zip》解压后的原始素材，规范化复制到 public/ich/
# 用途：原始素材文件名带中文、空格、序号混乱，直接当 URL 会有编码与顺序问题。
# 运行：powershell -ExecutionPolicy Bypass -File scripts/prepare-assets.ps1

param(
  [string]$SourceRoot = (Join-Path $PSScriptRoot '..\素材源\非遗项目'),
  [string]$DestRoot   = (Join-Path $PSScriptRoot '..\public\ich')
)

$ErrorActionPreference = 'Stop'
$SourceRoot = (Resolve-Path -LiteralPath $SourceRoot).Path
$DestRoot = [System.IO.Path]::GetFullPath($DestRoot)

# 每个非遗项目：slug -> 原始目录名
$projects = [ordered]@{
  'jingxing-lahua'        = 'A井陉拉花【国家级】'
  'changshan-zhangu'      = 'B常山战鼓【国家级】'
  'gengcun-gushi'         = 'C耿村民间故事【国家级】'
  'shijiazhuang-sixian'   = 'D石家庄丝弦【国家级】'
  'zanhuang-tubu'         = 'E赞皇县原村土布纺织技术【国家级】'
  'wuji-jianzhi'          = 'F无极剪纸'
  'taolinping-shehuo'     = 'G桃林坪花脸社火'
  'zhengding-gaozhao'     = 'H正定高照'
  'jingxing-mudiao'       = 'I井陉木雕'
  'shijiazhuang-niangjiu' = 'J石家庄酒酿造技艺'
}

# 封面 / 图集 / AI 图 / 视频 的挑选结果（源文件名 -> 目标文件名）
$plan = @{
  'jingxing-lahua' = @{
    '井陉拉花 实图1.jpg' = 'cover.jpg'
    '井陉拉花 实图2.jpg' = 'g1.jpg'
    '井陉拉花 实图3.jpg' = 'g2.jpg'
    '井陉拉花 实图4.jpg' = 'g3.jpg'
    '井陉拉花 实图5.jpg' = 'g4.jpg'
    'AI 1.jpg' = 'ai1.jpg'
    'AI 2.jpg' = 'ai2.jpg'
    'AI 3.jpg' = 'ai3.jpg'
    '井陉拉花（视频）.mp4' = 'video.mp4'
  }
  'changshan-zhangu' = @{
    '常山战鼓 实图1.jpg' = 'cover.jpg'
    '常山战鼓 实图2.jpg' = 'g1.jpg'
    '常山战鼓 实图3.jpg' = 'g2.jpg'
    'AI 1.jpg' = 'ai1.jpg'
    'AI 2.jpg' = 'ai2.jpg'
    'AI 3.jpg' = 'ai3.jpg'
    '常山战鼓(视频).mp4' = 'video.mp4'
  }
  'gengcun-gushi' = @{
    '耿村民间故事 实图2.jpg' = 'cover.jpg'
    '耿村民间故事 实图1.jpg' = 'g1.jpg'
    'AI 1.jpg' = 'ai1.jpg'
    'AI 2.jpg' = 'ai2.jpg'
    '耿村民间故事（视频）.mp4' = 'video.mp4'
  }
  'shijiazhuang-sixian' = @{
    '石家庄丝弦 实图3.jpg' = 'cover.jpg'
    '石家庄丝弦 实图4.jpg' = 'g1.jpg'
    '石家庄丝弦 实图2.jpg' = 'g2.jpg'
    '石家庄丝弦《杨门女将》实图1.jpg' = 'g3.jpg'
    'AI 1.jpg' = 'ai1.jpg'
    'AI 2.jpg' = 'ai2.jpg'
    'AI 3.jpg' = 'ai3.jpg'
    'AI 4.jpg' = 'ai4.jpg'
    '石家庄丝弦（视频）.mp4' = 'video.mp4'
  }
  'zanhuang-tubu' = @{
    '纺织技术 实图2.jpg' = 'cover.jpg'
    '纺织技术 实图1.jpg' = 'g1.jpg'
    '纺织技术 实图3.jpg' = 'g2.jpg'
    '纺织技术 实图4.jpg' = 'g3.jpg'
    '纺织技术 实图5.jpg' = 'g4.jpg'
    'AI 1.jpg' = 'ai1.jpg'
    'AI 2.jpg' = 'ai2.jpg'
    '赞皇县原村土布纺织技术(视频).mp4' = 'video.mp4'
  }
  'wuji-jianzhi' = @{
    '无极剪纸4.jpg' = 'cover.jpg'
    '无极剪纸1.jpg' = 'g1.jpg'
    '无极剪纸2.jpg' = 'g2.jpg'
    '无极剪纸3.jpg' = 'g3.jpg'
    '无极剪纸5.jpg' = 'g4.jpg'
    '无极剪纸6.jpg' = 'g5.jpg'
    '无极剪纸7.jpg' = 'g6.jpg'
    'AI1.png' = 'ai1.png'
    'AI2.png' = 'ai2.png'
    'AI3.png' = 'ai3.png'
    '无极剪纸视频.mp4' = 'video.mp4'
  }
  'taolinping-shehuo' = @{
    '桃林坪花脸社火10.jpg' = 'cover.jpg'
    '桃林坪花脸社火1.png' = 'g1.png'
    '桃林坪花脸社火2.png' = 'g2.png'
    '桃林坪花脸社火3.png' = 'g3.png'
    '桃林坪花脸社火4.png' = 'g4.png'
    '桃林坪花脸社火5.jpg' = 'g5.jpg'
    '桃林坪花脸社火6.jpeg' = 'g6.jpg'
    '桃林坪花脸社火7.jpg' = 'g7.jpg'
    '桃林坪花脸社火8.jpg' = 'g8.jpg'
    '桃林坪花脸社火9.jpg' = 'g9.jpg'
    '桃林坪花脸社火11.jpg' = 'g10.jpg'
    '桃林坪花脸社火12.jpg' = 'g11.jpg'
    'AI1.png' = 'ai1.png'
    'AI2.png' = 'ai2.png'
    'AI3.png' = 'ai3.png'
    '桃林坪花脸火社视频.mp4' = 'video.mp4'
  }
  'zhengding-gaozhao' = @{
    '正定高照2.jpg' = 'cover.jpg'
    '正定高照1.jpg' = 'g1.jpg'
    '正定高照3.jpg' = 'g2.jpg'
    '正定高照4.jpg' = 'g3.jpg'
    '正定高照5.jpg' = 'g4.jpg'
    'AI1.png' = 'ai1.png'
    'AI2.png' = 'ai2.png'
    'AI3.png' = 'ai3.png'
    '正定高照视频1.mp4' = 'video.mp4'
    '正定高照视频2.mp4' = 'video2.mp4'
  }
  'jingxing-mudiao' = @{
    '井陉木雕6.jpg' = 'cover.jpg'
    '井陉木雕1.jpg' = 'g1.jpg'
    '井陉木雕2.jpg' = 'g2.jpg'
    '井陉木雕3.jpg' = 'g3.jpg'
    '井陉木雕4.jpg' = 'g4.jpg'
    '井陉木雕5.jpg' = 'g5.jpg'
    '井陉木雕7.jpg' = 'g6.jpg'
    '井陉木雕8.jpg' = 'g7.jpg'
    'AI1.png' = 'ai1.png'
    'AI2.png' = 'ai2.png'
    '井陉木雕视频.mp4' = 'video.mp4'
  }
  'shijiazhuang-niangjiu' = @{
    '2.jpg' = 'cover.jpg'
    '1.png' = 'g1.png'
    '3.jpg' = 'g2.jpg'
    'AI1.png' = 'ai1.png'
    'AI2.png' = 'ai2.png'
    'AI3.png' = 'ai3.png'
    '石家庄酒酿造技艺视频.mp4' = 'video.mp4'
  }
}

# 背景图（首页/卡片海报底图）
$backgrounds = @{
  '拉花.jpg' = 'lahua.jpg'
  '战鼓.jpg' = 'zhangu.jpg'
  '民间故事会.jpg' = 'gushi.jpg'
  '丝弦.jpg' = 'sixian.jpg'
  '纺织.jpg' = 'fangzhi.jpg'
  '无极剪纸.jpg' = 'jianzhi.jpg'
  '花脸灶火.jpg' = 'shehuo.jpg'
  '正定高照.jpg' = 'gaozhao.jpg'
  '木雕.jpg' = 'mudiao.jpg'
  '酒酿.jpg' = 'niangjiu.jpg'
}

$copied = 0
$missing = @()

foreach ($slug in $plan.Keys) {
  $srcDir = Join-Path $SourceRoot $projects[$slug]
  $dstDir = Join-Path $DestRoot $slug
  New-Item -ItemType Directory -Force -Path $dstDir | Out-Null
  foreach ($src in $plan[$slug].Keys) {
    $from = Join-Path $srcDir $src
    $to = Join-Path $dstDir $plan[$slug][$src]
    if (Test-Path -LiteralPath $from) {
      Copy-Item -LiteralPath $from -Destination $to -Force
      $copied++
    } else {
      $missing += "$slug / $src"
    }
  }
}

$bgDst = Join-Path $DestRoot 'bg'
New-Item -ItemType Directory -Force -Path $bgDst | Out-Null
foreach ($src in $backgrounds.Keys) {
  $from = Join-Path (Join-Path $SourceRoot '背景图') $src
  $to = Join-Path $bgDst $backgrounds[$src]
  if (Test-Path -LiteralPath $from) {
    Copy-Item -LiteralPath $from -Destination $to -Force
    $copied++
  } else {
    $missing += "bg / $src"
  }
}

Write-Host "已复制文件：$copied"
if ($missing.Count -gt 0) {
  Write-Host "未找到的素材：" -ForegroundColor Yellow
  $missing | ForEach-Object { Write-Host "  $_" }
}
Write-Host "输出目录：$DestRoot"
