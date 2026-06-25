import { useEffect, useMemo, useState } from "react";
import "./index.css";
//state variables
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [currentPage, setCurrentPage] = useState("home");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const [planTitle, setPlanTitle] = useState("");
  const [planDescription, setPlanDescription] = useState("");

  const [taskText, setTaskText] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [taskTimerMinutes, setTaskTimerMinutes] = useState(25);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [activeSubtaskForm, setActiveSubtaskForm] = useState(null);
  const [subtaskInputs, setSubtaskInputs] = useState({});

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [defaultStudyTime, setDefaultStudyTime] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);

  const [theme, setTheme] = useState("light");
  //authentication
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
    const userExists = users.find((user) => user.email === email);

    if (userExists) {
      showMessage("User with this email already exists.", "error");
      return;
    }

    const newUser = {
      name: name.trim(),
      email: email.trim(),
      password,
      joinedAt: new Date().toLocaleDateString(),
    };

    const updatedUsers = [...users, newUser];

    localStorage.setItem("studyBuddyUsers", JSON.stringify(updatedUsers));
    localStorage.setItem("studyBuddyCurrentUser", JSON.stringify(newUser));

    setCurrentUser(newUser);
    setCurrentPage("home");

    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

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
      (user) => user.email === email && user.password === password
    );

    if (!foundUser) {
      showMessage("Incorrect email or password.", "error");
      return;
    }

    const savedPlans =
      JSON.parse(localStorage.getItem(`studyBuddyPlans_${foundUser.email}`)) ||
      [];

    const savedSettings = JSON.parse(
      localStorage.getItem(`studyBuddySettings_${foundUser.email}`)
    );

    setCurrentUser(foundUser);
    setPlans(savedPlans);
    setSelectedPlanId(savedPlans.length > 0 ? savedPlans[0].id : null);
    setCurrentPage("home");

    if (savedSettings) {
      setTheme(savedSettings.theme || "light");
      setDefaultStudyTime(savedSettings.defaultStudyTime || 25);
      setTaskTimerMinutes(savedSettings.defaultStudyTime || 25);
      setSecondsLeft((savedSettings.defaultStudyTime || 25) * 60);
    }

    localStorage.setItem("studyBuddyCurrentUser", JSON.stringify(foundUser));

    setEmail("");
    setPassword("");
    setConfirmPassword("");

    showMessage("Login successful.", "success");
  }

  function logoutUser() {
    setCurrentUser(null);
    setPlans([]);
    setSelectedPlanId(null);
    setCurrentPage("home");
    setIsRunning(false);
    setActiveTaskId(null);
    localStorage.removeItem("studyBuddyCurrentUser");
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
  //local Storage
  function saveSettings(updatedTheme, updatedTime) {
    if (!currentUser) return;

    localStorage.setItem(
      `studyBuddySettings_${currentUser.email}`,
      JSON.stringify({
        theme: updatedTheme,
        defaultStudyTime: updatedTime,
      })
    );
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
    setPlanTitle("");
    setPlanDescription("");
    setCurrentPage("planDetails");

    showMessage("Study plan created successfully.", "success");
  }

  function openPlan(planId) {
    setSelectedPlanId(planId);
    setCurrentPage("planDetails");
    setShowTaskForm(false);
    setActiveSubtaskForm(null);
  }

  function deletePlan(id) {
    const updatedPlans = plans.filter((plan) => plan.id !== id);

    savePlans(updatedPlans);

    if (selectedPlanId === id) {
      setSelectedPlanId(updatedPlans.length > 0 ? updatedPlans[0].id : null);
      setCurrentPage("home");
    }

    showMessage("Study plan deleted.", "info");
  }
  //task management
  function addTask() {
    if (!selectedPlanId) {
      showMessage("Please select a study plan first.", "error");
      return;
    }

    if (taskText.trim() === "") {
      showMessage("Please enter a task title.", "error");
      return;
    }

    const newTask = {
      id: Date.now(),
      text: taskText.trim(),
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

    setTaskText("");
    setPriority("Medium");
    setTaskTimerMinutes(defaultStudyTime);
    setShowTaskForm(false);

    showMessage("Task added successfully.", "success");
  }

  function toggleTask(taskId) {
    const updatedPlans = plans.map((plan) =>
      plan.id === selectedPlanId
        ? {
            ...plan,
            tasks: plan.tasks.map((task) =>
              task.id === taskId
                ? { ...task, completed: !task.completed }
                : task
            ),
          }
        : plan
    );

    savePlans(updatedPlans);
  }

  function deleteTask(taskId) {
    const updatedPlans = plans.map((plan) =>
      plan.id === selectedPlanId
        ? {
            ...plan,
            tasks: plan.tasks.filter((task) => task.id !== taskId),
          }
        : plan
    );

    savePlans(updatedPlans);

    if (activeTaskId === taskId) {
      setIsRunning(false);
      setActiveTaskId(null);
      setSecondsLeft(defaultStudyTime * 60);
    }

    showMessage("Task deleted.", "info");
  }

  function addSubtask(taskId) {
    const value = subtaskInputs[taskId];

    if (!value || value.trim() === "") {
      showMessage("Please enter a subtask.", "error");
      return;
    }

    const newSubtask = {
      id: Date.now(),
      text: value.trim(),
      completed: false,
    };

    const updatedPlans = plans.map((plan) =>
      plan.id === selectedPlanId
        ? {
            ...plan,
            tasks: plan.tasks.map((task) =>
              task.id === taskId
                ? { ...task, subtasks: [...task.subtasks, newSubtask] }
                : task
            ),
          }
        : plan
    );

    savePlans(updatedPlans);

    setSubtaskInputs({ ...subtaskInputs, [taskId]: "" });
    setActiveSubtaskForm(null);

    showMessage("Subtask added.", "success");
  }
  //subtask management
  function toggleSubtask(taskId, subtaskId) {
    const updatedPlans = plans.map((plan) =>
      plan.id === selectedPlanId
        ? {
            ...plan,
            tasks: plan.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    subtasks: task.subtasks.map((subtask) =>
                      subtask.id === subtaskId
                        ? { ...subtask, completed: !subtask.completed }
                        : subtask
                    ),
                  }
                : task
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
            tasks: plan.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    subtasks: task.subtasks.filter(
                      (subtask) => subtask.id !== subtaskId
                    ),
                  }
                : task
            ),
          }
        : plan
    );

    savePlans(updatedPlans);
    showMessage("Subtask deleted.", "info");
  }
  //timer Settings
  function startTaskTimer(taskId, timerMinutes) {
    setActiveTaskId(taskId);
    setSecondsLeft(timerMinutes * 60);
    setIsRunning(true);
    showMessage("Focus timer started for this task.", "success");
  }

  function pauseTimer() {
    setIsRunning(false);
  }

  function resetTimer() {
    setIsRunning(false);

    const activeTask = allTasks.find((task) => task.id === activeTaskId);

    if (activeTask) {
      setSecondsLeft(activeTask.timerMinutes * 60);
    } else {
      setSecondsLeft(defaultStudyTime * 60);
    }

    showMessage("Timer reset.", "info");
  }

  function resetAllData() {
    savePlans([]);
    setSelectedPlanId(null);
    setCurrentPage("home");
    setIsRunning(false);
    setActiveTaskId(null);
    setSecondsLeft(defaultStudyTime * 60);
    showMessage("All study data was reset.", "info");
  }
  //react effects
  useEffect(() => {
    let timer;

    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((previous) => previous - 1);
      }, 1000);
    }

    if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      showMessage("Focus session completed. Take a short break!", "success");
    }

    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("studyBuddyCurrentUser"));

    if (savedUser) {
      const savedPlans =
        JSON.parse(localStorage.getItem(`studyBuddyPlans_${savedUser.email}`)) ||
        [];

      const savedSettings = JSON.parse(
        localStorage.getItem(`studyBuddySettings_${savedUser.email}`)
      );

      setCurrentUser(savedUser);
      setPlans(savedPlans);
      setSelectedPlanId(savedPlans.length > 0 ? savedPlans[0].id : null);

      if (savedSettings) {
        setTheme(savedSettings.theme || "light");
        setDefaultStudyTime(savedSettings.defaultStudyTime || 25);
        setTaskTimerMinutes(savedSettings.defaultStudyTime || 25);
        setSecondsLeft((savedSettings.defaultStudyTime || 25) * 60);
      }
    }
  }, []);
  //statistics and Progress
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

  const allTasks = useMemo(() => {
    return plans.flatMap((plan) => plan.tasks);
  }, [plans]);

  const selectedPlanTasks = selectedPlan ? selectedPlan.tasks : [];
  const selectedPlanSubtasks = selectedPlanTasks.flatMap(
    (task) => task.subtasks
  );

  const selectedCompletedTasks = selectedPlanTasks.filter(
    (task) => task.completed
  ).length;

  const selectedCompletedSubtasks = selectedPlanSubtasks.filter(
    (subtask) => subtask.completed
  ).length;

  const selectedTotalItems =
    selectedPlanTasks.length + selectedPlanSubtasks.length;

  const selectedCompletedItems =
    selectedCompletedTasks + selectedCompletedSubtasks;

  const selectedProgress =
    selectedTotalItems === 0
      ? 0
      : Math.round((selectedCompletedItems / selectedTotalItems) * 100);

  const completedTasks = allTasks.filter((task) => task.completed).length;

  const highPriorityTasks = allTasks.filter(
    (task) => task.priority === "High" && !task.completed
  ).length;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
