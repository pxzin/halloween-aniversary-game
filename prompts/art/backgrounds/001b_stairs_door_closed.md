# Prompt: Background - Stairs (Closed Door Variant)

## Description
To create a variant of the main stairs background where the door at the top is closed. This prompt uses the generated image with the open door as a base.

## Instructions

Upload the generated stairs image (the one with the open door) to the AI tool first, then use the following text prompt. A high image weight is crucial.

## Prompt

```
Photo-edit of the reference image. The only change is to add a simple, dark black wooden door to close the open doorway at the top of the stairs. Do not change the style, colors, or pixelation of the original image. Match the existing art style perfectly. --ar 16:9 --iw 2 --s 50
```

### Negative Prompt

```
--no changes, different style, new elements, open door, re-pixelate, extra details
```

## Logic and Reasoning

- **`Photo-edit of the reference image`**: This new wording strongly suggests a modification rather than a recreation, which should help prevent the "double pixelation" issue.
- **`The only change is...`**: Very direct and specific instruction.
- **`Do not change the style, colors, or pixelation...`**: Explicitly tells the AI what to preserve.
- **`--s 50`**: This (optional, for Midjourney) lowers the "stylization" value from the default of 100, encouraging the AI to take fewer creative liberties and stick closer to the source image.
- **`--iw 2`**: The high image weight remains critical to enforce adherence to the reference image.
