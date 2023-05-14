import ora from 'ora';
import { ApiType } from './constants.js';
import { getErrorMessage } from './errors.js';

const { HOST = 'http://localhost:5000', PASSWORD, USERNAME } = process.env;
const BASE = `${HOST}/webapi/entry.cgi`;

let loginPromise: ReturnType<typeof login> | null = null;
let sid = '';

export const spinner = ora();

interface ApiOptions {
  [key: string]: string;
  api: ApiType;
  method: string;
  version: string;
}

interface ErrorParams {
  code: number;
  message: string;
}

export async function apiFetch<Data>(
  options: ApiOptions,
  loadingMessage: string,
  formatError: (error: ErrorParams) => string
): Promise<Data> {
  spinner.start(loadingMessage);
  const url = new URL(BASE);
  url.search = new URLSearchParams(options).toString();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Error with ${options.method} request to ${HOST}: ${response.status} ${response.statusText}`
    );
  }
  const json = (await response.json()) as ApiResponse<Data>;
  if (!json.success) {
    throw new Error(
      formatError({
        code: json.error.code,
        message: getErrorMessage(options.api, json.error.code),
      })
    );
  }
  spinner.stop();
  return json.data;
}

interface ApiError {
  error: {
    code: number;
    errors?: unknown;
  };
  success: false;
}

interface ApiSuccess<Data> {
  data: Data;
  success: true;
}

type ApiResponse<Data> = ApiSuccess<Data> | ApiError;

interface LoginData {
  account: string;
  device_id: string;
  ik_message: string;
  is_portal_port: boolean;
  sid: string;
  synotoken: string;
}
async function login(): Promise<void> {
  if (!USERNAME) {
    throw new Error('Must set USERNAME environment variable.');
  }
  if (!PASSWORD) {
    throw new Error('Must set PASSWORD environment variable.');
  }
  spinner.start('Authenticating');
  const data = await apiFetch<LoginData>(
    {
      account: USERNAME,
      api: ApiType.Auth,
      format: 'sid',
      method: 'login',
      passwd: PASSWORD,
      version: '7',
    },
    'Authenticating',
    ({ message }) => `Error logging in ${USERNAME}@${HOST}: ${message}`
  );
  sid = data.sid;
  spinner.stop();
}

export async function api<Data = undefined>(
  options: ApiOptions,
  loadingMessage: string,
  formatError: (error: ErrorParams) => string
): Promise<Data> {
  if (!loginPromise) {
    loginPromise = login();
  }
  await loginPromise;
  const data = await apiFetch<Data>(
    {
      ...options,
      _sid: sid,
    },
    loadingMessage,
    formatError
  );
  return data;
}

export async function logout(): Promise<void> {
  if (!loginPromise) {
    return;
  }
  await api(
    {
      api: ApiType.Auth,
      method: 'logout',
      version: '7',
    },
    'Logging out',
    ({ message }) => `Error logging out ${USERNAME}@${HOST}: ${message}`
  );
  loginPromise = null;
}