//main dashboard
  if (!currentUser) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="badge">Student Productivity App</p>

          <h1>{authMode === "login" ? "Welcome Back" : "Create Account"}</h1>

          <p className="muted">
            StudyBuddy helps students create study plans, manage tasks, and stay
            focused with task-based timers.
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
    <div className={`app ${theme}`}>
      <aside className="sidebar">
        <div>
          <div className="logo-box">
            <div className="logo">SB</div>

            <div>
              <h2>StudyBuddy</h2>
              <p className="sidebar-user">{currentUser.name}</p>
            </div>
          </div>

          <nav>
            <button
              className={currentPage === "home" ? "nav-active" : ""}
              onClick={() => setCurrentPage("home")}
            >
              Home
            </button>

            <button
              className={currentPage === "createPlan" ? "nav-active" : ""}
              onClick={() => setCurrentPage("createPlan")}
            >
              Create Plan
            </button>

            <button
              className={currentPage === "profile" ? "nav-active" : ""}
              onClick={() => setCurrentPage("profile")}
            >
              Profile
            </button>

            <button
              className={currentPage === "settings" ? "nav-active" : ""}
              onClick={() => setCurrentPage("settings")}
            >
              Settings
            </button>
          </nav>
        </div>

        <button className="logout-btn" onClick={logoutUser}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        {message && <p className={`message floating ${messageType}`}>{message}</p>}

        {currentPage === "home" && (
          <>
            <header className="page-header">
              <p className="badge">Home</p>
              <h1>Hello, {currentUser.name} 👋</h1>
              <p className="muted">
                Here you can see your study plans. Open a plan to view tasks,
                use timers, or edit details.
              </p>
            </header>

            <section className="summary-grid">
              <div className="summary-card">
                <h3>{plans.length}</h3>
                <p>Study Plans</p>
              </div>

              <div className="summary-card">
                <h3>{allTasks.length}</h3>
                <p>Total Tasks</p>
              </div>

              <div className="summary-card">
                <h3>{completedTasks}</h3>
                <p>Completed Tasks</p>
              </div>

              <div className="summary-card warning">
                <h3>{highPriorityTasks}</h3>
                <p>High Priority Left</p>
              </div>
            </section>

            <section className="card">
              <div className="card-title-row">
                <div>
                  <h2>Your Study Plans</h2>
                  <p className="muted">
                    Choose a plan to open it. Creating and editing are separated
                    to keep the interface clean.
                  </p>
                </div>

                <button onClick={() => setCurrentPage("createPlan")}>
                  + New Plan
                </button>
              </div>

              {plans.length === 0 ? (
                <div className="empty-state">
                  <h3>No study plans yet</h3>
                  <p>
                    Create your first plan for a subject, exam, or project.
                  </p>

                  <button onClick={() => setCurrentPage("createPlan")}>
                    Create Study Plan
                  </button>
                </div>
              ) : (
                <div className="plan-card-grid">
                  {plans.map((plan) => {
                    const planTasks = plan.tasks;
                    const planSubtasks = planTasks.flatMap(
                      (task) => task.subtasks
                    );

                    const planTotal = planTasks.length + planSubtasks.length;

                    const planCompleted =
                      planTasks.filter((task) => task.completed).length +
                      planSubtasks.filter((subtask) => subtask.completed)
                        .length;

                    const planProgress =
                      planTotal === 0
                        ? 0
                        : Math.round((planCompleted / planTotal) * 100);

                    return (
                      <div key={plan.id} className="plan-preview-card">
                        <div>
                          <p className="mini-badge">Study Plan</p>
                          <h3>{plan.title}</h3>
                          <p className="muted small-text">
                            {plan.description}
                          </p>
                        </div>

                        <div className="mini-progress">
                          <div className="mini-progress-top">
                            <span>Progress</span>
                            <strong>{planProgress}%</strong>
                          </div>

                          <div className="progress-bar small-progress">
                            <div
                              className="progress-fill"
                              style={{ width: `${planProgress}%` }}
                            ></div>
                          </div>
                        </div>

                        <p className="muted small-text">
                          {plan.tasks.length}{" "}
                          {plan.tasks.length === 1 ? "task" : "tasks"} •
                          Created {plan.createdAt}
                        </p>

                        <div className="plan-card-actions">
                          <button onClick={() => openPlan(plan.id)}>
                            Open Plan
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => deletePlan(plan.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {currentPage === "createPlan" && (
          <>
            <header className="page-header">
              <p className="badge">Create Plan</p>
              <h1>Create a new study plan</h1>
              <p className="muted">
                This page is only for creating a plan, so the rest of the app
                does not feel like it is always in edit mode.
              </p>
            </header>

            <section className="card create-plan-card">
              <h2>Plan Information</h2>

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
                placeholder="Example: Finish UI, documentation, and presentation"
              />

              <button onClick={createPlan}>Create Study Plan</button>
            </section>
          </>
        )}

        {currentPage === "planDetails" && selectedPlan && (
          <>
            <header className="page-header plan-detail-header">
              <div>
                <p className="badge">Plan Details</p>
                <h1>{selectedPlan.title}</h1>
                <p className="muted">{selectedPlan.description}</p>
              </div>

              <button className="secondary-btn" onClick={() => setCurrentPage("home")}>
                Back to Home
              </button>
            </header>

            <section className="card progress-card">
              <div className="card-title-row">
                <div>
                  <h2>Plan Progress</h2>
                  <p className="muted">
                    {selectedCompletedItems} out of {selectedTotalItems} tasks
                    and subtasks completed.
                  </p>
                </div>

                <h2 className="progress-percent">{selectedProgress}%</h2>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${selectedProgress}%` }}
                ></div>
              </div>
            </section>

            <section className="card">
              <div className="card-title-row">
                <div>
                  <h2>Tasks</h2>
                  <p className="muted">
                    Tasks are shown in view mode first. Editing options appear
                    only when you need them.
                  </p>
                </div>

                <button onClick={() => setShowTaskForm(!showTaskForm)}>
                  {showTaskForm ? "Close" : "+ Add Task"}
                </button>
              </div>

              {showTaskForm && (
                <div className="task-form inline-task-form">
                  <label>Task Title</label>
                  <input
                    type="text"
                    value={taskText}
                    onChange={(event) => setTaskText(event.target.value)}
                    placeholder="Example: Improve homepage design"
                  />

                  <div className="form-grid">
                    <div>
                      <label>Priority</label>
                      <select
                        value={priority}
                        onChange={(event) => setPriority(event.target.value)}
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>

                    <div>
                      <label>Timer Minutes</label>
                      <input
                        type="number"
                        min="1"
                        value={taskTimerMinutes}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          if (value < 1) return;
                          setTaskTimerMinutes(value);
                        }}
                      />
                    </div>
                  </div>

                  <button onClick={addTask}>Save Task</button>
                </div>
              )}

              {selectedPlan.tasks.length === 0 ? (
                <p className="empty">
                  This plan has no tasks yet. Click “Add Task” when you are
                  ready to add one.
                </p>
              ) : (
                <div className="task-cards">
                  {selectedPlan.tasks.map((task) => (
                    <div key={task.id} className="task-card">
                      <div className="task-top">
                        <div>
                          <h3
                            className={task.completed ? "completed" : ""}
                            onClick={() => toggleTask(task.id)}
                          >
                            {task.completed ? "✓ " : "○ "}
                            {task.text}
                          </h3>

                          <p className={`priority ${task.priority.toLowerCase()}`}>
                            {task.priority} priority
                          </p>
                        </div>

                        <div className="task-actions">
                          <button
                            className="secondary-btn"
                            onClick={() =>
                              setActiveSubtaskForm(
                                activeSubtaskForm === task.id ? null : task.id
                              )
                            }
                          >
                            {activeSubtaskForm === task.id
                              ? "Close"
                              : "+ Add Subtask"}
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => deleteTask(task.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="subtask-box view-subtasks">
                        <h4>Subtasks</h4>

                        {task.subtasks.length === 0 ? (
                          <p className="empty small-text">No subtasks yet.</p>
                        ) : (
                          task.subtasks.map((subtask) => (
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
                                  toggleSubtask(task.id, subtask.id)
                                }
                              >
                                {subtask.completed ? "✓" : "○"} {subtask.text}
                              </span>

                              <button
                                className="mini-delete"
                                onClick={() =>
                                  deleteSubtask(task.id, subtask.id)
                                }
                              >
                                ×
                              </button>
                            </div>
                          ))
                        )}

                        {activeSubtaskForm === task.id && (
                          <div className="subtask-input-row hidden-edit-row">
                            <input
                              type="text"
                              value={subtaskInputs[task.id] || ""}
                              onChange={(event) =>
                                setSubtaskInputs({
                                  ...subtaskInputs,
                                  [task.id]: event.target.value,
                                })
                              }
                              placeholder="Add a small step"
                            />

                            <button onClick={() => addSubtask(task.id)}>
                              Save
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="timer-box">
                        <div>
                          <h4>Task Timer</h4>
                          <p className="muted small-text">
                            Focus time: {task.timerMinutes} minutes
                          </p>
                        </div>

                        {activeTaskId === task.id ? (
                          <>
                            <div className="timer">
                              {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                            </div>

                            <div className="timer-buttons">
                              <button onClick={() => setIsRunning(true)}>
                                Start
                              </button>

                              <button className="secondary-btn" onClick={pauseTimer}>
                                Pause
                              </button>

                              <button className="delete-btn" onClick={resetTimer}>
                                Reset
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            onClick={() =>
                              startTaskTimer(task.id, task.timerMinutes)
                            }
                          >
                            Start Timer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {currentPage === "profile" && (
          <>
            <header className="page-header">
              <p className="badge">Profile</p>
              <h1>Your Account</h1>
              <p className="muted">
                This page contains user information and simple account
                statistics.
              </p>
            </header>

            <section className="card profile-card">
              <div className="profile-avatar">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>

              <h2>{currentUser.name}</h2>
              <p className="muted">{currentUser.email}</p>

              <div className="stats-grid">
                <div className="stat-card">
                  <h3>{plans.length}</h3>
                  <p>Study Plans</p>
                </div>

                <div className="stat-card">
                  <h3>{allTasks.length}</h3>
                  <p>Total Tasks</p>
                </div>

                <div className="stat-card">
                  <h3>{completedTasks}</h3>
                  <p>Completed Tasks</p>
                </div>
              </div>

              <div className="profile-info">
                <p>
                  <strong>Account type:</strong> Student
                </p>

                <p>
                  <strong>Joined:</strong> {currentUser.joinedAt || "Recently"}
                </p>

                <p>
                  <strong>Application:</strong> StudyBuddy
                </p>

                <p>
                  <strong>Main purpose:</strong> Study planning and focus
                  management
                </p>
              </div>
            </section>
          </>
        )}

        {currentPage === "settings" && (
          <>
            <header className="page-header">
              <p className="badge">Settings</p>
              <h1>Customize StudyBuddy</h1>
              <p className="muted">
                Change appearance, timer settings, or reset your study data.
              </p>
            </header>

            <section className="settings-grid">
              <div className="card">
                <h2>Appearance</h2>

                <label>Theme</label>
                <select
                  value={theme}
                  onChange={(event) => {
                    setTheme(event.target.value);
                    saveSettings(event.target.value, defaultStudyTime);
                  }}
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>

              <div className="card">
                <h2>Timer Settings</h2>

                <label>Default Focus Time for New Tasks</label>
                <input
                  type="number"
                  min="1"
                  value={defaultStudyTime}
                  onChange={(event) => {
                    const value = Number(event.target.value);

                    if (value < 1) return;

                    setDefaultStudyTime(value);
                    setTaskTimerMinutes(value);

                    if (!isRunning) {
                      setSecondsLeft(value * 60);
                    }

                    saveSettings(theme, value);
                  }}
                />
              </div>

              <div className="card danger-card">
                <h2>Reset Data</h2>
                <p className="muted">
                  This deletes all study plans, tasks, and subtasks.
                </p>

                <button className="delete-btn" onClick={resetAllData}>
                  Reset All Study Data
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;