import { JSX, useState } from "react";
import "./HabitTracker.css";

type Habit = {
  readonly id: number;
  readonly name: string;
  readonly history: Record<string, boolean>;
};

const getPastWeekDates = (): string[] => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
};

export default function HabitTracker(): JSX.Element {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState<string>("");
  const dates = getPastWeekDates();

  const addHabit = (): void => {
    if (newHabit.trim() === "") return;
    const habit: Habit = {
      id: Date.now(),
      name: newHabit,
      history: dates.reduce((acc, date) => ({ ...acc, [date]: false }), {}),
    };
    setHabits([...habits, habit]);
    setNewHabit("");
  };

  const removeHabit = (id: number): void => {
    setHabits(habits.filter((habit) => habit.id !== id));
  };

  const toggleHabitDay = (habitId: number, date: string): void => {
    setHabits(
      habits.map((habit) => {
        if (habit.id === habitId) {
          return {
            ...habit,
            history: {
              ...habit.history,
              [date]: !habit.history[date],
            },
          };
        }
        return habit;
      }),
    );
  };

  return (
    <div className="container">
      <h1 className="title">Habit Tracker</h1>

      <div className="inputContainer">
        <input
          type="text"
          placeholder="Add a new habit"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          className="input"
        />
        <button onClick={addHabit} className="addButton">
          Add
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Habit</th>
            {dates.map((date) => (
              <th key={date}>{date.slice(5)}</th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {habits.map((habit) => (
            <tr key={habit.id}>
              <td>{habit.name}</td>
              {dates.map((date) => (
                <td key={date} className="checkboxCell">
                  <input
                    type="checkbox"
                    checked={habit.history[date] || false}
                    onChange={() => toggleHabitDay(habit.id, date)}
                  />
                </td>
              ))}
              <td>
                <button
                  onClick={() => removeHabit(habit.id)}
                  className="deleteButton"
                >
                  &#10005;
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
