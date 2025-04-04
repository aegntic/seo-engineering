# SEOAutomate Data Flow Diagrams

This document provides visual representations of the data flows between SEOAutomate modules, highlighting the specific integration points and communication patterns.

## Primary System Data Flow

```mermaid
graph TD
    CW[Client Website] --> |HTTP/HTTPS Requests| CM[Crawler Module]
    CM --> |Raw Site Data| DB[(Database)]
    CM --> |Crawl Results| AE[Analysis Engine]
    AE --> |Analysis Results| DB
    AE --> |Issues & Fix Strategies| IM[Implementation Module]
    IM --> |Git Operations| GI[Git Integration]
    GI --> |Repository Changes| CW
    IM --> |Implementation Results| DB
    IM --> |Applied Fixes| VS[Verification System]
    VS --> |Verification Results| DB
    VS --> |Performance Metrics| CD[Client Dashboard]
    CD --> |User Actions| CM
    CD --> |Approvals/Rejections| IM
    CD --> |UI Data| DB
    
    subgraph Data Stores
        DB
        GI
    end
    
    subgraph User Interfaces
        CD
    end
    
    subgraph Core Processing
        CM
        AE
        IM
        VS
    end
```

## Message Queue Communication Flow

```mermaid
graph LR
    CM[Crawler Module] --> |Publishes Events| MQ[Message Queue]
    AE[Analysis Engine] --> |Publishes Events| MQ
    IM[Implementation Module] --> |Publishes Events| MQ
    VS[Verification System] --> |Publishes Events| MQ
    CD[Client Dashboard] --> |Publishes Commands| MQ
    
    MQ --> |Crawl Events| AE
    MQ --> |Analysis Events| IM
    MQ --> |Implementation Events| VS
    MQ --> |Verification Events| CD
    MQ --> |User Commands| CM
    MQ --> |User Commands| IM
    
    subgraph Asynchronous Communication
        MQ
    end
    
    subgraph Producers
        CM
        AE
        IM
        VS
        CD
    end
    
    subgraph Consumers
        CM
        AE
        IM
        VS
        CD
    end
```

## API Integration Map

```mermaid
graph TD
    API[API Gateway] --> CM_API[Crawler API]
    API --> AE_API[Analysis API]
    API --> IM_API[Implementation API]
    API --> VS_API[Verification API]
    API --> CD_API[Dashboard API]
    API --> GI_API[Git API]
    
    CM_API --> CM[Crawler Module]
    AE_API --> AE[Analysis Engine]
    IM_API --> IM[Implementation Module]
    VS_API --> VS[Verification System]
    CD_API --> CD[Client Dashboard]
    GI_API --> GI[Git Integration]
    
    AUTH[Authentication] --> API
    
    subgraph API Layer
        API
        CM_API
        AE_API
        IM_API
        VS_API
        CD_API
        GI_API
    end
    
    subgraph Security Layer
        AUTH
    end
    
    subgraph Implementation Layer
        CM
        AE
        IM
        VS
        CD
        GI
    end
```

## Database Entity Relationships

```mermaid
erDiagram
    User ||--o{ Site : owns
    Site ||--o{ CrawlResult : has
    Site ||--o{ AnalysisResult : has
    Site ||--o{ ImplementationResult : has
    Site ||--o{ VerificationResult : has
    
    CrawlResult ||--o{ Page : contains
    CrawlResult ||--o{ Asset : contains
    CrawlResult ||--o{ Error : contains
    
    AnalysisResult ||--o{ Issue : contains
    Issue ||--o{ FixStrategy : has
    
    ImplementationResult ||--o{ Fix : contains
    Fix ||--o| Issue : resolves
    Fix ||--o| GitCommit : tracked_by
    
    VerificationResult ||--o{ Verification : contains
    Verification ||--o| Fix : verifies
    Verification ||--o{ Regression : detects
    Verification ||--o| Impact : measures
```

## Complete Process Workflow

```mermaid
sequenceDiagram
    participant CD as Client Dashboard
    participant CM as Crawler Module
    participant AE as Analysis Engine
    participant IM as Implementation Module
    participant GI as Git Integration
    participant VS as Verification System
    participant DB as Database
    participant MQ as Message Queue
    
    CD->>MQ: Request Scan (site_id)
    MQ->>CM: scan_requested event
    CM->>DB: Get site configuration
    CM->>CM: Execute Playwright crawl
    CM->>DB: Store crawl results
    CM->>MQ: crawl_completed event
    MQ->>AE: crawl_completed event
    AE->>DB: Retrieve crawl results
    AE->>AE: Analyze issues
    AE->>AE: Determine fix strategies
    AE->>DB: Store analysis results
    AE->>MQ: analysis_completed event
    MQ->>CD: Update dashboard (WebSocket)
    CD->>CD: Show pending approvals
    CD->>MQ: fixes_approved event
    MQ->>IM: fixes_approved event
    IM->>DB: Retrieve fix strategies
    IM->>GI: Create change batch
    IM->>IM: Apply fixes
    IM->>GI: Record changes
    IM->>GI: Commit changes
    IM->>DB: Store implementation results
    IM->>MQ: implementation_completed event
    MQ->>VS: implementation_completed event
    VS->>DB: Retrieve implementation details
    VS->>VS: Verify fixes
    VS->>VS: Measure impact
    VS->>VS: Check for regressions
    VS->>DB: Store verification results
    VS->>MQ: verification_completed event
    MQ->>CD: Update dashboard (WebSocket)
    CD->>CD: Show final results
```

## Data Transformation Flow

```mermaid
graph TD
    RawHTML[Raw HTML] --> |Parsing| PageData[Structured Page Data]
    PageData --> |Analysis| IssueList[SEO Issues]
    IssueList --> |Prioritization| PriorityIssues[Prioritized Issues]
    PriorityIssues --> |Fix Strategy Selection| FixStrategies[Fix Strategies]
    FixStrategies --> |Implementation| FixResults[Applied Fixes]
    FixResults --> |Verification| VerificationResults[Verification Results]
    VerificationResults --> |Reporting| Dashboard[Dashboard Visualizations]
    
    subgraph "Crawler Module Processing"
        RawHTML
        PageData
    end
    
    subgraph "Analysis Engine Processing"
        IssueList
        PriorityIssues
        FixStrategies
    end
    
    subgraph "Implementation Module Processing"
        FixResults
    end
    
    subgraph "Verification System Processing"
        VerificationResults
    end
    
    subgraph "Client Dashboard Processing"
        Dashboard
    end
```

## Security and Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant CD as Client Dashboard
    participant Auth as Auth Service
    participant API as API Gateway
    participant IM as Implementation Module
    participant GI as Git Integration
    
    User->>CD: Login Request
    CD->>Auth: Authenticate (credentials)
    Auth->>Auth: Validate credentials
    Auth->>CD: Return JWT Token
    CD->>CD: Store token
    User->>CD: Request Fix Approval
    CD->>API: POST /fixes/approve (token)
    API->>Auth: Validate token & permissions
    Auth->>API: Token valid
    API->>IM: Forward approved fixes
    IM->>GI: Create Git changes
    GI->>GI: Apply changes to repo
    GI->>IM: Return change results
    IM->>API: Return implementation status
    API->>CD: Return API response
    CD->>User: Show success message
```

This document complements the Module Integration Points documentation by providing visual representations of the data flows, making it easier to understand the complex interactions between system components.
