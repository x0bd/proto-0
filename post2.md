DOT got some love last week (thank you! 🙏), so I kept building.

The big focus this week wasn't a new feature. It was the _feel_.

Here is what changed:

✨ **The Settings**
The modal is completely reworked into a soft, tactile, washi-paper aesthetic. You can now name your companion, and the header responds instantly. I added a full HSV spectrum picker—one accent color now flawlessly paints the eyes, mouth, and entire face. Segmented controls replaced dropdowns. Small details add up.

📱 **The Face on Mobile**
It was way too tiny. Not exactly a bug, just wasted space on a massive SVG canvas. I cropped the viewBox to the actual face region, and the rendered size jumped 50% on phones. It finally feels _right_.

🐛 **The Export Bug**
PNG and GIF exports were saving in black and white, ignoring user themes. Turns out the cloned element was losing computed styles. Fixed it by reading the live DOM values before cloning—so now, what you see is actually what you get.

Still very much a work in progress, but the craft is coming together.

You can play with it here: https://dot-0.vercel.app/

#CreativeCoding #WebDesign #SVG #EmotionDesign #UIUX #FrontendDevelopment #React #NextJS #DesignSystems #DesignEngineering #UXDesign #WebExperiments
