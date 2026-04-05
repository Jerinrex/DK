# 🎂 Birthday Surprise — Monic Dayana
### Setup & Editing Guide

---

## 📁 File Structure

```
birthday-dayana/
│
├── index.html              ← Page 1: Intro / Greeting   (START HERE)
├── page2-survey.html       ← Page 2: Survey
├── page3-note.html         ← Page 3: Birthday Letter
├── page4-video.html        ← Page 4: Final Video
│
├── css/
│   ├── global.css          ← Shared styles (colors, buttons, animations)
│   ├── page1-intro.css     ← Styles only for intro page
│   ├── page2-survey.css    ← Styles only for survey page
│   ├── page3-note.css      ← Styles only for note page
│   └── page4-video.css     ← Styles only for video page
│
├── js/
│   ├── shared.js           ← Stars, doves, hearts, music, navigation
│   └── survey.js           ← Survey questions and submit logic
│
└── assets/
    ├── music/
    │   └── birthday-song.mp3    ← 🎵 PUT YOUR MUSIC HERE
    ├── video/
    │   └── birthday-wish.mp4    ← 🎬 PUT YOUR VIDEO HERE
    └── images/                  ← For any future images
```

---

## 🚀 Quick Start

### Step 1 — Add Your Media
- Copy your music to: `assets/music/birthday-song.mp3`
- Copy your video to: `assets/video/birthday-wish.mp4`

### Step 2 — Set Up Email Delivery (Web3Forms)
1. Go to **https://web3forms.com** → sign up (free)
2. Get your **Access Key**
3. Open `js/survey.js` and find this line:
   ```js
   const WEB3FORMS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';
   ```
4. Replace the placeholder with your real key

### Step 3 — Open in Browser
Open `index.html` using a local server:
- **VS Code**: Install *Live Server* extension → right-click `index.html` → *Open with Live Server*
- **Terminal**: `python -m http.server` then go to `http://localhost:8000`

> ⚠️ Opening `index.html` directly (double-click) may block music/video due to browser security. Always use a local server.

---

## ✏️ Editing Guide

### Change the intro text (Page 1)
Open `index.html` → find the `<div class="intro-lines">` section → edit the `<p>` tags.

### Change the birthday letter (Page 3)
Open `page3-note.html` → find `<div class="note-body">` → edit the `<p>` paragraphs.
The comment markers show you exactly where to edit:
```html
<!-- ↓↓↓ EDIT YOUR LETTER PARAGRAPHS BELOW ↓↓↓ -->
```

### Change Dayana's name
Search for "Dayana" across all HTML files and replace as needed.

### Add more survey questions
Open `js/survey.js` → add to the `QUESTIONS` array:
```js
{
  id:          'q6',
  label:       'What is your favorite song? 🎵',
  type:        'text',
  placeholder: 'The one always on repeat…',
},
{
  id:      'q7',
  label:   'Dream vacation? 🌏',
  type:    'pills',
  options: ['Maldives', 'Paris', 'Tokyo', 'Bali', 'New York'],
},
```
The progress bar and navigation update automatically — no other changes needed.

### Change colors / fonts
Open `css/global.css` → edit the `:root` variables at the top:
```css
:root {
  --bg:          #05050f;    /* main background */
  --white:       #ffffff;    /* primary text */
  --soft:        rgba(255,255,255,0.78); /* secondary text */
  --font-display: 'Cormorant Garamond', serif;
  --font-body:    'Jost', sans-serif;
  /* ... */
}
```

---

## 🌐 Hosting (Share the Link)

To share with Dayana, host for free on:
- **Netlify Drop** → drag the entire folder to https://app.netlify.com/drop
- **Vercel** → `vercel deploy`
- **GitHub Pages** → push to a repo and enable Pages

---

## 📝 Notes
- Music state (playing / muted / time) is remembered across pages via `sessionStorage`
- Music permission modal is shown only once per browser session
- Survey submits via Web3Forms — if the key is invalid, it still proceeds to the next page gracefully
