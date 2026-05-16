$path = "c:\Users\Admin\Desktop\My Projects\LMS-Monorepo\frontend\app\admin\page.js"
$content = Get-Content $path
$newContent = @()
$skip = $false

for ($i = 0; $i -lt $content.Length; $i++) {
    if ($i -eq 1711 - 1) { # line 1711
        $newContent += "                          </div>"
        $newContent += "                       )}"
        $newContent += "                    </div>"
        $newContent += "                 </div>"
        $newContent += "              )}"
        $skip = $true
    }
    if ($skip) {
        if ($i -eq 1714 - 1) { $skip = $false }
        continue
    }
    $newContent += $content[$i]
}
$newContent | Set-Content $path -Encoding UTF8
