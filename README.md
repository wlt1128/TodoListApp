Todo Application
Overview
This Todo application is a simple yet powerful tool designed to help users manage their tasks and requirements efficiently. It offers a range of functionalities tailored to enhance task management, including the ability to add, edit, delete, and search for tasks. Users can mark tasks as ongoing or completed, attach images to tasks, share tasks with others, and view tasks in a calendar format. This application is developed using the Expo framework to leverage its cross-platform capabilities and ease of use.

Functions
Add New Tasks: Users can add new tasks with descriptions.
Delete Tasks: Allows users to remove tasks that are no longer needed.
Edit Tasks: Users can modify the details of existing tasks.
Search Tasks: Features a search functionality to quickly find tasks.
Mark Tasks: Tasks can be marked as either in progress or completed.
Attach Images: Users can attach images from their camera or photo library to tasks.
Share Tasks: The application includes functionality to share tasks with others.
Calendar View: Tasks can be viewed in a calendar, providing a visual timeline of tasks.
Getting Started
To get started with the Todo application, ensure you have Expo CLI installed on your system. If not, you can install it using npm:

npm install -g expo-cli
Installation
Clone the repository to your local machine:

git clone https://github.com/wlt1128/TodoListApp.git
cd todo-application
Install the dependencies:

expo install expo-image-picker expo-location @react-native-async-storage/async-storage
npm install react-native-calendars react-native-vector-icons
Starting the Server
To start the Expo server and run the application, execute:

npx expo start
This command will open a browser window with the Expo developer tools. You can then run the application on a physical device using the Expo Go app or on an emulator.

Dependencies
expo-image-picker: For selecting images from the device's camera or photo library.
expo-location: To obtain the device's geographical location information.
@react-native-async-storage/async-storage: For persistent storage of data on the device.
react-native-calendars: Displays a calendar component within the app.
react-native-vector-icons: Utilized for incorporating icons within the application.


