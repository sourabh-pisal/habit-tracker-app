import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  DeleteItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import { AWS_ACCESS_KEY, AWS_SECRET_KEY } from "./config";

const client = new DynamoDBClient({
  region: "eu-west-1",
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});
const tableName = "Habits";

export type Habit = {
  readonly id: string;
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

export const pastWeekDates = getPastWeekDates();

export async function getHabits(): Promise<Habit[]> {
  const command = new ScanCommand({ TableName: tableName });
  const response = await client.send(command);
  const habits = (response.Items || []).map(
    (item) => unmarshall(item) as Habit,
  );

  return habits.map((habit) => {
    return {
      ...habit,
      history: pastWeekDates.reduce(
        (acc, date) => {
          acc[date] = habit.history?.[date] || false;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    };
  });
}

export async function addHabitToDB(habit: Habit): Promise<void> {
  const command = new PutItemCommand({
    TableName: tableName,
    Item: marshall(habit),
  });
  await client.send(command);
}

export async function removeHabitFromDB(id: string): Promise<void> {
  const command = new DeleteItemCommand({
    TableName: tableName,
    Key: marshall({ id }),
  });
  await client.send(command);
}

export async function updateHabitHistory(
  habitId: string,
  date: string,
  habitStatus: boolean,
): Promise<void> {
  const command = new UpdateItemCommand({
    TableName: tableName,
    Key: marshall({ id: habitId }),
    UpdateExpression: "SET #history.#date = :habitStatus",
    ExpressionAttributeNames: {
      "#history": "history",
      "#date": date,
    },
    ExpressionAttributeValues: {
      ":habitStatus": { BOOL: habitStatus },
    },
  });
  await client.send(command);
}
