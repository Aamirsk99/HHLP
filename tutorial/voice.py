"""Step 3 of the tutorial build: Hindi voice-over and video.

Speaks each shot's line with an offline Hindi neural voice (Piper model run by
sherpa-onnx), then joins frame + voice into clips with ffmpeg and writes:
  output/videos/NN-<chapter>.mp4               one video per feature
  output/Hindivine-Diet-How-to-Use-Hindi.mp4   the full tutorial
  output/Hindivine-Diet-How-to-Use-Hindi.srt   Hindi subtitles
  output/chapters.txt                          YouTube chapter timestamps

Usage: python3 tutorial/voice.py /path/to/vits-piper-hi_IN-priyamvada-medium
"""
import hashlib
import json
import os
import re
import subprocess
import sys
import wave

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'build')
FINAL = os.path.join(HERE, 'output')
NAME = 'Hindivine-Diet-How-to-Use-Hindi'
LEAD, TAIL = 0.4, 0.7  # silence before / after each line (seconds)
FPS = 25


def ffmpeg(*args):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *args], check=True)


def make_tts(voice_dir):
    import sherpa_onnx
    model = next(f for f in os.listdir(voice_dir) if f.endswith('.onnx'))
    cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
        vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=os.path.join(voice_dir, model),
            tokens=os.path.join(voice_dir, 'tokens.txt'),
            data_dir=os.path.join(voice_dir, 'espeak-ng-data')),
        num_threads=4))
    return sherpa_onnx.OfflineTts(cfg)


def speak(tts, text, path):
    import soundfile as sf
    clean = re.sub(r'["“”]', '', text)
    audio = tts.generate(clean, sid=0, speed=0.95)
    sf.write(path, audio.samples, audio.sample_rate)


def wav_len(path):
    with wave.open(path) as w:
        return w.getnframes() / w.getframerate()


def ts(t, srt=False):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    if srt:
        return f'{h:02}:{m:02}:{int(s):02},{int(round((s % 1) * 1000)) % 1000:03}'
    return f'{h}:{m:02}:{int(s):02}' if h else f'{m}:{int(s):02}'


def main():
    voice_dir = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('HINDI_VOICE')
    if not voice_dir:
        sys.exit(__doc__)
    shots = json.load(open(os.path.join(OUT, 'shots.json'), encoding='utf-8'))
    for d in ('audio', 'clips'):
        os.makedirs(os.path.join(OUT, d), exist_ok=True)
    os.makedirs(os.path.join(FINAL, 'videos'), exist_ok=True)
    tts = None

    last_of = {}
    for i, s in enumerate(shots):
        last_of[s['chapter']] = i

    clips, srt, chapters, t = [], [], [], 0.0
    for i, s in enumerate(shots):
        key = hashlib.sha1(s['say'].encode()).hexdigest()[:12]
        wav = os.path.join(OUT, 'audio', f'{key}.wav')
        if not os.path.exists(wav):
            tts = tts or make_tts(voice_dir)
            speak(tts, s['say'], wav)
        speech = wav_len(wav)
        dur = round((LEAD + speech + TAIL) * FPS) / FPS
        first, last = s['shot'] == 1, i == last_of[s['chapter']]
        fades = []
        if first:
            fades.append('fade=t=in:st=0:d=0.3')
        if last:
            fades.append(f'fade=t=out:st={dur - 0.3:.2f}:d=0.3')
        clip = os.path.join(OUT, 'clips', s['file'].replace('.png', '.mp4'))
        ffmpeg('-loop', '1', '-framerate', str(FPS), '-i', os.path.join(OUT, 'frames', s['file']), '-i', wav,
               '-filter_complex', f"[0:v]{','.join(fades + ['format=yuv420p']) }[v];"
               f"[1:a]adelay={int(LEAD * 1000)}:all=1,apad,aresample=44100[a]",
               '-map', '[v]', '-map', '[a]', '-t', f'{dur:.2f}', '-ac', '2',
               '-c:v', 'libx264', '-tune', 'stillimage', '-preset', 'medium', '-crf', '22', '-r', str(FPS),
               '-c:a', 'aac', '-b:a', '128k', clip)
        clips.append((s, clip))

        if first:
            chapters.append(f"{ts(t)} {s['chapter']}. {s['title']} ({s['en']})")
        # Subtitles: one cue per sentence, timed by its share of the line's length.
        parts = [p.strip() for p in re.split(r'(?<=[।!?])\s+', s['say']) if p.strip()]
        total_chars = sum(len(p) for p in parts)
        start = t + LEAD
        for p in parts:
            end = start + speech * len(p) / total_chars
            srt.append((start, end, p))
            start = end
        t += dur
        print(f'{s["file"]}: {dur:.1f}s')

    def concat(items, dest):
        lst = dest + '.txt'
        with open(lst, 'w') as f:
            f.writelines(f"file '{c}'\n" for c in items)
        ffmpeg('-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-movflags', '+faststart', dest)
        os.remove(lst)

    by_chapter = {}
    for s, c in clips:
        by_chapter.setdefault((s['chapter'], s['id']), []).append(c)
    for (n, cid), cs in by_chapter.items():
        concat(cs, os.path.join(FINAL, 'videos', f'{n:02}-{cid}.mp4'))
    concat([c for _, c in clips], os.path.join(FINAL, f'{NAME}.mp4'))

    with open(os.path.join(FINAL, f'{NAME}.srt'), 'w', encoding='utf-8') as f:
        for k, (a, b, text) in enumerate(srt, 1):
            f.write(f'{k}\n{ts(a, True)} --> {ts(b, True)}\n{text}\n\n')
    with open(os.path.join(FINAL, 'chapters.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(chapters) + '\n')
    print(f'total {ts(t)} · {len(by_chapter)} chapters')


if __name__ == '__main__':
    main()
