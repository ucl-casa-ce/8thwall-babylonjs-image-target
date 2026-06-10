# WebAR Image Target (8th Wall + Babylon.js)

WebAR project using the 8th Wall XR engine and Babylon.js to track image targets and anchor 3D content in real time.

---

## Overview

This project is a minimum configuration for:

- Image target tracking (planar images)
- Babylon.js integration via XR camera behaviour
- Anchoring 3D objects to tracked images
- Support for single or multiple image targets via JSON

---

## Dependencies

- [8th Wall XR Engine](https://github.com/8thwall/engine)
- [Babylon.js](https://www.babylonjs.com/) 
- [Tween.js](https://createjs.com/tweenjs)
- [Vite](https://vite.dev/)

---

## Setup

Install dependencies:

```bash
npm install
```


## Adding a New Image Target

Image targets can be added either using the 8th Wall tools or manually.

### Option 1 — Using 8th Wall tools

Use the official guide to generate image target files:

[8th Wall Image Targets Guide](https://8thwall.org/docs/engine/guides/image-targets)

This will generate the required metadata and processed images automatically.

---

### Option 2 — Manual setup

You can also define image targets manually by editing the JSON file (so far worked well)

Example:

```json
{
  "imagePath": "/target/image-name.jpg",
  "metadata": {},
  "name": "target-image",
  "type": "PLANAR",
  "properties": {
    "left": 0,
    "top": 0,
    "width": 480,
    "height": 655,
    "originalWidth": 480,
    "originalHeight": 655,
    "isRotated": true
  }
}
```

Multiple targets can be added as an array (attention to have unique name for eah iamge)

```json
[
  {
  "imagePath": "/target/image-name.jpg",
  "metadata": {},
  "name": "target-image",
  "type": "PLANAR",
  "properties": {
    "left": 0,
    "top": 0,
    "width": 480,
    "height": 655,
    "originalWidth": 480,
    "originalHeight": 655,
    "isRotated": true
  }
 },
 {
  "imagePath": "/target/image-name.jpg",
  "metadata": {},
  "name": "target-image-2",
  "type": "PLANAR",
  "properties": {
    "left": 0,
    "top": 0,
    "width": 480,
    "height": 655,
    "originalWidth": 480,
    "originalHeight": 655,
    "isRotated": true
   }
  }
]
```