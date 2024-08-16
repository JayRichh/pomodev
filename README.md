# Pomodoro Timer Chrome Extension

A **Pomodoro Timer** built using **React**, **TypeScript**, and **Vite** to help manage time effectively. This extension includes a timer, a task manager, and theme customization options.

---
## Features and Technologies Used

<div align="left">

- **React 18** ![React Badge](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black):  
  Build dynamic UIs with component-based architecture.
  
- **TypeScript** ![TypeScript Badge](https://img.shields.io/badge/Typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white):  
  Static type checking for enhanced maintainability and fewer runtime errors.
  
- **Vite** ![Vite Badge](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white):  
  Lightning-fast development experience with custom Hot Module Replacement (HMR).
  
- **TailwindCSS** ![TailwindCSS Badge](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white):  
  Quickly style your app with utility-first CSS.
  
- **Chrome Extension Manifest 3** ![Chrome Extension Badge](https://img.shields.io/badge/Chrome_Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white):  
  Ensures compatibility with the latest Chrome extension standards.
  
- **Persistent Storage** ![Storage Badge](https://img.shields.io/badge/Storage-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white):  
  Saves tasks and timer state across sessions using local storage.

</div>

---

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
  - [Chrome Setup](#chrome-setup)
  - [Firefox Setup](#firefox-setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
  - [Core Components](#core-components)
- [Contributors](#contributors)
- [Community](#community)
- [References](#references)

---

## Introduction

This **Pomodoro Timer Extension** is designed for use within Chrome and Firefox browsers. It helps users manage time effectively using a timer and task manager. The focus is on a fast, efficient, and clean development experience with **Vite**, **React**, and **TypeScript**.

---

## Installation

### Chrome Setup

1. Run the development server: `pnpm dev`.
2. In Chrome, go to `chrome://extensions`.
3. Enable Developer Mode.
4. Click on "Load unpacked extension" and select the `dist` folder.
5. For production, use: `pnpm build`.

### Firefox Setup

1. Run `pnpm dev:firefox` to start the dev server.
2. In Firefox, navigate to `about:debugging#/runtime/this-firefox`.
3. Click "Load Temporary Add-on" and choose the `manifest.json` file in the `dist` folder.
4. Remember, Firefox requires re-loading after the browser is closed.

---

## Usage

The extension offers three main tabs:

1. **Timer**: 
   - Start, stop, and reset the Pomodoro timer. Customize the time by clicking on the display.
   - Timer state is stored persistently so that you can resume even after closing the extension.
   
2. **Tasks**: 
   - Manage tasks by adding, completing, or deleting them. Tasks persist in local storage.
   
3. **Settings**: 
   - Toggle between light and dark themes to personalize the extension's appearance.

---

## Project Structure

```bash
├── public/
│   └── content.css            # CSS for content scripts
├── src/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   │   ├── content/           # Content scripts for Chrome
│   │   ├── devtools/
│   │   ├── options/
│   │   ├── popup/             # Main UI with Timer, Tasks, and Settings
│   │   └── side-panel/
│   └── storage/               # Helper functions for local storage integration
├── manifest.js                # Chrome extension manifest
└── vite.config.js             # Vite config for custom HMR plugin
```