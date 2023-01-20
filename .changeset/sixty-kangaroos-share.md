---
'dsclean': patch
---

Improve check condition for unregistered downloads.

Some trackers include a reason for delisting a torrent so just check if the status starts with 'Unregistered torrent'.
