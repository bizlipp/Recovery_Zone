# Kidney Health Guide for Pops

A loving, interactive health guide designed specifically for older adults to help track and manage kidney health in a simple, engaging way.

## Features

- **Mobile-Friendly Card Layout**: Easy to navigate on any device
- **Daily Checklist**: Track simple health tasks that make a big difference
- **Streak Tracking**: Builds motivation with a simple "streak" counter
- **Progress Visualization**: Weekly chart showing daily task completion
- **Achievement System**: Unlock badges and milestones for consistent habits
- **Milestone Messages**: Custom encouraging messages for specific streak counts
- **Context-Aware Feedback**: Different messages based on progress and milestones
- **Local Shopping Guide**: Filterable list of where to find items in Spirit Lake, ID
- **Dark Mode**: Easier on the eyes, especially at night
- **Adjustable Text Size**: For easier reading
- **Text-to-Speech**: Listen to the content instead of reading
- **Encouraging Messages**: Random supportive messages appear occasionally

## Installation

No installation required! Simply open `index.html` in any modern web browser.

### Running Locally

1. Download or clone this repository
2. Open `index.html` in your browser
3. That's it!

### Running on a Server/GitHub Pages

This project is designed to work with GitHub Pages:

1. Fork or push this repository to GitHub
2. Enable GitHub Pages in your repository settings
3. Your guide will be available at `https://yourusername.github.io/repository-name`

## Usage

### For Family Members

- Share the link or file with your loved one
- Show them how to use the daily checklist
- Encourage them to check in daily for streak building
- Celebrate their achievements when they reach milestones
- Help them locate the recommended items using the shopping guide

### For the User (Pops)

- **Check Items**: Tap each item you complete for the day
- **Track Progress**: See your weekly activity in the progress chart
- **Earn Achievements**: Unlock badges for consistent habits
- **Find Products**: Use the shopping guide to locate needed items locally
- **Expand/Collapse Sections**: Tap section headers to show/hide content
- **Adjust Text Size**: Use the buttons at the bottom to make text larger/smaller
- **Listen**: Use the "Read Aloud" button to hear the content

## Milestone System

The app includes special milestone recognition:

- **Streak Milestones**: Special messages at 3, 7, 14, 21, 30, 60, 90, 100, and 365 days
- **Progress Feedback**: Context-aware messages when completing tasks
- **Special Occasions**: Unique encouragement on Mondays, Fridays, and the start of a new month
- **Achievement Badges**: Visual badges for reaching significant milestones

## Local Storage

This app uses your browser's local storage to remember:

- Your dark/light preference
- Your text size preference
- Which sections you've collapsed
- Your daily checklist progress
- Your streak count
- Your unlocked achievements

No data is sent to any server - it all stays on your device.

## Shopping Guide

The application includes a filterable shopping guide specifically for Spirit Lake, ID:

- **Store Filters**: Quickly filter items by store (Miller's, White Cross Pharmacy, Family Dollar)
- **Product Details**: Where to find each item in the store, estimated prices, and what to ask for
- **Mobile-Friendly**: Table adapts to smaller screens by focusing on essential information

## Customization

If you want to customize the content:

- Edit the content in `Kplan.js` in the `populateSections()` and `populateChecklist()` functions
- Modify styles in `Kplan.css`
- Add more checklist items by editing the `checklistItems` array
- Customize milestone messages in the `milestoneMessages` object
- Update the shopping guide items for your own location by editing the table in `index.html`

## Browser Support

Works on all modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

## Credits

Tim
AeroVista llc.
.nexus-labs