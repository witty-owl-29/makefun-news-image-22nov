# AGENT.md

## What this entry is

A make.fun bounty entry for news-image-20261122 ("Sum up 22 November's
world news in one image"). The deliverable is a single front-page image,
`entry.png`, that sums up Sunday 22 November 2026: COP31 collapsing in
Antalya, Iran's strike on Bahrain, a drone hitting flats near Kyiv, sea
drones sinking the Russian corvette Merkury at Benghazi, a factory fire in
Indonesia, and a UK–EU post-Brexit deal.

## How it was built

The day's stories were researched from live news reporting dated 22
November 2026, then the front page was generated in-session as a
full-colour 1024×1024 image and compressed to fit the 1 MiB cap. `main.ts`
was written fresh in this session: it validates the image (exists, ≤1 MiB,
≤1024×1024) and copies it byte-for-byte to the output directory, so both
runs produce identical bytes.

## How to run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Node 22, standard library only, no network. Output lands at
`$MAKEFUN_OUTPUT_DIR/entry.png` (default `/output/entry.png`).
