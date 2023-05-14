import { api } from './api.js';
import {
  ApiType,
  FailedTaskError,
  TaskStatus,
  TaskType,
  TrackerStatus,
} from './constants.js';
import { getErrorMessage } from './errors.js';
import { downloads } from './strings.js';

interface Tracker {
  peers: number;
  seeds: number;
  status: TrackerStatus;
  update_timer: number;
  url: string;
}

interface Task {
  additional?: {
    tracker?: Tracker[];
  };
  id: string;
  size: number;
  status: TaskStatus;
  title: string;
  type: TaskType;
  username: string;
}

interface TaskListData {
  offset: number;
  task: Task[];
  total: number;
}

async function getTasks(): Promise<Task[]> {
  const { task } = await api<TaskListData>(
    {
      additional: 'tracker',
      api: ApiType.Task,
      method: 'list',
      version: '2',
    },
    'Fetching downloads',
    ({ message }) => `Error getting downloads: ${message}`
  );
  return task;
}

async function getUnregisteredTasks(): Promise<Task[]> {
  const tasks = await getTasks();
  return tasks.filter((task) =>
    task.additional?.tracker?.every((tracker) =>
      // Some trackers include a reason for delisting a torrent so just check
      // if the status starts with `TrackerStatus.Unregistered`.
      tracker.status.startsWith(TrackerStatus.Unregistered)
    )
  );
}

interface FailedTask {
  error: FailedTaskError;
  id: string;
}

interface DeleteTaskData {
  failed_task: FailedTask[];
}

async function deleteTasks(taskIds: string[]): Promise<FailedTask[]> {
  const { failed_task } = await api<DeleteTaskData>(
    {
      additional: 'tracker',
      api: ApiType.Task,
      id: JSON.stringify(taskIds),
      method: 'delete',
      version: '2',
    },
    'Deleting downloads',
    ({ message }) => `Error deleting downloads: ${message}`
  );
  return failed_task;
}

export async function listUnregisteredTasks() {
  const tasks = await getUnregisteredTasks();
  console.log(`${tasks.length} unregistered ${downloads(tasks.length)}`);
  for (const { title } of tasks) {
    console.log(title);
  }
}

export async function deleteUnregisteredTasks() {
  const tasks = await getUnregisteredTasks();

  if (tasks.length === 0) {
    console.log(`No unregistered ${downloads(tasks.length)}`);
    return;
  }

  const unregisteredTaskIds = tasks.map(({ id }) => id);
  const taskMap = new Map(tasks.map((task) => [task.id, task]));
  const statuses = await deleteTasks(unregisteredTaskIds);
  const succeeded: FailedTask[] = [];
  const failed: FailedTask[] = [];
  for (const status of statuses) {
    (status.error === FailedTaskError.Success ? succeeded : failed).push(
      status
    );
  }
  if (succeeded.length > 0) {
    console.log(`${succeeded.length} ${downloads(succeeded.length)} deleted:`);
    for (const { id } of succeeded) {
      const title = taskMap.get(id)?.title ?? id;
      console.log(`${title} deleted`);
    }
  }
  if (failed.length > 0) {
    console.log(
      `${failed.length} ${downloads(failed.length)} failed to be deleted:`
    );
    for (const { error, id } of failed) {
      const title = taskMap.get(id)?.title ?? id;
      console.log(
        `${title} not deleted: ${getErrorMessage(ApiType.Task, error)}`
      );
    }
  }
}
