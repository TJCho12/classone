# Class One Clinic – Aesthetic Equipment Guide

A static, English-language catalog of the equipment listed on Class One Clinic's official equipment page. It's built with plain HTML, CSS, vanilla JavaScript and one JSON file, and needs no server or database.

Content rule: device names, images and descriptions come only from the official equipment page (https://classoneclinic.com/classone_equipment.php), translated into English. Superlative or result-guarantee wording from the original page is left out. Please don't add information that isn't on that page.

## Project structure

```text
classone-equipment-guide/
├── index.html          Page layout
├── css/styles.css      Styles (mobile-first)
├── js/app.js           Loads devices.json, renders cards, search and filters
├── data/devices.json   All device information (edit this file only)
├── assets/images/      Device images (<id>.webp or <id>.png)
├── scripts/fetch-images.sh  Downloads the device images from the clinic page
├── SOURCES.md          Source page and translation notes
└── README.md
```

This folder lives inside the `classone` repository. The `.nojekyll` file sits at the repository root.

## 1. Download the images (first time only)

The image files aren't included in this package. Run this once on your Mac from the project folder:

```bash
bash scripts/fetch-images.sh
```

Run it from the `classone-equipment-guide` folder. It saves each image as `assets/images/<id>.png`. If `cwebp` is installed (`brew install webp`), it converts the images to WebP and resizes them to 800px wide. Until the files are in place, the page loads each image directly from the clinic's website. If that also fails, the card shows the device name instead.

## 2. Local preview

`fetch()` doesn't work when you open `index.html` by double-clicking it, so run a local server:

```bash
cd classone
python3 -m http.server 8000
```

Open http://localhost:8000/classone-equipment-guide/. To check the mobile layout, use your browser's device toolbar, or open `http://<your-Mac-IP>:8000` on a phone on the same Wi-Fi.

## 3. GitHub repository setup

1. On GitHub, create a new **public** repository named `classone`. Don't add a README.
2. In the `classone` folder (the repository root), run:

```bash
git init
git add .
git commit -m "Initial equipment guide"
git branch -M main
git remote add origin https://github.com/TJCho12/classone.git
git push -u origin main
```

## 4. GitHub Pages deployment

1. In the repository, go to **Settings → Pages**.
2. Under **Build and deployment**, set Source to **Deploy from a branch**, Branch to **main**, and folder to **/ (root)**, then click **Save**.
3. After a minute or two, the guide is live at `https://TJCho12.github.io/classone/classone-equipment-guide/`. The repository root URL redirects there.

All paths are relative, so the site works under the repository subpath. The `.nojekyll` file at the repository root stops GitHub from processing the files with Jekyll.

## 5. Updating device information

Edit `data/devices.json` only. You don't need to change any HTML.

Each device looks like this:

```json
{
  "id": "thermage-flx",
  "name": "Thermage FLX",
  "nameKo": "써마지FLX",
  "category": "laser-lifting",
  "description": "English translation of the clinic's description.",
  "image": "assets/images/thermage-flx.webp",
  "imageSource": "https://classoneclinic.com/data/file/total/....png"
}
```

- `category` must be one of: `laser-lifting`, `skin-laser`, `hair-removal`, `skin-analysis`. These match the tabs on the clinic's page.
- To add a device, copy an entry, give it a new unique `id`, and place it where it should appear. Cards follow the order in the file.
- To remove a device, delete its entry.
- Leave `description` as `""` if the clinic page has no description. The card then shows only the name and image.
- After an edit, update `meta.lastUpdated` (YYYY-MM-DD). The footer date reads from it.
- Validate the JSON before pushing, for example with `python3 -m json.tool data/devices.json`.

## 6. Adding or replacing images

1. Save the image as `assets/images/<id>.webp`, where `<id>` is the device's `id`. A `.png` also works.
2. Product images on a white or transparent background look best. Cards show images at a 4:3 ratio without cropping.
3. Keep each file under about 150 KB. To convert: `cwebp -q 82 -resize 800 0 input.png -o assets/images/<id>.webp`.
4. Commit and push. GitHub Pages updates automatically.
