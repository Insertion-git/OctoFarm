# Changelog

All notable changes to this project will be documented in this file.

## [Released]

## [1.1.0 - BETA] - 12/03/2020

### Added

- Converted to server, database and client package
- Uses websocket for real time information from your octoprint instances
- Uses Server Side Events to keep the OctoFarm web client up to date with what your Server is tracking.
- History section which will
- Filament Manager to track what's on your printer and what you used on a print stored in history
- Brand new file manager with multi upload and queue features.
- Current Operations window configurable to be viewable on any of the monitoring screens as well as it's home on the dashboard.
- Login system, first user created become Admin. (for a future release).
- System information to see the current load of the server OctoFarm runs on.
- Farm Information which will show some grouped farm information about your current jobs.
- Famm Statistics which will give you a quick overview on your farm.
- Print Statistitcs which will collate the history page into some fancy metrics.
- Added Terminal output to interface.

### Changed

- Updated with a brand new Dashboard to include some of the above.
- Revamped monitoring views, all have been neatened.
- Revamped Printer manager accessible from all views: - remembering your printer connection settings - Merged control/tune/file manager tab. - As above, this is where the terminal lives.

### Removed

    - All of version 1.0... this is brand new!

### Deprecated

- Wallpaper can no longer be changed (to be fixed in future release)
- Camera view is currently locked... (to be fixed in a future release)

Nothing else from 1.0 I believe

### Fixed

- Camera rotation not sticking with double click enlarge.

## [Unreleased Template]

## [1.1.3 - BETA :: includes 1.1.1 + 1.1.2] - 13/03/2020

### Added

- Updated to async JSON.stringify implentation to alleviate any further stringify issues.
- 2 Docker installation options:
  https://hub.docker.com/r/thetinkerdad/octofarm - Big thanks to youtuber TheTinkerDad for creating and managing this one.
  https://hub.docker.com/repository/docker/octofarm/octofarm - Thanks to user Knoker for the help and PR with this.

### Changed

- Nothing

### Removed

- Nothing

### Deprecated

- Nothing

### Fixed

- Issue #1 - Panel View wasn't respecting the Hide Closed client setting
- Issue regarding octoprint (I believe, need to test further and reproduce) missing sending temperature data for history
- Cured the memory issue by sending malformed and large objects through JSON.parse

### Security

## [Unreleased Template]

## [] - TBA

### Added

### Changed

### Removed

### Deprecated

### Fixed

### Security
