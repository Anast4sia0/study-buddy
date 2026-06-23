import { useEffect, useState } from "react";
import "./index.css";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [subject, setSubject] = useState("");
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [tasks, setTasks] = useState([]);

  const [plans, setPlans] = useState([]);
  const [planTitle, setPlanTitle] = useState("");
  const [planDescription, setPlanDescription] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [studyTime, setStudyTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

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
    clearAuthForm();

    showMessage("Login successful.", "success");
  }

  function logoutUser() {
    setCurrentUser(null);
    setPlans([]);
    setTasks([]);
    setSubject("");
    setTask("");
    setPriority("Medium");
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
    };

    const updatedPlans = [...plans, newPlan];

    savePlans(updatedPlans);

    setPlanTitle("");
    setPlanDescription("");

    showMessage("Study plan created successfully.", "success");
  }

  function deletePlan(id) {
    const updatedPlans = plans.filter((plan) => plan.id !== id);
    savePlans(updatedPlans);

    showMessage("Study plan deleted.", "info");
  }

  function addTask() {
    if (subject.trim() === "") {
      showMessage("Please enter a subject first.", "error");
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
      completed: false,
      createdAt: new Date().toLocaleDateString(),
    };

    setTasks([...tasks, newTask]);
    setTask("");
    setPriority("Medium");

    showMessage("Task added successfully.", "success");
  }

  function toggleTask(id) {
    const updatedTasks = tasks.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );

    setTasks(updatedTasks);
  }

  function deleteTask(id) {
    const updatedTasks = tasks.filter((item) => item.id !== id);
    setTasks(updatedTasks);

    showMessage("Task deleted.", "info");
  }

  function clearAllTasks() {
    setTasks([]);
    setIsRunning(false);
    setSecondsLeft(studyTime * 60);

    showMessage("All tasks were cleared.", "info");
  }

  function updateStudyTime(value) {
    if (value < 1) return;

    setStudyTime(value);

    if (!isRunning) {
      setSecondsLeft(value * 60);
    }
  }

  function updateBreakTime(value) {
    if (value < 1) return;
    setBreakTime(value);
  }

  function startTimer() {
    if (tasks.length === 0) {
      showMessage("Please add at least one task before starting.", "error");
      return;
    }

    setIsRunning(true);
    showMessage("Focus session started.", "success");
  }

  function pauseTimer() {
    setIsRunning(false);
    showMessage("Timer paused.", "info");
  }

  function resetTimer() {
    setIsRunning(false);
    setSecondsLeft(studyTime * 60);

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
    }
  }, []);

  const completedTasks = tasks.filter((item) => item.completed).length;

  const progress =
    tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  const highPriorityTasks = tasks.filter(
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
            <p>Organize your plans, tasks, focus time, and progress.</p>
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
            <h3>{tasks.length}</h3>
            <p>Total Tasks</p>
          </div>

          <div className="summary-card">
            <h3>{completedTasks}</h3>
            <p>Completed</p>
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
                  <li key={plan.id}>
                    <div>
                      <span>{plan.title}</span>
                      <p className="task-subject">{plan.description}</p>
                      <p className="task-subject">Created {plan.createdAt}</p>
                    </div>

                    <button
                      className="delete-btn"
                      onClick={() => deletePlan(plan.id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h2>Add Task</h2>

            <label>Subject</label>
            <input
              type="text"
              placeholder="Example: Software Engineering"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />

            <label>Task</label>
            <input
              type="text"
              placeholder="Example: Finish final project"
              value={task}
              onChange={(event) => setTask(event.target.value)}
            />

            <label>Priority</label>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <div className="time-row">
              <div>
                <label>Study Time</label>
                <input
                  type="number"
                  min="1"
                  value={studyTime}
                  onChange={(event) =>
                    updateStudyTime(Number(event.target.value))
                  }
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

            <button onClick={addTask}>Add Task</button>
          </div>

          <div className="card">
            <div className="card-title-row">
              <h2>Task Checklist</h2>

              {tasks.length > 0 && (
                <button className="small-btn" onClick={clearAllTasks}>
                  Clear All
                </button>
              )}
            </div>

            <p className="hint small-hint">
              Click on a task to mark it as completed.
            </p>

            {tasks.length === 0 ? (
              <p className="empty">No tasks added yet.</p>
            ) : (
              <ul className="task-list">
                {tasks.map((item) => (
                  <li key={item.id}>
                    <div>
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
            <h2>Progress</h2>

            <p>
              {completedTasks} out of {tasks.length} tasks completed
            </p>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <h3>{progress}%</h3>

            {tasks.length === 0 && (
              <p className="empty">Add tasks to start tracking progress.</p>
            )}

            {tasks.length > 0 && progress === 100 && (
              <p className="success">Great job! All tasks are completed.</p>
            )}
          </div>

          <div className="card">
            <h2>Focus Timer</h2>

            <p>
              <strong>Subject:</strong>{" "}
              {subject.trim() === "" ? "Not selected yet" : subject}
            </p>

            <div className="timer">{formattedTime}</div>

            <div className="timer-buttons">
              <button onClick={startTimer}>Start</button>

              <button className="secondary-btn" onClick={pauseTimer}>
                Pause
              </button>

              <button className="delete-btn" onClick={resetTimer}>
                Reset
              </button>
            </div>

            <p className="hint">
              Study for {studyTime} minutes, then take a {breakTime}-minute
              break.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;