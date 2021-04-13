# Machine manager

## Setup

You need to build the compilers in `compilers` using the build scripts.

Then execute `./setup` to start a cron job that executes `periodic-task` periodically (every minute).  The cron job can be stopped
by executing `crontab -r`.
