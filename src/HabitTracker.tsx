// HabitTracker.tsx
import { JSX, useEffect, useState } from "react";
import "./HabitTracker.css";
import {
  getHabits,
  addHabitToDB,
  removeHabitFromDB,
  updateHabitHistory,
  pastWeekDates,
} from "./habit-service";
const { REACT_AWS_ACCESS_KEY } = process.env;

type Habit = {
  id: string;
  name: string;
  history: Record<string, boolean>;
};

console.log(REACT_AWS_ACCESS_KEY);

// const getPastWeekDates = (): string[] => {
//   const dates: string[] = [];
//   const today = new Date();
//   for (let i = 6; i >= 0; i--) {
//     const date = new Date();
//     date.setDate(today.getDate() - i);
//     dates.push(date.toISOString().split("T")[0]);
//   }
//   return dates;
// };

export default function HabitTracker(): JSX.Element {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState<string>("");
  const dates = pastWeekDates;

  useEffect(() => {
    const fetchHabits = async () => {
      const allHabits = await getHabits();
      setHabits(allHabits);
    };
    fetchHabits();
  }, []);

  const addHabit = async (): Promise<void> => {
    if (newHabit.trim() === "") return;
    const allDates = { [new Date().toISOString().split("T")[0]]: false };
    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit,
      history: allDates,
    };
    await addHabitToDB(habit);
    const newViewHabit = {
      ...habit,
      history: dates.reduce((acc, date) => ({ ...acc, [date]: false }), {}),
    };
    setHabits([...habits, newViewHabit]);
    setNewHabit("");
  };

  const removeHabit = async (id: string): Promise<void> => {
    await removeHabitFromDB(id);
    setHabits(habits.filter((habit) => habit.id !== id));
  };

  const toggleHabitDay = async (
    habitId: string,
    date: string,
  ): Promise<void> => {
    let habitStatus = false;
    const updatedHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        habitStatus = !habit.history[date];
        return {
          ...habit,
          history: {
            ...habit.history,
            [date]: !habit.history[date],
          },
        };
      }
      return habit;
    });

    await updateHabitHistory(habitId, date, habitStatus);
    setHabits(updatedHabits);
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
