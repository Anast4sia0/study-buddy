# Testing Report

## Introduction

After implementing the project we tested all major functionalities to make sure they worked correctly and provided the expected results.
Testing was performed manually by interacting with the web application and checking different user scenarios.


## Registration Testing

### test 1
Action: Register with valid information

Expected Result: Account is created successfully.

Result: Passed

### Test 2
Action: Enter an invalid email address.

Expected Result: Error message is displayed.

Result: Passed

### Test 3
Action: Enter a weak password.

Expected Result: Error message is displayed.

Result: Passed

### Test 4
Action: Pssword confirmation does not match the original password.

Expected Result: Error message is displayed.

Result: Passed

## Login Testing

### Test 1
Action: Login with correct credentials.

Expected Result: User successfully enters the application.

Result: Passed

### Test 2
Action: Login with incorrect credenials.

Expected Result: Error message is disPlayed.

Result: Passed



## Study Plan Testing

### Test 1
Action: Create a new study plan.

Expected Result: Study plan appears in the study plan list.

Result: Passed

### Test 2
Action: Open a study plan.

Expected Result: Selected study plan is displayed.

Result: Passed

### Test 3
Action: Delete a study plan.

Expected Result: Study plan is removed from the list.

Result: Passed


## task Testing

### Test 1
Action: Add a task to a study plan.

Expected Result: Task appears in the selected study plan.

Result: Passed

### Test 2
Action: Mark a task as completed.

Expected Result: Task status changes to completed and progress updates.

Result: Passed

### Test 3
Action: Delete a task.

Expected Result: Task is removed from the study plan.

Result: Passed

## Subtask Testing

### Test 1
Action: Add a subtask to a task.

Expected Result: Subtask appears under the selected task.

Result: Passed

### Test 2
Action: Mark a subtask as completed.

Expected Result: Subtask status changes and progress updates correctly.

Result: Passed

### Test 3
Action: Delete a subtask.

Expected Result: Subtask is removed from the task.

Result: Passed


## Progress Tracking Testing

### Test 1
Action: Complete tasks and subtasks.

Expected Result: Progress percentage increases correctly.

Result: Passed

### Test 2
Action: Complete all tasks and subtasks in a study plan.

Expected Result: Progress reaches 100%.

Result: Passed



## Timer testing

### Test 1
Action: Start the focus timer.

Expected Result: Countdown begins.

Result: Passed

### Test 2
Action: Pause the timer.

Expected Result: Countdown stops.

Result: Passed

### Test 3
Action: Reset the timer.

Expected Result: Timer returns to its initial value.

Result: Passed

### Test 4
Action: Start a task-specific timer.

Expected Result: Timer starts using the selected task's focus duration.

Result: Passed



## settings Testing

### Test 1
Action: Enable dark mode.

Expected Result: Interface theme changes to dark mode.

Result: Passed

### Test 2
Action: Change study timer settings.

Expected Result: New timer values are saved successfully.

Result: Passed

### test 3
Action: Refresh the application after changing settings.

Expected Result: Settings remain saved.

Result: Passed


## Local Storage Testing

### Test 1
Action: Create study plans, tasks, and subtasks, then refresh the page.

Expected Result: Data remains saved after refresh.

Result: Passed

### Test 2
Action: Log out and log back in.

Expected Result: User data loads correctly.

Result: Passed

## Conclusion

All major features of the application were tested successfully.

The registration system, login functionality, study plan management, task management, subtask management, progress tracking, focus timer, settings page, dark mode, and local storage functionality worked as expected during testing.

No major issues were found during final testing. The application meets the objectives defined at the beginning of the project and provides a simple and effective study management experience for students.