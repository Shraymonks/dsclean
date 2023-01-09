import { ApiType } from './constants.js';

const COMMON_ERRORS = new Map([
  [100, 'Unknown error'],
  [101, 'No parameter of API, method or version'],
  [102, 'The requested API does not exist'],
  [103, 'The requested method does not exist'],
  [104, 'The requested version does not support the functionality'],
  [105, 'The logged in session does not have permission'],
  [106, 'Session timeout'],
  [107, 'Session interrupted by duplicated login'],
  [108, 'Failed to upload the file'],
  [109, 'The network connection is unstable or the system is busy'],
  [110, 'The network connection is unstable or the system is busy'],
  [111, 'The network connection is unstable or the system is busy'],
  [114, 'Lost parameters for this API'],
  [115, 'Not allowed to upload a file'],
  [116, 'Not allowed to perform for a demo site'],
  [117, 'The network connection is unstable or the system is busy'],
  [118, 'The network connection is unstable or the system is busy'],
  [119, 'Invalid session'],
  [150, 'Request source IP does not match the login IP'],
]);

const ERRORS = new Map([
  [
    ApiType.Auth,
    new Map([
      [400, 'No such account or incorrect password'],
      [401, 'Disabled account'],
      [402, 'Denied permission'],
      [403, '2-factor authentication code required'],
      [404, 'Failed to authenticate 2-factor authentication code'],
      [406, 'Enforce to authenticate with 2-factor authentication code'],
      [407, 'Blocked IP source'],
      [408, 'Expired password cannot change'],
      [409, 'Expired password'],
      [410, 'Password must be changed'],
    ]),
  ],
  [
    ApiType.Task,
    new Map([
      [400, 'File upload failed'],
      [401, 'Max number of tasks reached'],
      [402, 'Destination denied'],
      [403, 'Destination does not exist'],
      [404, 'Invalid task id'],
      [405, 'Invalid task action'],
      [406, 'No default destination'],
      [407, 'Set destination failed'],
      [408, 'File does not exist'],
    ]),
  ],
]);

export function getErrorMessage(type: ApiType, code: number): string {
  return (
    ERRORS.get(type)?.get(code) ?? COMMON_ERRORS.get(code) ?? `error ${code}`
  );
}
