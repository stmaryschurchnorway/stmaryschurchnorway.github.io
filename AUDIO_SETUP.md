# Holy Qurbana Audio Setup Guide

## Overview

The carousel now supports audio files for pronunciation guides. If audio files are not found, it automatically falls back to browser text-to-speech.

## Audio Files Required

Generate MP3 files for each stage and place them in `/assets/audio/` with these names:

| File | Stage | Text to Record |
|------|-------|----------------|
| `qurbana-stage-0.mp3` | Holy Qurbana | Holy Qurbana, the central act of worship in the Malankara Syriac Orthodox Church |
| `qurbana-stage-1.mp3` | Thooyobo | Thooyobo, the preparation rites and vesting of the priest |
| `qurbana-stage-2.mp3` | Service of Melchizedek | Service of Melchizedek, representing the ancient priesthood |
| `qurbana-stage-3.mp3` | Preparation of Elements | Preparation of elements, offering for the living and departed |
| `qurbana-stage-4.mp3` | Liturgy of the Word | Liturgy of the Word, with Trisagion and Gospel readings |
| `qurbana-stage-5.mp3` | Kiss of Peace | Kiss of Peace, reconciliation before the sacred offering |
| `qurbana-stage-6.mp3` | Lifting of the Sosappa | Lifting of the Sosappa, unveiling the sacred mystery |
| `qurbana-stage-7.mp3` | Institution | Institution, commemorating Christ's Last Supper |
| `qurbana-stage-8.mp3` | Epiklesis | Epiklesis, invocation of the Holy Spirit upon the gifts |
| `qurbana-stage-9.mp3` | Intercession (Tubden) | Intercession, prayers for the Church, saints, and departed |
| `qurbana-stage-10.mp3` | Fraction and Communion | Fraction and Communion, holy things for the holy |

## How to Generate Audio Files

### Option 1: ElevenLabs (Recommended)

1. Go to [ElevenLabs Text-to-Speech Malayalam](https://elevenlabs.io/text-to-speech/malayalam)
2. For each phrase above:
   - Paste the text in the input box
   - Select a male or female Malayalam voice
   - Click "Generate" or "Download"
   - Save as `qurbana-stage-[N].mp3`
3. Upload all files to `/assets/audio/` directory

### Option 2: Narakeet

1. Go to [Narakeet Malayalam TTS](https://www.narakeet.com/languages/malayalam-text-to-voice/)
2. Paste each text phrase
3. Select Malayalam voice
4. Download as MP3
5. Name and upload to `/assets/audio/`

### Option 3: Kapwing

1. Go to [Kapwing Text-to-Speech](https://www.kapwing.com/tools/text-to-speech/malayalam)
2. Follow similar process as ElevenLabs
3. Download and save files

## Directory Structure

```
/assets/audio/
├── qurbana-stage-0.mp3
├── qurbana-stage-1.mp3
├── qurbana-stage-2.mp3
├── qurbana-stage-3.mp3
├── qurbana-stage-4.mp3
├── qurbana-stage-5.mp3
├── qurbana-stage-6.mp3
├── qurbana-stage-7.mp3
├── qurbana-stage-8.mp3
├── qurbana-stage-9.mp3
└── qurbana-stage-10.mp3
```

## Testing

1. Navigate to the Qurbana page: `/qurbana/`
2. Click the speaker button (🔊) on any stage
3. If the MP3 file exists, it will play the recorded audio
4. If the file is not found, it falls back to browser text-to-speech

## Fallback Behavior

The carousel has automatic fallback: if an audio file is missing, it will use browser text-to-speech synthesis instead. This means the site will continue to work even if some audio files haven't been generated yet.

## Notes

- Audio files should be in MP3 format for best browser compatibility
- Recommended bitrate: 128kbps (good quality, small file size)
- Each file should be 5-15 seconds long
- Test playback in different browsers before going live
