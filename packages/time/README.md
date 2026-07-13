# @bitcode/time

Time utility functions for the Bitcode platform. Provides time range parsing, duration formatting, and human-readable time calculations.

## Core Functions

- **parseTimeRange()**: Convert time range strings to milliseconds
- **formatDuration()**: Convert milliseconds to human-readable format
- **getElapsedTime()**: Calculate elapsed time from date
- **timeAgo()**: Human-readable relative time ("5 minutes ago")
- **timeUntil()**: Compact countdown to future date

## Time Range Parsing

```typescript
import { parseTimeRange, TIME } from '@bitcode/time';

// Parse time range strings
const oneYear = parseTimeRange('1y'); // 365 * 24 * 60 * 60 * 1000
const twoMonths = parseTimeRange('2m'); // 2 * 30 * 24 * 60 * 60 * 1000
const threeWeeks = parseTimeRange('3w'); // 3 * 7 * 24 * 60 * 60 * 1000
const fourDays = parseTimeRange('4d'); // 4 * 24 * 60 * 60 * 1000

// Time constants
const oneHour = TIME.HOUR; // 60 * 60 * 1000
const oneDay = TIME.DAY; // 24 * 60 * 60 * 1000
```

## Duration Formatting

```typescript
import { formatDuration, getElapsedTime } from '@bitcode/time';

// Format durations
const duration = formatDuration(7890000); // "2h 11m 30s"

// Calculate elapsed time
const startTime = new Date('2023-01-01');
const elapsed = getElapsedTime(startTime);
const formatted = formatDuration(elapsed);
```

## Human-Readable Times

```typescript
import { timeAgo, timeUntil } from '@bitcode/time';

// Relative time from now
const created = timeAgo(new Date('2023-12-01')); // "2 months ago"

// Countdown to future date
const expires = timeUntil(new Date('2024-06-01')); // "3d 4h" or "Expired"
```

## Architecture

Built on `date-fns` for reliable date calculations. Provides consistent time handling across the Bitcode platform with support for various time formats and human-readable output.
