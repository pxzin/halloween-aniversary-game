# Prompt: Background - Façade

## Description
To transform a Google Street View image of the house façade into a spooky game background, consistent with the established art style.

## Instructions

1.  **Use Style Reference:** Start your prompt with `--sref [URL_DA_IMAGEM_DA_ESCADA]` to use our approved stairs image as the style bible.
2.  **Upload Image:** After the `--sref` parameter, upload the screenshot from Google Street View.
3.  **Use Text Prompt:** Add the following text prompt.

## Prompt

```
HD pixel art game background. The house from the image is the only building visible. The rest of the neighborhood, including other houses and cars, is completely replaced by a spooky swamp with dense, low-lying fog and gnarled, dead trees. A large, glowing full moon is in the sky on the left side of the house, casting dramatic light. The gate in front of the house has a visible, metallic padlock on it. The mood is haunted, eerie, and isolated. --ar 16:9
```

### Negative Prompt

```
--no 3d, blurry, photo, realistic, clean, day, sunny, cute, other buildings, cars, people
```

## Logic and Reasoning

- **`--sref [URL_DA_IMAGEM_DA_ESCADA]`**: This is the most important part. It tells the AI to mimic the *style* of our first successful background, ensuring visual consistency.
- **`The house...is the only building visible.`**: Isolates the main subject.
- **`...replaced by a spooky swamp...`**: Fulfills the request to change the environment.
- **`A large, glowing full moon...`**: Adds a key lighting and atmospheric element.
- **`...gate...has a visible, metallic padlock...`**: Adds the specific detail required for the first puzzle.
