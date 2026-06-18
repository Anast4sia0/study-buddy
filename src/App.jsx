import { useEffect, useState } from "react";
import "./index.css";

function App() {
  const [started, setStarted] = useState(false);

  const [subject, setSubject] = useState("");
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [tasks, setTasks] = useState([]);

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

  const completedTasks = tasks.filter((item) => item.completed).length;

  const progress =
    tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  const highPriorityTasks = tasks.filter(
    (item) => item.priority === "High" && !item.completed
  ).length;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;

  return (
    <div className="app">
      {!started ? (
        <section className="home">
          <div className="home-card">
            <p className="badge">Student Productivity App</p>
            <h1>StudyBuddy</h1>

            <p>
              Plan your study tasks, use a focus timer, and track your progress
              in one simple workspace.
            </p>

            <button onClick={() => setStarted(true)}>Start Planning</button>
          </div>
        </section>
      ) : (
        <main className="dashboard">
          <header className="header">
            <div>
              <p className="badge">Study Session Dashboard</p>
              <h1>StudyBuddy</h1>
              <p>Organize your tasks, stay focused, and finish your goals.</p>
            </div>

            <button className="secondary-btn" onClick={() => setStarted(false)}>
              Home
            </button>
          </header>

          <section className="summary-row">
            <div className="summary-card">
              <h3>{tasks.length}</h3>
              <p>Total Tasks</p>
            </div>

            <div className="summary-card">
              <h3>{completedTasks}</h3>
              <p>Completed</p>
            </div>

            <div className="summary-card">
              <h3>{progress}%</h3>
              <p>Progress</p>
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
      )}
    </div>
  );
}

export default App;