# Hindivine Diet: how-to-use video (Hindi voice-over)

A 9:46 tutorial that walks through every feature of the app, one by one, with a Hindi voice-over and Hindi captions.

## Videos

| File | What it is |
| --- | --- |
| [`output/Hindivine-Diet-How-to-Use-Hindi.mp4`](output/Hindivine-Diet-How-to-Use-Hindi.mp4) | Full tutorial, 1920×1080 |
| [`output/videos/`](output/videos) | One short video per feature (22 files), e.g. for WhatsApp or in-app help |
| [`output/Hindivine-Diet-How-to-Use-Hindi.srt`](output/Hindivine-Diet-How-to-Use-Hindi.srt) | Hindi subtitles for the full video |
| [`output/chapters.txt`](output/chapters.txt) | Chapter timestamps. Paste them into the YouTube description. |

### Chapters

1. परिचय (Introduction)
2. डैशबोर्ड (Dashboard)
3. मेनू और टैब बार (Menu & tab bar)
4. स्टेप 1: मरीज़ की जानकारी (Patient details)
5. स्टेप 2: डाइट प्लान और टारगेट (Diet plan & targets)
6. स्टेप 3: खाने की पसंद (Food preferences)
7. स्टेप 4: दिन और भाषा (Days & language)
8. स्टेप 5: डाइटीशियन और चार्ट बनाइए (Dietitian & create)
9. डाइट चार्ट देखिए (Your diet chart)
10. मील एडिट, स्वैप और लॉक (Edit, swap & lock meals)
11. चार्ट से रेसिपी देखें (Recipe from the chart)
12. चार्ट की भाषा बदलें (Change chart language)
13. ए-फ़ोर पीडीएफ़ और प्रिंट (A4 PDF & print)
14. मोर मेनू (More options)
15. अगले हफ़्ते का चार्ट (Next week's chart)
16. मरीज़ और हिस्ट्री (Patients & history)
17. सेव किए गए चार्ट (Saved charts)
18. पिछला पीडीएफ़ अपलोड (Upload previous PDF)
19. रेसिपी (Recipes)
20. फ़ूड लाइब्रेरी (Food library)
21. सेटिंग्स और बैकअप (Settings & backup)
22. धन्यवाद (Thank you)

## Editing the narration and rebuilding

The Hindi script and the app actions for each shot are in [`chapters.js`](chapters.js). To change a line, edit its `say` text and rebuild. The screens are captured from the real app, so the video stays up to date when the app changes.

**Needs:** Node 18+, Playwright (Chromium), Python 3, ffmpeg, poppler (`pdftoppm`), and the Noto Sans Devanagari font.

```sh
pip install sherpa-onnx soundfile
# Offline Hindi neural voice (Piper "priyamvada"; "pratham" is a male voice)
curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-hi_IN-priyamvada-medium.tar.bz2
tar xjf vits-piper-hi_IN-priyamvada-medium.tar.bz2

npx http-server -p 8765 . &                   # serve the app from the repo root
node tutorial/capture.js                      # 1. phone screenshots  → tutorial/build/shots
node tutorial/compose.js                      # 2. 1920×1080 frames   → tutorial/build/frames
python3 tutorial/voice.py vits-piper-hi_IN-priyamvada-medium   # 3. voice + video → tutorial/output
```

The sample patients (Sunita Sharma, Rahul Verma, Anita Gupta) are made up.
