# TokenGuard - Architecture Diagrams

## 🏗️ **TokenGuard Service Architecture**

```mermaid
graph TB
    subgraph "Client Layer"
        Client[Client Applications]
        API[REST API Client]
        SDK[Python/JS SDK]
    end
    
    subgraph "TokenGuard Service (Port 8001)"
        Gateway[API Gateway]
        Router[Request Router]
        Optimizer[Token Optimizer]
        Pruner[Confidence Pruner]
        Chunker[Semantic Chunker]
        Cache[Response Cache]
        Monitor[Health Monitor]
    end
    
    subgraph "Core Processing Engine"
        LLMClient[LLM Client]
        ConfidenceEngine[Confidence Engine]
        CostCalculator[Cost Calculator]
        StrategyEngine[Strategy Engine]
    end
    
    subgraph "External Services"
        OpenAI[OpenAI API]
        Anthropic[Anthropic API]
        CustomLLM[Custom LLM APIs]
    end
    
    subgraph "Data Layer"
        Database[(PostgreSQL)]
        Redis[(Redis Cache)]
        Metrics[(Metrics Store)]
    end
    
    subgraph "Monitoring & Observability"
        Prometheus[Prometheus]
        Grafana[Grafana]
        Logs[Structured Logs]
    end
    
    %% Client connections
    Client --> API
    API --> SDK
    SDK --> Gateway
    
    %% Service internal flow
    Gateway --> Router
    Router --> Optimizer
    Optimizer --> Pruner
    Optimizer --> Chunker
    Optimizer --> Cache
    
    %% Core processing
    Pruner --> ConfidenceEngine
    Chunker --> StrategyEngine
    Optimizer --> LLMClient
    LLMClient --> CostCalculator
    
    %% External API connections
    LLMClient --> OpenAI
    LLMClient --> Anthropic
    LLMClient --> CustomLLM
    
    %% Data connections
    Optimizer --> Database
    Cache --> Redis
    Monitor --> Metrics
    
    %% Monitoring connections
    Gateway --> Prometheus
    Monitor --> Grafana
    Router --> Logs
    
    %% Styling
    classDef client fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef service fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef core fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef data fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef monitoring fill:#f1f8e9,stroke:#689f38,stroke-width:2px
    
    class Client,API,SDK client
    class Gateway,Router,Optimizer,Pruner,Chunker,Cache,Monitor service
    class LLMClient,ConfidenceEngine,CostCalculator,StrategyEngine core
    class OpenAI,Anthropic,CustomLLM external
    class Database,Redis,Metrics data
    class Prometheus,Grafana,Logs monitoring
```

## 🔄 **Token Optimization Flow**

```mermaid
sequenceDiagram
    participant Client
    participant Gateway
    participant Optimizer
    participant Pruner
    participant Chunker
    participant LLMClient
    participant Cache
    participant Database
    
    Client->>Gateway: POST /optimize
    Gateway->>Optimizer: Route optimization request
    
    Optimizer->>Cache: Check cache
    Cache-->>Optimizer: Cache miss
    
    Optimizer->>Pruner: Analyze confidence scores
    Pruner->>Database: Load confidence models
    Database-->>Pruner: Confidence data
    Pruner-->>Optimizer: Pruning recommendations
    
    Optimizer->>Chunker: Apply semantic chunking
    Chunker-->>Optimizer: Chunked content
    
    Optimizer->>LLMClient: Process optimized content
    LLMClient-->>Optimizer: LLM response
    
    Optimizer->>Cache: Store result
    Optimizer->>Database: Log optimization metrics
    
    Optimizer-->>Gateway: Optimized response
    Gateway-->>Client: Final result
    
    Note over Client,Database: Token savings: 25-40%<br/>Processing time: <500ms
```

## 🧠 **Confidence-Based Pruning Algorithm**

