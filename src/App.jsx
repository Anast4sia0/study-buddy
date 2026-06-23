import { useEffect, useState } from "react";
import "./index.css";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const [planTitle, setPlanTitle] = useState("");
  const [planDescription, setPlanDescription] = useState("");

  const [subject, setSubject] = useState("");
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [activeSubtaskTaskId, setActiveSubtaskTaskId] = useState(null);
  const [subtaskText, setSubtaskText] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [studyTime, setStudyTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [taskTimerMinutes, setTaskTimerMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);

  function showMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  }

  function isValidEmail(value) {
    return /\S+@\S+\.\S+/.test(value);
  }

  function isStrongPassword(value) {
    return (
      value.length >= 8 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value)
    );
  }

  function clearAuthForm() {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }

  function registerUser() {
    if (name.trim().length < 3) {
      showMessage("Please enter a valid full name.", "error");
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("Please enter a valid email address.", "error");
      return;
    }

    if (!isStrongPassword(password)) {
      showMessage(
        "Password must contain at least 8 characters, uppercase, lowercase, and a number.",
        "error"
      );
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Passwords do not match.", "error");
      return;
    }

    const users = JSON.parse(localStorage.getItem("studyBuddyUsers")) || [];

    const userExists = users.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (userExists) {
      showMessage("User with this email already exists.", "error");
      return;
    }

    const newUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      joinedAt: new Date().toLocaleDateString(),
    };

    const updatedUsers = [...users, newUser];

    localStorage.setItem("studyBuddyUsers", JSON.stringify(updatedUsers));
    localStorage.setItem("studyBuddyCurrentUser", JSON.stringify(newUser));

    setCurrentUser(newUser);
    setPlans([]);
    setSelectedPlanId(null);
    clearAuthForm();

    showMessage("Registration successful.", "success");
  }

  function loginUser() {
    if (!isValidEmail(email)) {
      showMessage("Please enter a valid email address.", "error");
      return;
    }

    if (password.trim() === "") {
      showMessage("Please enter your password.", "error");
      return;
    }

    const users = JSON.parse(localStorage.getItem("studyBuddyUsers")) || [];

    const foundUser = users.find(
      (user) =>
        user.email.toLowerCase() === email.trim().toLowerCase() &&
        user.password === password
    );

    if (!foundUser) {
      showMessage("Incorrect email or password.", "error");
      return;
    }

    const savedPlans =
      JSON.parse(localStorage.getItem(`studyBuddyPlans_${foundUser.email}`)) ||
      [];

    localStorage.setItem("studyBuddyCurrentUser", JSON.stringify(foundUser));

    setCurrentUser(foundUser);
    setPlans(savedPlans);
    setSelectedPlanId(savedPlans.length > 0 ? savedPlans[0].id : null);
    clearAuthForm();

    if (savedPlans.length > 0) {
      setSubject(savedPlans[0].title);
    }

    showMessage("Login successful.", "success");
  }

  function logoutUser() {
    setCurrentUser(null);
    setPlans([]);
    setSelectedPlanId(null);
    setSubject("");
    setTask("");
    setPriority("Medium");
    setActiveSubtaskTaskId(null);
    setSubtaskText("");
    setActiveTaskId(null);
    setIsRunning(false);
    setSecondsLeft(studyTime * 60);
    localStorage.removeItem("studyBuddyCurrentUser");

    showMessage("Logged out successfully.", "info");
  }

  function savePlans(updatedPlans) {
    setPlans(updatedPlans);

    if (currentUser) {
      localStorage.setItem(
        `studyBuddyPlans_${currentUser.email}`,
        JSON.stringify(updatedPlans)
      );
    }
  }

  function createPlan() {
    if (planTitle.trim() === "") {
      showMessage("Please enter a study plan title.", "error");
      return;
    }

    const newPlan = {
      id: Date.now(),
      title: planTitle.trim(),
      description:
        planDescription.trim() || "No description was added for this plan.",
      createdAt: new Date().toLocaleDateString(),
      tasks: [],
    };

    const updatedPlans = [...plans, newPlan];

    savePlans(updatedPlans);

    setSelectedPlanId(newPlan.id);
    setSubject(newPlan.title);
    setPlanTitle("");
    setPlanDescription("");

    showMessage("Study plan created successfully.", "success");
  }

  function openPlan(id) {
    const selectedPlan = plans.find((plan) => plan.id === id);

    setSelectedPlanId(id);
    setActiveSubtaskTaskId(null);
    setSubtaskText("");
    setActiveTaskId(null);
    setIsRunning(false);
    setSecondsLeft(studyTime * 60);

    if (selectedPlan) {
      setSubject(selectedPlan.title);
    }

    showMessage("Study plan opened.", "info");
  }

  function deletePlan(id) {
    const updatedPlans = plans.filter((plan) => plan.id !== id);

    savePlans(updatedPlans);

    if (selectedPlanId === id) {
      const nextPlan = updatedPlans.length > 0 ? updatedPlans[0] : null;

      setSelectedPlanId(nextPlan ? nextPlan.id : null);
      setSubject(nextPlan ? nextPlan.title : "");
      setActiveTaskId(null);
      setIsRunning(false);
      setSecondsLeft(studyTime * 60);
    }

    showMessage("Study plan deleted.", "info");
  }

  function addTask() {
    if (!selectedPlanId) {
      showMessage("Please open a study plan first.", "error");
      return;
    }

    if (task.trim() === "") {
      showMessage("Please enter a task first.", "error");
      return;
    }

    const newTask = {
      id: Date.now(),
      subject: subject.trim(),
      text: task.trim(),
      priority,
      timerMinutes: taskTimerMinutes,
      completed: false,
      subtasks: [],
      createdAt: new Date().toLocaleDateString(),
    };

    const updatedPlans = plans.map((plan) =>
      plan.id === selectedPlanId
        ? { ...plan, tasks: [...plan.tasks, newTask] }
        : plan
    );

    savePlans(updatedPlans);

    setTask("");
    setPriority("Medium");
    setTaskTimerMinutes(studyTime);

    showMessage("Task added to selected plan.", "success");
  }

  function toggleTask(id) {
    const updatedPlans = plans.map((plan) =>
      plan.id === selectedPlanId
        ? {
            ...plan,
            tasks: plan.tasks.map((item) =>
              item.id === id ? { ...item, completed: !item.completed } : item
            ),
          }
        : plan
    );

    savePlans(updatedPlans);
  }

  function deleteTask(id) {
    const updatedPlans = plans.map((plan) =>
      plan.id === selectedPlanId
        ? {
            ...plan,
            tasks: plan.tasks.filter((item) => item.id !== id),
          }
        : plan
    );

    savePlans(updatedPlans);

    if (activeSubtaskTaskId === id) {
      setActiveSubtaskTaskId(null);
      setSubtaskText("");
    }

    if (activeTaskId === id) {
      setActiveTaskId(null);
      setIsRunning(false);
      setSecondsLeft(studyTime * 60);
    }

    showMessage("Task deleted.", "info");
  }

  function addSubtask(taskId) {
    if (subtaskText.trim() === "") {
      showMessage("Please enter a subtask.", "error");
      return;
    }

    const newSubtask = {
      id: Date.now(),
      text: subtaskText.trim(),
      completed: false,
    };

    const updatedPlans = plans.map((plan) =>
      plan.id === selectedPlanId
        ? {
            ...plan,
            tasks: plan.tasks.map((item) =>
              item.id === taskId
                ? { ...item, subtasks: [...item.subtasks, newSubtask] }
                : item
            ),
          }
        : plan
    );

    savePlans(updatedPlans);

    setSubtaskText("");
    setActiveSubtaskTaskId(null);

    showMessage("Subtask added.", "success");
  }

  function toggleSubtask(taskId, subtaskId) {
    const updatedPlans = plans.map((plan) =>
      plan.id === selectedPlanId
        ? {
            ...plan,
            tasks: plan.tasks.map((item) =>
              item.id === taskId
                ? {
                    ...item,
                    subtasks: item.subtasks.map((subtask) =>
                      subtask.id === subtaskId
                        ? { ...subtask, completed: !subtask.completed }
                        : subtask
                    ),
                  }
                : item
            ),
          }
        : plan
    );

    savePlans(updatedPlans);
  }

  function deleteSubtask(taskId, subtaskId) {
    const updatedPlans = plans.map((plan) =>
      plan.id === selectedPlanId
        ? {
            ...plan,
            tasks: plan.tasks.map((item) =>
              item.id === taskId
                ? {
                    ...item,
                    subtasks: item.subtasks.filter(
                      (subtask) => subtask.id !== subtaskId
                    ),
                  }
                : item
            ),
          }
        : plan
    );

    savePlans(updatedPlans);
    showMessage("Subtask deleted.", "info");
  }

  function clearAllTasks() {
    if (!selectedPlanId) return;

    const updatedPlans = plans.map((plan) =>
      plan.id === selectedPlanId ? { ...plan, tasks: [] } : plan
    );

    savePlans(updatedPlans);
    setIsRunning(false);
    setSecondsLeft(studyTime * 60);
    setActiveSubtaskTaskId(null);
    setSubtaskText("");
    setActiveTaskId(null);

    showMessage("All tasks in this plan were cleared.", "info");
  }

  function updateStudyTime(value) {
    if (value < 1) return;

    setStudyTime(value);
    setTaskTimerMinutes(value);

    if (!isRunning) {
      setSecondsLeft(value * 60);
    }
  }

  function updateBreakTime(value) {
    if (value < 1) return;
    setBreakTime(value);
  }

  function startTaskTimer(taskId, timerMinutes) {
    setActiveTaskId(taskId);
    setSecondsLeft(timerMinutes * 60);
    setIsRunning(true);
    showMessage("Focus timer started for this task.", "success");
  }

  function pauseTimer() {
    setIsRunning(false);
    showMessage("Timer paused.", "info");
  }

  function resetTimer() {
    setIsRunning(false);

    const activeTask = selectedPlanTasks.find((item) => item.id === activeTaskId);

    if (activeTask) {
      setSecondsLeft(activeTask.timerMinutes * 60);
    } else {
      setSecondsLeft(studyTime * 60);
    }

    showMessage("Timer was reset.", "info");
  }

  useEffect(() => {
    let timerId;

    if (isRunning && secondsLeft > 0) {
      timerId = setInterval(() => {
        setSecondsLeft((previousSeconds) => previousSeconds - 1);
      }, 1000);
    }

    if (isRunning && secondsLeft === 0) {
      setIsRunning(false);
      showMessage("Study session completed. Time for a break!", "success");
    }

    return () => clearInterval(timerId);
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("studyBuddyCurrentUser"));

    if (savedUser) {
      const savedPlans =
        JSON.parse(localStorage.getItem(`studyBuddyPlans_${savedUser.email}`)) ||
        [];

      setCurrentUser(savedUser);
      setPlans(savedPlans);
      setSelectedPlanId(savedPlans.length > 0 ? savedPlans[0].id : null);

      if (savedPlans.length > 0) {
        setSubject(savedPlans[0].title);
      }
    }
  }, []);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
  const selectedPlanTasks = selectedPlan ? selectedPlan.tasks : [];

  const selectedPlanSubtasks = selectedPlanTasks.flatMap(
    (item) => item.subtasks
  );

  const allTasks = plans.flatMap((plan) => plan.tasks);
  const allSubtasks = allTasks.flatMap((item) => item.subtasks);

  const completedTasks = selectedPlanTasks.filter(
    (item) => item.completed
  ).length;

  const completedSubtasks = selectedPlanSubtasks.filter(
    (subtask) => subtask.completed
  ).length;

  const selectedTotalItems =
    selectedPlanTasks.length + selectedPlanSubtasks.length;

  const selectedCompletedItems = completedTasks + completedSubtasks;

  const totalCompletedTasks = allTasks.filter((item) => item.completed).length;
  const totalCompletedSubtasks = allSubtasks.filter(
    (subtask) => subtask.completed
  ).length;

  const progress =
    selectedTotalItems === 0
      ? 0
      : Math.round((selectedCompletedItems / selectedTotalItems) * 100);

  const highPriorityTasks = allTasks.filter(
    (item) => item.priority === "High" && !item.completed
  ).length;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;

  if (!currentUser) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="badge">Student Productivity App</p>

          <h1>{authMode === "login" ? "Welcome Back" : "Create Account"}</h1>

          <p className="muted">
            StudyBuddy helps students create study plans, manage tasks, and stay
            focused with study timers.
          </p>

          {authMode === "register" && (
            <>
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
              />
            </>
          )}

          <label>Email Address</label>
          <input
            type="email"
            placeholder="student@gmail.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {authMode === "register" && (
            <>
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />

              <p className="password-rules">
                Password must include at least 8 characters, uppercase,
                lowercase, and a number.
              </p>
            </>
          )}

          {authMode === "login" ? (
            <button className="full-btn" onClick={loginUser}>
              Login
            </button>
          ) : (
            <button className="full-btn" onClick={registerUser}>
              Register
            </button>
          )}

          <button
            className="link-btn"
            onClick={() => {
              setAuthMode(authMode === "login" ? "register" : "login");
              setMessage("");
              clearAuthForm();
            }}
          >
            {authMode === "login"
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>

          {message && <p className={`message ${messageType}`}>{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="dashboard">
        <header className="header">
          <div>
            <p className="badge">Study Session Dashboard</p>
            <h1>Hello, {currentUser.name} 👋</h1>
            <p>Organize your plans, tasks, subtasks, focus time, and progress.</p>
          </div>

          <button className="delete-btn" onClick={logoutUser}>
            Logout
          </button>
        </header>

        <section className="summary-row">
          <div className="summary-card">
            <h3>{plans.length}</h3>
            <p>Study Plans</p>
          </div>

          <div className="summary-card">
            <h3>{allTasks.length}</h3>
            <p>Total Tasks</p>
          </div>

          <div className="summary-card">
            <h3>{totalCompletedTasks + totalCompletedSubtasks}</h3>
            <p>Completed Items</p>
          </div>

          <div className="summary-card warning">
            <h3>{highPriorityTasks}</h3>
            <p>High Priority Left</p>
          </div>
        </section>

        {message && <p className={`message ${messageType}`}>{message}</p>}

        <section className="grid">
          <div className="card">
            <h2>Create Study Plan</h2>

            <label>Plan Title</label>
            <input
              type="text"
              value={planTitle}
              onChange={(event) => setPlanTitle(event.target.value)}
              placeholder="Example: Software Engineering Final Project"
            />

            <label>Short Description</label>
            <input
              type="text"
              value={planDescription}
              onChange={(event) => setPlanDescription(event.target.value)}
              placeholder="Example: Finish UI, testing, and documentation"
            />

            <button onClick={createPlan}>Create Study Plan</button>
          </div>

          <div className="card">
            <h2>Your Study Plans</h2>

            {plans.length === 0 ? (
              <p className="empty">No study plans yet.</p>
            ) : (
              <ul className="task-list">
                {plans.map((plan) => (
                  <li
                    key={plan.id}
                    className={
                      selectedPlanId === plan.id ? "selected-plan" : ""
                    }
                  >
                    <div>
                      <span onClick={() => openPlan(plan.id)}>
                        {selectedPlanId === plan.id ? "✓ " : ""}
                        {plan.title}
                      </span>

                      <p className="task-subject">{plan.description}</p>
                      <p className="task-subject">
                        {plan.tasks.length}{" "}
                        {plan.tasks.length === 1 ? "task" : "tasks"} • Created{" "}
                        {plan.createdAt}
                      </p>
                    </div>

                    <div className="plan-actions">
                      <button
                        className="small-btn"
                        onClick={() => openPlan(plan.id)}
                      >
                        Open
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deletePlan(plan.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h2>
              Add Task{" "}
              {selectedPlan ? (
                <span className="small-text">for {selectedPlan.title}</span>
              ) : (
                ""
              )}
            </h2>

            {!selectedPlan && (
              <p className="empty">
                Create or open a study plan before adding tasks.
              </p>
            )}

            <label>Subject</label>
            <input
              type="text"
              placeholder="Example: Software Engineering"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              disabled={!selectedPlan}
            />

            <label>Task</label>
            <input
              type="text"
              placeholder="Example: Finish final project"
              value={task}
              onChange={(event) => setTask(event.target.value)}
              disabled={!selectedPlan}
            />

            <label>Priority</label>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              disabled={!selectedPlan}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <div className="time-row">
              <div>
                <label>Task Focus Time</label>
                <input
                  type="number"
                  min="1"
                  value={taskTimerMinutes}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (value < 1) return;
                    setTaskTimerMinutes(value);
                  }}
                  disabled={!selectedPlan}
                />
              </div>

              <div>
                <label>Break Time</label>
                <input
                  type="number"
                  min="1"
                  value={breakTime}
                  onChange={(event) =>
                    updateBreakTime(Number(event.target.value))
                  }
                />
              </div>
            </div>

            <button onClick={addTask} disabled={!selectedPlan}>
              Add Task
            </button>
          </div>

          <div className="card">
            <div className="card-title-row">
              <h2>
                Task Checklist{" "}
                {selectedPlan ? (
                  <span className="small-text">for {selectedPlan.title}</span>
                ) : (
                  ""
                )}
              </h2>

              {selectedPlanTasks.length > 0 && (
                <button className="small-btn" onClick={clearAllTasks}>
                  Clear All
                </button>
              )}
            </div>

            <p className="hint small-hint">
              Open a study plan, then click a task or subtask to mark it as
              completed.
            </p>

            {!selectedPlan ? (
              <p className="empty">No study plan selected.</p>
            ) : selectedPlanTasks.length === 0 ? (
              <p className="empty">No tasks added in this plan yet.</p>
            ) : (
              <ul className="task-list">
                {selectedPlanTasks.map((item) => (
                  <li key={item.id} className="task-with-subtasks">
                    <div className="task-main-content">
                      <span
                        className={item.completed ? "completed" : ""}
                        onClick={() => toggleTask(item.id)}
                      >
                        {item.completed ? "✓ " : "○ "}
                        {item.text}
                      </span>

                      <p className="task-subject">{item.subject}</p>

                      <p className={`priority ${item.priority.toLowerCase()}`}>
                        {item.priority} priority
                      </p>

                      <div className="subtask-box">
                        <div className="subtask-header">
                          <strong>Subtasks</strong>

                          <button
                            className="small-btn"
                            onClick={() => {
                              setActiveSubtaskTaskId(
                                activeSubtaskTaskId === item.id ? null : item.id
                              );
                              setSubtaskText("");
                            }}
                          >
                            {activeSubtaskTaskId === item.id
                              ? "Close"
                              : "+ Add Subtask"}
                          </button>
                        </div>

                        {item.subtasks.length === 0 ? (
                          <p className="empty small-empty">No subtasks yet.</p>
                        ) : (
                          <div className="subtask-list">
                            {item.subtasks.map((subtask) => (
                              <div
                                key={subtask.id}
                                className={
                                  subtask.completed
                                    ? "subtask completed"
                                    : "subtask"
                                }
                              >
                                <span
                                  onClick={() =>
                                    toggleSubtask(item.id, subtask.id)
                                  }
                                >
                                  {subtask.completed ? "✓" : "○"}{" "}
                                  {subtask.text}
                                </span>

                                <button
                                  className="mini-delete"
                                  onClick={() =>
                                    deleteSubtask(item.id, subtask.id)
                                  }
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {activeSubtaskTaskId === item.id && (
                          <div className="subtask-input-row">
                            <input
                              type="text"
                              value={subtaskText}
                              onChange={(event) =>
                                setSubtaskText(event.target.value)
                              }
                              placeholder="Example: Write introduction"
                            />

                            <button onClick={() => addSubtask(item.id)}>
                              Save
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="task-timer-box">
                        <div>
                          <strong>Task Timer</strong>
                          <p className="task-subject">
                            Focus time: {item.timerMinutes || studyTime} minutes
                          </p>
                        </div>

                        {activeTaskId === item.id ? (
                          <>
                            <div className="small-timer">{formattedTime}</div>

                            <div className="timer-buttons">
                              <button onClick={() => setIsRunning(true)}>
                                Start
                              </button>

                              <button
                                className="secondary-btn"
                                onClick={pauseTimer}
                              >
                                Pause
                              </button>

                              <button
                                className="delete-btn"
                                onClick={resetTimer}
                              >
                                Reset
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            onClick={() =>
                              startTaskTimer(
                                item.id,
                                item.timerMinutes || studyTime
                              )
                            }
                          >
                            Start Timer
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      className="delete-btn"
                      onClick={() => deleteTask(item.id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h2>
              Progress{" "}
              {selectedPlan ? (
                <span className="small-text">for {selectedPlan.title}</span>
              ) : (
                ""
              )}
            </h2>

            {!selectedPlan ? (
              <p className="empty">Open a study plan to track progress.</p>
            ) : (
              <>
                <p>
                  {selectedCompletedItems} out of {selectedTotalItems} tasks and
                  subtasks completed
                </p>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <h3>{progress}%</h3>

                {selectedTotalItems === 0 && (
                  <p className="empty">
                    Add tasks and subtasks to this plan to start tracking
                    progress.
                  </p>
                )}

                {selectedTotalItems > 0 && progress === 100 && (
                  <p className="success">
                    Great job! Everything in this plan is completed.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="card">
            <h2>Focus Timer</h2>

            <p>
              <strong>Current Plan:</strong>{" "}
              {selectedPlan ? selectedPlan.title : "Not selected yet"}
            </p>

            <p>
              <strong>Subject:</strong>{" "}
              {subject.trim() === "" ? "Not selected yet" : subject}
            </p>

            <div className="timer">{formattedTime}</div>

            <div className="timer-buttons">
              <button
                onClick={() => {
                  if (activeTaskId) {
                    setIsRunning(true);
                  } else {
                    showMessage("Start a timer from a task first.", "error");
                  }
                }}
              >
                Start
              </button>

              <button className="secondary-btn" onClick={pauseTimer}>
                Pause
              </button>

              <button className="delete-btn" onClick={resetTimer}>
                Reset
              </button>
            </div>

            <p className="hint">
              Start a timer from a specific task. Break time is {breakTime}{" "}
              minutes.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;