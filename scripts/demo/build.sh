#!/bin/bash
# 녹화 결과 → 사이트에 올릴 영상. 사용: scripts/demo/build.sh <출력폴더>
set -euo pipefail
cd "$1"
read -r START LEN <<<"$(python3 -c "import json;d=json.load(open('cut.json'));print(d['trimStart'],d['stageSeconds'])")"
H264=(-c:v libx264 -crf 16 -pix_fmt yuv420p -r 30)
ffmpeg -y -v error -i stage.webm -vf "trim=${START}:$(python3 -c "print($START+$LEN)"),setpts=PTS-STARTPTS,fps=30" "${H264[@]}" stage.mp4
# 다시 연 문서 탭의 실제 녹화. 앞의 무대와 달리 유휴 압축을 걸지 않는다 — 걸면 끝 장면이 순식간에 지나간다.
ffmpeg -y -v error -i reopened.webm -vf "fps=30" "${H264[@]}" tail.mp4
join2() { ffmpeg -y -v error -i "$1" -i tail.mp4 -filter_complex "[0:v][1:v]concat=n=2:v=1[v]" -map "[v]" "${H264[@]}" "$2"; }
join2 stage.mp4 raw.mp4
python3 /tmp/ssalt/src/polish.py stage.mp4 --events demo.events.jsonl --out stage-polished.mp4 --smooth-cursor --speedup
join2 stage-polished.mp4 polished.mp4
# 기능 칸 클립은 시각이 녹화와 같아야 잘라 낼 수 있어서 유휴 압축 없는 판에서 자른다.
python3 /tmp/ssalt/src/polish.py stage.mp4 --events demo.events.jsonl --out cursor.mp4 --smooth-cursor

mkdir -p web
ENC=(-c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -movflags +faststart -an)
ffmpeg -y -v error -i polished.mp4 "${ENC[@]}" web/demo.mp4
read -r OPEN_T SED_T REOPEN_T SEARCH_T CLOSE_T <<<"$(python3 - <<'PY'
import json
notes=json.load(open('commands.log.json'))
downs=[json.loads(l) for l in open('demo.events.jsonl') if '"down"' in l]
print(notes[1]['t'],notes[2]['t'],notes[3]['t'],downs[0]['t'],downs[1]['t'])
PY
)"
add() { python3 -c "print(max(0,$1+$2))"; }
LEFT=856:720:0:0
ffmpeg -y -v error -i cursor.mp4 -vf "trim=$(add "$OPEN_T" -1.6):$(add "$OPEN_T" 4.5),setpts=PTS-STARTPTS,crop=$LEFT" "${ENC[@]}" web/feature-background.mp4
ffmpeg -y -v error -i cursor.mp4 -vf "trim=$(add "$SED_T" -1.8):$(add "$REOPEN_T" 3.6),setpts=PTS-STARTPTS,crop=$LEFT" "${ENC[@]}" web/feature-reload.mp4
# 패널 옆에 터미널 조각이 잘려 보이지 않게, 같은 프레임의 탭 카드·문서 카드·패널만 옮겨 놓는다.
ffmpeg -y -v error -i cursor.mp4 -filter_complex "\
[0:v]trim=$(add "$SEARCH_T" -0.9):$(add "$CLOSE_T" 2.6),setpts=PTS-STARTPTS,split=3[a][b][c];\
[a]crop=412:268:14:446[tabs];[b]crop=412:268:440:446[doc];[c]crop=400:700:866:14[pan];\
color=c=0xF7F5F3:s=850x720:r=30[bg];\
[bg][tabs]overlay=10:10:shortest=1[x];[x][doc]overlay=10:290:shortest=1[y];[y][pan]overlay=436:10:shortest=1[v]" \
  -map "[v]" "${ENC[@]}" web/feature-list.mp4
ffmpeg -y -v error -ss "$(add "$SEARCH_T" -1.2)" -i raw.mp4 -frames:v 1 web/demo-poster.png