```mermaid
graph LR
    subgraph "Input Processing"
        Input[Input Text]
        Tokenizer[Tokenization]
        Confidence[Confidence Analysis]
    end
    
    subgraph "Pruning Engine"
        Threshold[Confidence Threshold]
        Pruner[Token Pruner]
        Validator[Output Validator]
    end
    
    subgraph "Output Generation"
        Optimized[Optimized Text]
        Metrics[Savings Metrics]
        Quality[Quality Score]
    end
    
    Input --> Tokenizer
    Tokenizer --> Confidence
    Confidence --> Threshold
    Threshold --> Pruner
    Pruner --> Validator
    Validator --> Optimized
    Validator --> Metrics
    Validator --> Quality
    
    classDef input fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef process fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef output fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    
    class Input,Tokenizer,Confidence input
    class Threshold,Pruner,Validator process
    class Optimized,Metrics,Quality output
```

## 📊 **Performance Monitoring Architecture**

```mermaid
graph TB
    subgraph "TokenGuard Service"
        Service[TokenGuard Service]
        Metrics[Metrics Collector]
        Health[Health Checker]
    end
    
    subgraph "Metrics Collection"
        Prometheus[Prometheus Server]
        AlertManager[Alert Manager]
        Rules[Alerting Rules]
    end
    
    subgraph "Visualization"
        Grafana[Grafana Dashboard]
        Charts[Performance Charts]
        Alerts[Alert Notifications]
    end
    
    subgraph "Key Metrics"
        RequestRate[Request Rate]
        ResponseTime[Response Time]
        TokenSavings[Token Savings]
        CacheHitRate[Cache Hit Rate]
        ErrorRate[Error Rate]
    end
    
    Service --> Metrics
    Service --> Health
    Metrics --> Prometheus
    Health --> Prometheus
    
    Prometheus --> AlertManager
    Prometheus --> Rules
    Prometheus --> Grafana
    
    Grafana --> Charts
    AlertManager --> Alerts
    
    Prometheus --> RequestRate
    Prometheus --> ResponseTime
    Prometheus --> TokenSavings
    Prometheus --> CacheHitRate
    Prometheus --> ErrorRate
    
    classDef service fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef metrics fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef viz fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef kpi fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    
    class Service,Metrics,Health service
    class Prometheus,AlertManager,Rules metrics
    class Grafana,Charts,Alerts viz
    class RequestRate,ResponseTime,TokenSavings,CacheHitRate,ErrorRate kpi
```

## 🔧 **Deployment Architecture**

```mermaid
graph TB
    subgraph "Development Environment"
        DevLocal[Local Development]
        DevDocker[Docker Compose]
        DevTests[Unit Tests]
    end
    
    subgraph "Staging Environment"
        StageK8s[Kubernetes Staging]
        StageTests[Integration Tests]
        StagePerf[Performance Tests]
    end
    
    subgraph "Production Environment"
        ProdK8s[Kubernetes Production]
        LoadBalancer[Load Balancer]
        AutoScale[Auto Scaling]
    end
    
    subgraph "Infrastructure"
        Docker[Docker Containers]
        K8s[Kubernetes Cluster]
        Cloud[Cloud Services]
        Monitoring[Monitoring Stack]
    end
    
    DevLocal --> DevDocker
    DevDocker --> DevTests
    DevTests --> StageK8s
    
    StageK8s --> StageTests
    StageTests --> StagePerf
    StagePerf --> ProdK8s
    
    ProdK8s --> LoadBalancer
    LoadBalancer --> AutoScale
    
    DevDocker --> Docker
    StageK8s --> K8s
    ProdK8s --> K8s
    K8s --> Cloud
    Cloud --> Monitoring
    
    classDef dev fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef stage fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef prod fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef infra fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    
    class DevLocal,DevDocker,DevTests dev
    class StageK8s,StageTests,StagePerf stage
    class ProdK8s,LoadBalancer,AutoScale prod
    class Docker,K8s,Cloud,Monitoring infra
```
