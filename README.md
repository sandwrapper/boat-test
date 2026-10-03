# Skipper Prep

An interactive, English-only study app for the Norwegian recreational boating licence exam
(the licence for craft up to 15 metres). Built for someone starting from zero with two days to prepare.

## What is inside

- **Ten lessons** in exam order: the exam and the law, rules of the road, navigation lights and
  day shapes, sound signals and distress, sea marks and sector lights, charts and navigation,
  seamanship, safety and emergencies, weather, engine and environment. Every lesson has verified
  illustrations, "remember" boxes and check questions.
- **Trainers**: lights at night, sea marks and light rhythms, who gives way, sound signals (with
  audio), navigation arithmetic.
- **Flashcards** per topic with a simple spaced-repetition queue.
- **Practice quizzes** with instant explanations, weighted towards questions you have not seen or got wrong.
- **Mock exam**: 50 questions, 60 minutes, drawn from the four official curriculum parts, scored
  with both real pass rules (at least 40 correct AND no more than 2 wrong in part 4, the
  "particularly important topics").
- **Review page** with weak topics, missed questions and exam history. Progress is saved in the browser.

## Run it

Open `index.html` in any modern browser (no server or build needed), or open the single-file build
`dist/index.html`, which works offline from a USB stick or phone download.

```
node build.js                 # regenerates dist/index.html and dist/artifact.html
node test/smoke.js            # headless browser smoke test of the built app
node test/check-topic.js <slug> --shots out/   # validates one topic and renders its pictures
```

Tests need Playwright (`npm i -g playwright` plus a Chromium; set `CHROMIUM_PATH` if it is not found).

## Structure

```
index.html            app shell
src/app.js            registry, storage, router, home/learn/lesson/review views
src/quiz.js           inline checks, practice quiz, mock exam, flashcards
src/trainers.js       drill harness shared by the trainers; src/trainer-*.js the trainers
src/svg*.js           illustration library (verified pictures)
content/<topic>.js    one module per topic: sections, flashcards, questions
CONTENT_SCHEMA.md     the content contract; STYLE.md writing rules; ILLUSTRATIONS.md picture API
```

## Sources

Facts were researched and independently re-verified against the Norwegian Maritime Authority
(sdir.no), the regulation texts on Lovdata, Kystverket, Kartverket, the IMO COLREG consolidated text,
the IALA Maritime Buoyage System and the official exam curriculum. Laws change: check the current
official rules before you go to sea.
