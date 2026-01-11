# Project Design System: "Glass & Air"

## 1. Core Philosophy
This design system, nicknamed **"Glass & Air"**, is built on the principles of **Hyper-Minimalism**, **Organic Technology**, and **Premium Utility**. It draws heavy inspiration from the design ethos of **Apple (Big Sur/VisionOS)** and **Naoto Fukasawa** (super-normal design), utilizing high-quality whitespace and "washi" (paper) textures in light mode.

### Key Tenets
*   **The Interface is Liquid**: Elements should feel like they are floating in a suspended medium. There are no hard "pages", only layers of depth.
*   **Data as Art**: Numbers and metrics are not just information; they are the primary visual decoration. We avoid ornamental graphics in favor of beautiful typography and spacing.
*   **Tactile Light**: Interaction is communicated through light and depth (glows, shadows, blurs) rather than flat color changes.
*   **Premium functionality**: The tool must look expensive to build trust. A professional farmer manages millions in assets; their software should reflect that value.

---

## 2. Visual Language

### A. Color Palette (Semantic)
We use a strictly curated semantic palette based on "Washi" (Paper) and "Sumi" (Ink).

*   **Background**: `hsl(240 10% 3.9%)` (Dark) or `#f0f0f2` (Light - warm gray). Not pure black/white.
*   **Glass**: `bg-card/40`, `bg-card/60`. We rarely use 100% opacity. The background must bleed through to establish context.
*   **Accents (The "Nature" Tones)**:
    *   **Success/Growth**: `Emerald` (Growth, Income, Health). *Not Green.* Emerald has a blue undertone that feels more premium and technical.
    *   **Alert/Action**: `Rose` (Expense, Critical, Error). *Not Red.* Rose is softer, less aggressive, but equally urgent.
    *   **Warning/Attention**: `Amber` (Pending, Harvest, Sun).
    *   **Neutral/Structure**: `Indigo` (Net Profit, System Status). A "business" color.

### B. Typography
The font stack balances readability with character.

*   **Primary Sans**: `Inter` or `Geist Sans`.
*   **Styling Rules**:
    *   **Headers**: `uppercase tracking-widest text-[10px] or text-xs font-bold`. This "micro-header" style is a signature.
    *   **Metrics**: `font-light` or `font-thin`. Large numbers look elegant when thin.
    *   **Data Labels**: `text-muted-foreground`.

### C. Depth & Texture (Glassmorphism)
The grading is "Grade 2 Glass".

*   **Blur**: `backdrop-blur-xl`.
*   **Border**: `border-border/40`. Extremely subtle interaction with light.
*   **Shadow**: `shadow-premium`.
    ```css
    box-shadow: 
      0 1px 2px -1px rgb(0 0 0 / 0.08),
      0 4px 6px -2px rgb(0 0 0 / 0.04),
      0 12px 16px -4px rgb(0 0 0 / 0.04);
    ```

### D. Radius & Spacing
*   **Card Radius**: `rounded-[2rem]` (32px). Aggressive rounding.
*   **Spacing**: Loose. "Air" is a component.

---

## 3. Component Patterns (React/Tailwind)

### The "Premium Card" Template
```tsx
<Card className="
    border-border/40                // Subtle border
    bg-card/40                      // Translucent base
    backdrop-blur-xl                // Heavy glass effect
    shadow-premium                  // Soft, deep shadow
    rounded-[2rem]                  // aggressive rounding
    overflow-hidden                 // Clip content
    group                           // For hover states
">
    {/* Optional: Internal Glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <CardHeader>
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Icon className="w-4 h-4 text-emerald-500" />
            Card Title
        </CardTitle>
    </CardHeader>
    <CardContent>...</CardContent>
</Card>
```

---

## 4. Prompting Guide (for other projects)
When asking an AI to generate UI in this style, use these instructions:

> "Design a UI component using React and Tailwind CSS. The aesthetic is 'Functional Luxury' or 'Zen Tech'.
>
> 1.  **Container**: Use `bg-card/40`, `backdrop-blur-xl`, `border-border/40`, and `rounded-[2rem]`.
> 2.  **Typography**: Use `text-xs uppercase tracking-widest font-bold text-muted-foreground` for all eyebrows/headers. Use `font-light tracking-tighter` for large data numbers.
> 3.  **Colors**: Use `emerald` for positive, `rose` for negative, `amber` for warning. Avoid primary colors. Use `bg-{color}-500/10` and `text-{color}-500` for badges.
> 4.  **Vibe**: It should look like a glass pane floating 10px above a clean surface. It should feel expensive."
