import ora from 'ora';
import { ApiType } from './constants.js';
import { getErrorMessage } from './errors.js';

const { HOST = 'http://localhost:5000', PASSWORD, USERNAME } = process.env;
const BASE = `${HOST}/webapi/entry.cgi`;

let loginPromise: ReturnType<typeof login> | null = null;
let sid = '';

export const spinner = ora();

export async function apiFetch<T = Response>(
  options: Record<string, string>
): Promise<T> {
  const url = new URL(BASE);
  url.search = new URLSearchParams(options).toString();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Error with ${options['method']} request to ${HOST}: ${response.status} ${response.statusText}`
    );
  }
  return (await response.json()) as T;
}

interface BaseError {
  error: {
    code: number;
    errors?: unknown;
  };
  success: false;
}

interface BaseSuccess {
  data: unknown;
  success: true;
}

export type Response<Success = BaseSuccess> =
  | (BaseSuccess & Success)
  | BaseError;

interface LoginSuccess {
  data: {
    account: string;
    device_id: string;
    ik_message: string;
    is_portal_port: boolean;
    sid: string;
    synotoken: string;
  };
}
type LoginResponse = Response<LoginSuccess>;

async function login(): Promise<void> {
  if (!USERNAME) {
    throw new Error('Must set USERNAME environment variable.');
  }
  if (!PASSWORD) {
    throw new Error('Must set PASSWORD environment variable.');
  }
  spinner.start('Authenticating');
  const response = await apiFetch<LoginResponse>({
    account: USERNAME,
    api: ApiType.Auth,
    format: 'sid',
    method: 'login',
    passwd: PASSWORD,
    version: '7',
  });
  if (response.success === false) {
    throw new Error(
      `Error logging in ${USERNAME}@${HOST}: ${getErrorMessage(
        ApiType.Auth,
        response.error.code
      )}`
    );
  }
  sid = response.data.sid;
  spinner.stop();
}

export async function api<T>(
  options: Record<string, string>,
  loadingMessage?: string
): Promise<T> {
  if (!loginPromise) {
    loginPromise = login();
  }
  await loginPromise;
  const apiPromise = apiFetch<T>({
    ...options,
    _sid: sid,
  });
  if (loadingMessage) {
    spinner.start(loadingMessage);
    await apiPromise;
    spinner.stop();
  }
  return apiPromise;
}

export async function logout(): Promise<Response | undefined> {
  if (!loginPromise) {
    return;
  }
  const response = await api<Response>({
    api: ApiType.Auth,
    method: 'logout',
    version: '7',
  });
  if (response.success === false) {
    throw new Error(
      `Error logging out ${USERNAME}@${HOST}: ${getErrorMessage(
        ApiType.Auth,
        response.error.code
      )}`
    );
  }
  loginPromise = null;
  return response;
}
