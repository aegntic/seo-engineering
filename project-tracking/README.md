# SEO.engineering Task Tracking System

This directory contains the Model Context Protocol (MCP) for SEO.engineering task tracking. The system provides a single source of truth for project status while maintaining compatibility with distributed development workflows.

## Architecture Overview

```
project-tracking/
├── README.md                      # System documentation
├── CURRENT_STATE.md               # Single source of truth (auto-generated)
├── modules/                       # Module-specific tracking
│   ├── analysis-engine.md         # Analysis Engine module tasks
│   ├── automation.md              # Automation module tasks
│   ├── competitive-analysis.md    # Competitive Analysis module tasks
│   ├── agency-scaling.md          # Agency Scaling module tasks
│   └── api-integration.md         # API Integration module tasks
├── metadata/                      # Project metadata
│   ├── contributors.md            # Team members and roles
│   ├── dependencies.md            # Inter-module dependencies
│   └── milestones.md              # Major project milestones
└── scripts/                       # Maintenance scripts
    ├── update-state.sh            # Generate CURRENT_STATE.md
    └── validate-integrity.sh      # Verify consistency
```

## Core Principles

1. **Single Source of Truth**: `CURRENT_STATE.md` is the canonical representation of project state.
2. **Modular Decomposition**: Tasks are organized by module for targeted updates.
3. **Structural Consistency**: All task definitions follow uniform syntax and metadata.
4. **Temporal Integrity**: Each task update preserves timestamp and change history.
5. **Dependency Mapping**: Inter-task dependencies are explicitly defined.

## Task Definition Syntax

Each task follows this structured format:

```markdown
## [TASK-ID] Task Name

- **Status**: [NOT_STARTED|IN_PROGRESS|COMPLETED|BLOCKED]
- **Priority**: [CRITICAL|HIGH|MEDIUM|LOW]
- **Estimate**: Xh
- **Assigned**: Team name
- **Dependencies**: [TASK-ID, TASK-ID, ...]
- **Last Updated**: YYYY-MM-DD HH:MM
- **Completion**: YYYY-MM-DD (if completed)
- **Module**: Module name

### Description
Task description goes here.

### Acceptance Criteria
- Criterion 1
- Criterion 2

### Implementation Notes
- Note 1
- Note 2
```

## State Generation Protocol

The `CURRENT_STATE.md` file is regenerated whenever module files are updated, using the `update-state.sh` script. This ensures consistency while enabling distributed editing of module-specific files.
