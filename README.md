# timely-util

Utilities to help with Timely data management.

> Currently, this solution only helps to upload entries in bulk

## Prerequisite Installations

* Nodejs (Tested with `v16.11.0`)
* Chrome

## Getting started

```sh
# Intall node packages
npm install
```

## Bulk Time Entry Insertion

Author a file, `my_time.csv` in this directory.

The fields required are: `day,project_id,label_ids,hours,minutes,notes,billable`.

* A scrubbed example file has been included.
* For each time entry, you'll need to locate the project_id and label_ids.  You can
do so by interacting with Timely in the web browser and inspecting the network traffic
in the browser dev tools.  Relevant requests are `fetch` requests with a url ending
with `.json`.
* Additional fields can be added, if needed.  This utility simply passes through
any provided files as json props.


```sh
# Run the script
node .
```



A Chrome window will open.  This script needs to scrape cookies for auth purposes.
As a result, it will wait for up to 5 minutes for you to login, upload the time entries,
and close the browser window.
