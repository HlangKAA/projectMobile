# Project Mobile - StudySync

This is a React Native project managed with Expo.

## Getting Started (สำหรับเพื่อนที่นำไปทำต่อ)

Follow these steps to set up the project on your local machine.

### 1. Clone the Repository
Open your terminal and run:
```bash
git clone https://github.com/HlangKAA/projectMobile.git
cd projectMobile
```

### 2. Install Dependencies
Install all the required node modules:
```bash
npm install
```

### 3. Start the Project
Run the development server:
```bash
npx expo start
```
-   Press `a` to run on Android Emulator.
-   Press `i` to run on iOS Simulator (macOS only).
-   Scan the QR code with the **Expo Go** app on your physical device.

## Note on Time Picker
We are using a custom `TimePickerModal` component located in `src/components/TimePickerModal.js` instead of the native `@react-native-community/datetimepicker` to avoid build issues.

## Project Structure
-   `src/screens/`: Main application screens (Timetable, Planner).
-   `src/components/`: Reusable components (TimePickerModal).
-   `src/utils/`: Utility functions (time conflict detection).
