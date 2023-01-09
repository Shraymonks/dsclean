# dsclean

Tool to remove unregistered download tasks in Synology Download Station.

An unregistered download task is a torrent where its tracker status is `Unregistered torrent`.

## Installation

Requires DSM 7 or later.

```console
$ npm install -g dsclean
```

## Usage

### Environment variables

The following environment variables must be set for the `dsclean` command:

| Variable | Description | Default/Required |
| --- | --- | --- |
| HOST | Host of the Synology NAS where Download Station is installed | `http://localhost:5000` |
| USERNAME | Username on `HOST` with appropriate Download Station permissions | Required |
| PASSWORD | Password for `USERNAME` | Required |

### `dsclean`

Lists all unregistered download tasks that `USERNAME` has access to on `HOST`.

```console
$ dsclean
2 unregistered downloads:
ubuntu-22.04.1-desktop-amd64.iso
ubuntu-22.10-desktop-amd64.iso
```

### `dsclean --delete`

Deletes all unregistered download tasks that `USERNAME` has access to on `HOST`.

```console
$ dsclean --delete
2 downloads deleted:
ubuntu-22.04.1-desktop-amd64.iso deleted
ubuntu-22.10-desktop-amd64.iso deleted
```
