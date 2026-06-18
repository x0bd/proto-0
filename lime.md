# Lime — Xoboid's original design system

The indigo-ink + lime-signal palette (light mode only). Deep indigo `#1A1B52` as ink
on a warm bone `#EBEBEB` canvas, with electric lime `#BAFF29` as the single accent.
Geist for prose, JetBrains Mono for instrument labels, Geist Pixel Square for display
numerals, Noto Sans JP for kanji.

> Superseded in `studio/` by the blue/black/white system — kept here so it can be reused
> in other projects.

## Palette

| Token                 | Value                     | Role                               |
| --------------------- | ------------------------- | ---------------------------------- |
| `--bg`                | `#ebebeb`                 | Canvas (warm bone)                 |
| `--surface`           | `#f4f4f2`                 | Raised-off-canvas panels           |
| `--surface-raised`    | `#ffffff`                 | Cards / highest layer              |
| `--fg`                | `#1a1b52`                 | Ink (deep indigo)                  |
| `--fg-muted`          | `rgba(26, 27, 82, 0.65)`  | Body / secondary text              |
| `--fg-faint`          | `rgba(26, 27, 82, 0.42)`  | Labels / captions                  |
| `--hair`              | `rgba(26, 27, 82, 0.12)`  | Hairline borders                   |
| `--hair-2`            | `rgba(26, 27, 82, 0.24)`  | Stronger dividers                  |
| `--accent`            | `#baff29`                 | Lime — the one signal colour       |
| `--accent-hover`      | `#c6ff52`                 | Lime hover                         |
| `--accent-foreground` | `#1a1b52`                 | Ink-on-lime (text over the accent) |
| `--kanji-ghost`       | `rgba(26, 27, 82, 0.045)` | Giant background kanji watermark   |

## Typography

| Token            | Stack                                                           | Use                        |
| ---------------- | --------------------------------------------------------------- | -------------------------- |
| `--font-grotesk` | `var(--font-geist-sans), "Noto Sans JP", system-ui, sans-serif` | Prose, headlines           |
| `--font-mono`    | `"JetBrains Mono", ui-monospace, "SFMono-Regular", monospace`   | ALL-CAPS instrument labels |
| `--font-pixel`   | `var(--font-geist-pixel-square), "JetBrains Mono", monospace`   | Display numerals, indices  |
| `--font-jp`      | `"Noto Sans JP", var(--font-geist-sans), sans-serif`            | Kanji (Geist has no CJK)   |

Radius: `--radius: 0.5rem`.

## Drop-in `:root`

```css
:root {
	--bg: #ebebeb;
	--surface: #f4f4f2;
	--surface-raised: #ffffff;
	--fg: #1a1b52;
	--fg-muted: rgba(26, 27, 82, 0.65);
	--fg-faint: rgba(26, 27, 82, 0.42);
	--hair: rgba(26, 27, 82, 0.12);
	--hair-2: rgba(26, 27, 82, 0.24);
	--accent: #baff29;
	--accent-hover: #c6ff52;
	--accent-foreground: #1a1b52;
	--kanji-ghost: rgba(26, 27, 82, 0.045);

	--font-grotesk:
		var(--font-geist-sans), "Noto Sans JP", system-ui, sans-serif;
	--font-mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", monospace;
	--font-pixel: var(--font-geist-pixel-square), "JetBrains Mono", monospace;
	--font-jp: "Noto Sans JP", var(--font-geist-sans), sans-serif;

	/* — shadcn bridge — */
	--background: var(--bg);
	--foreground: var(--fg);
	--card: var(--surface-raised);
	--card-foreground: var(--fg);
	--popover: var(--surface-raised);
	--popover-foreground: var(--fg);
	--primary: var(--fg);
	--primary-foreground: var(--bg);
	--secondary: #e3e3e1;
	--secondary-foreground: var(--fg);
	--muted: #e3e3e1;
	--muted-foreground: var(--fg-muted);
	--destructive: #d23a2c;
	--border: var(--hair);
	--input: var(--hair-2);
	--ring: var(--fg);

	/* — chart series: indigo ramp + the lime event — */
	--chart-1: var(--accent);
	--chart-2: var(--fg);
	--chart-3: rgba(26, 27, 82, 0.6);
	--chart-4: rgba(26, 27, 82, 0.35);
	--chart-5: rgba(26, 27, 82, 0.18);

	--radius: 0.5rem;
}
```

## How lime behaves (the one rule that matters)

Lime is **geometry, never raw text on the light canvas**. Use it for:

- dots / squares / 2px rules / bar fills / chart events
- a **"marker" highlight** — lime background + indigo text (`--accent-foreground`),
  `3px` radius — to emphasise a single word or stat inline:

    ```css
    .marker {
    	background: var(--accent);
    	color: var(--accent-foreground);
    	padding: 0 5px;
    	border-radius: 3px;
    }
    ```

**Exception:** on a dark indigo band (`background: var(--fg)`), lime _text_ is allowed —
that's the one place it reads as a colour rather than a shape. Light text on that band
uses bone, e.g. `rgba(235, 235, 235, 0.45)` for labels.

Charts: an indigo opacity ramp (`0.18 → 0.35 → 0.6 → 1.0`) with **lime reserved for the
single highlighted slice / event**, never the whole series.
