# MAGIC Web Application - Project Estimation Document

## Executive Summary

This document provides a **rough estimation** for replacing the existing Excel workbook (MAGIC_V1.2.4c) with a modern web-based application. Based on Excel analysis containing **1,056 formulas** across **11 worksheets** with **424 complex calculations (40.2%)**, this estimation outlines a focused MVP approach designed for delivery within **5 months**.

**Important Disclaimer**: This is a rough estimation. We cannot guarantee the effects or outcomes of this project.

**Preferred Contract Type**: Time & Material

**Key Recommendation**: **22 weeks (5.5 months)** with **302 person-days** and **5-person team**

---

## Excel Analysis Summary

Based on comprehensive analysis of the MAGIC_V1.2.4c Excel workbook (analyzed September 27, 2025):

### Formula Complexity Breakdown

| Complexity Level | Count | Percentage | Migration Effort                           |
| ---------------- | ----- | ---------- | ------------------------------------------ |
| **Simple**       | 329   | 31.2%      | Low risk - 1-2 person-days per 10 formulas |
| **Medium**       | 303   | 28.7%      | Medium risk - 0.5-1 person-day per formula |
| **Complex**      | 424   | 40.2%      | High risk - 1-2 person-days per formula    |

### Key Analysis Findings

- **11 worksheets** with varying complexity levels
- **24 unique Excel functions** including VLOOKUP (88 instances), IF (600 instances), IFERROR (291 instances)
- **Top formula-heavy sheets**: Input (301 formulas), Input_Detail (180 formulas), Output_Data (160 formulas)

### Migration Strategy Implications

The analysis reveals **significant complexity** (40.2% complex formulas), suggesting:

- **Risk management** required for complex formula migration
- **Phased implementation approach** strongly recommended
- **Buffer time** included for complex calculations
- **Thorough testing strategy** essential for formula accuracy validation

---

## Project Concept & Objectives

### Business Problem

The current Excel-based MAGIC tool requires replacement with a web-based solution that provides:

- Global accessibility and collaboration
- Structured workflow for input → calculation → output/reporting
- Integration with external systems (MGX, Mango, SAP)
- Better user experience and data validation
- Calculation of costs in manufacturer process and competitor comparison

### Solution Vision

A modern web application that replicates Excel functionality while providing:

- Step-by-step guided input wizards
- Real-time data integration from external systems
- Automated calculations matching Excel precision
- Professional PowerPoint export capabilities
- Cloud-based accessibility with enterprise security

---

## MVP Scope Definition

### ✅ **MVP Features (Phase 1) - 5 Months**

#### Core Functionality

- **Authentication System**: Azure AD integration with JWT validation
- **Input Wizards**: 4-step guided data collection process with session management
  - Step 1: Basic company/project information
  - Step 2: Process steps definition (current vs proposed) + competitor comparison
  - Step 3: Material properties and specifications + competitor comparison
  - Step 4: Review, calculate, export + competitor comparison
  - **Session Storage**: Auto-save progress, step recovery, validation persistence
- **Calculation Engine**: Migration of core Excel formulas (~200 critical formulas)
- **External Integrations**:
  - MGX system (REST API) - Customer and product master data
  - Mango database (direct connection) - Project references and historical data
  - SAP system (OData) - Material master, cost structures, exchange rates
- **Export Functionality**: PowerPoint generation with basic charts and tables
- **Save Capability**: One-time save after calculation completion

#### Technical Deliverables

- Responsive web application (desktop and tablet)
- RESTful API backend with session management
- Database for storing calculations and user sessions
- Cache layer for session storage and step recovery
- Integration services for external systems
- PowerPoint export service
- Session management and recovery system
- Basic monitoring and logging

### 🚫 **Excluded from MVP (Future Phases)**

#### Not in MVP

- **Project Management Features**:
  - Project listing and browsing
  - Edit/reload existing calculations
  - Project templates and duplicating
  - Version control and history
- **Advanced Reporting**:
  - Multiple export formats (PDF, Excel)
  - Custom report templates
  - Scheduled reporting
- **Dashboard & Analytics**:
  - Management dashboards
  - Usage analytics
  - Performance metrics
  - Historical trend analysis
- **Collaboration Features**:
  - Multi-user editing
  - Comments and approvals
  - Workflow management
- **Mobile Applications**: Native mobile apps
- **Advanced User Management**: Role-based permissions beyond basic admin/user

---

## Architecture Overview

### High-Level System Architecture

#### Infrastructure & Deployment Overview

```
                    PRIVATE SERVER VM (VMware)
    ┌──────────────────────────────────────────────────────┐
    │                Docker Containers                     │
    │                                                      │
    │  ┌─────────────┐    ┌─────────────┐                  │
    │  │ Reverse     │    │ Frontend    │                  │
    │  │ Proxy       │ ── │ App         │                  │
    │  │ Nginx       │    │ Vue.js SPA  │                  │
    │  │ Port:80/443 │ ┐  │ Port:80/443 │                  │
    │  └─────────────┘ │  └─────────────┘                  │
    │                  │                                   │
    │                  │  ┌─────────────┐                  │
    │                  └─ │ Backend API │                  │
    │                     │ NestJS      │                  │
    │                     │ Port: 3000  │                  │
    │                     └──────┬──────┘                  │
    │                            │                         │
    │  ┌─────────────┐           │         ┌─────────────┐ │
    │  │ Database    │ ───────── ┼──────── │ Cache       │ │
    │  │ PostgreSQL  │           │         │ Layer       │ │
    │  │ Port: 5432  │           │         │ Port: 6379  │ │
    │  └─────────────┘           │         └─────────────┘ │
    └────────────────────────────┼─────────────────────────┘
                                 │
                                 │ HTTPS/REST API
                                 ▼
    ┌──────────────────────────────────────────────────────┐
    │               External Systems                       │
    ├─────────────┬─────────────┬─────────────┬────────────┤
    │ MGX System  │ Mango DB    │ SAP ERP     │ Azure AD   │
    │ REST API    │ Direct SQL  │ OData       │ OAuth 2.0  │
    │ Port: 8080  │ Port: 1433  │ Port: 443   │ Port: 443  │
    └─────────────┴─────────────┴─────────────┴────────────┘
```

#### Detailed Application Architecture

```
                    Frontend Container
    ┌──────────────────────────────────────────────┐
    │            Presentation Layer                │
    │  ┌─────────────────┐ ┌─────────────────────┐ │
    │  │ Vue.js 3 SPA    │ │ Responsive UI       │ │
    │  │ TypeScript      │ │ PWA Ready           │ │
    │  │ i18n Support    │ │ Offline Capable     │ │
    │  └─────────────────┘ └─────────────────────┘ │
    └─────────────────┬────────────────────────────┘
                      │ HTTPS/REST API
                      ▼
                Backend Container
    ┌──────────────────────────────────────────────┐
    │              API Gateway Layer               │
    │  ┌─────────────────┐ ┌─────────────────────┐ │
    │  │ NestJS Gateway  │ │ Request Validation  │ │
    │  │ JWT Auth        │ │ Rate Limiting       │ │
    │  │ TypeScript      │ │ CORS & Security     │ │
    │  └─────────────────┘ └─────────────────────┘ │
    ├──────────────────────────────────────────────┤
    │             Business Logic Layer             │
    │  ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
    │  │ Wizard      │ │ Calculation │ │ Export  │ │
    │  │ Engine      │ │ Engine      │ │ Service │ │
    │  └─────────────┘ └─────────────┘ └─────────┘ │
    │  ┌─────────────────────────────────────────┐ │
    │  │        External Integration             │ │
    │  │     MGX • Mango • SAP • Azure AD        │ │
    │  └─────────────────────────────────────────┘ │
    ├──────────────────────────────────────────────┤
    │              Data Access Layer               │
    │  ┌─────────────────┐ ┌─────────────────────┐ │
    │  │ Kysely ORM      │ │ Connection Pool     │ │
    │  │ Type Safety     │ │ Health Checks       │ │
    │  │ Query Builder   │ │ Load Balancing      │ │
    │  └─────────────────┘ └─────────────────────┘ │
    └─────────────────┬───┬────────────────────────┘
                      │   │
          ┌───────────┘   └───────────┐
          ▼                           ▼
    ┌─────────────┐             ┌─────────────┐
    │ PostgreSQL  │             │ Cache Layer │
    │ Main DB     │             │ Session     │
    │ JSONB       │             │ Storage     │
    │ ACID        │             │ Performance │
    │ Port: 5432  │             │ Port: 6379  │
    └─────────────┘             └─────────────┘
```

### Wizard Architecture & State Management

#### Generic Wizard Framework with Session Storage

The wizard system is designed as a generic, step-dependent framework where each step builds upon previous data, with comprehensive session storage and recovery capabilities:

```
                    Wizard State Machine with Caching

    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │   Step 1    │ ── │   Step 2    │ ── │   Step 3    │ ── │   Step 4    │
    │ Basic Data  │ ►  │ Process +   │ ►  │ Material +  │ ►  │ Review &    │
    │ Collection  │    │ Competitor  │    │ Competitor  │    │ Calculate + │
    │             │    │ Comparison  │    │ Comparison  │    │ Competitor  │
    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
           │                  │                  │                  │
           ▼                  ▼                  ▼                  ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │ SESSION     │    │ SESSION     │    │ SESSION     │    │ SESSION     │
    │ CACHE       │    │ CACHE       │    │ CACHE       │    │ CACHE       │
    │ Step 1 Data │    │ Steps 1-2   │    │ Steps 1-3   │    │ All Steps   │
    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
           │                  │                  │                  │
           ▼                  ▼                  ▼                  ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │ • Company   │    │ • Uses      │    │ • Uses      │    │ • Uses All  │
    │ • Location  │    │   Step 1    │    │   Step 1    │    │   Previous  │
    │ • Project   │ ── │ • External  │ ── │ • Step 2    │ ── │   Steps     │
    │   ID        │    │   Data      │    │ • External  │    │ • Validation│
    │ • Currency  │    │   Fetch     │    │   Data      │    │ • Export    │
    │ • Units     │    │ • Process   │    │ • Material  │    │   Results   │
    │             │    │   Templates │    │   Rules     │    │ • Competitor│
    │             │    │ • Competitor│    │ • Competitor│    │   Analysis  │
    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

    Data Flow: Step 1 → Step 2 → Step 3 → Step 4 (each step builds on previous)
    Cache Flow: Browser Storage ↔ Cache Layer ↔ Database Persistence
```

#### Session Storage & Cache Architecture

```
                        Session Management Flow

    ┌─────────────────────────────────────────────────────────────────┐
    │                     Frontend (Vue.js)                           │
    │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
    │  │ Local Storage   │  │ Session Storage │  │ Vuex Store      │  │
    │  │ • User Prefs    │  │ • Current Step  │  │ • Wizard State  │  │
    │  │ • Form Drafts   │  │ • Form Data     │  │ • Validation    │  │
    │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
    └─────────────────┬───────────────────────────────────────────────┘
                      │ HTTPS API Calls
                      ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                     Backend (NestJS)                            │
    │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
    │  │ Session Service │  │ Wizard Manager  │  │ Cache Manager   │  │
    │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
    └─────────────────┬───────────────────┬───────────────────────────┘
                      │                   │
          ┌───────────▼───────────┐      ┌▼─────────────────┐
          │     Cache Layer       │      │   Database       │
          │ • Session Data        │      │ • Completed      │
          │ • Step Progress       │      │   Calculations   │
          │ • Form Recovery       │      │ • User Data      │
          └───────────────────────┘      └──────────────────┘
```

**Key Features**:

- **Auto-save**: Automatic progress saving at each step
- **Recovery**: Users can resume incomplete wizards
- **Multi-layer storage**: Browser, cache, and database persistence
- **Session management**: Secure session handling with timeout recovery

### Infrastructure & Deployment Architecture

#### Private Server VM Deployment

The application will be deployed on a **private VMware server environment** using **Docker containerization** for scalability, maintenance, and isolation.

#### Container Architecture

| Container    | Technology       | Purpose                          | Resources        |
| ------------ | ---------------- | -------------------------------- | ---------------- |
| **Frontend** | Vue.js 3 + Nginx | Static file serving, SPA routing | 1GB RAM, 1 CPU   |
| **Backend**  | NestJS + Node.js | API services, business logic     | 2GB RAM, 2 CPU   |
| **Database** | PostgreSQL 15    | Primary data storage             | 4GB RAM, 2 CPU   |
| **Cache**    | Cache Layer      | Session & performance cache      | 1GB RAM, 1 CPU   |
| **Proxy**    | Nginx/Traefik    | Load balancing, SSL termination  | 512MB RAM, 1 CPU |

#### Database Strategy

**Primary Database (PostgreSQL 15)**:

- Main application data storage
- JSONB support for complex calculation results
- ACID compliance for data integrity
- Automated backup and recovery
- Schema migrations and data management

**Cache Layer**:

- Session storage and recovery
- Performance optimization
- Temporary data management

#### External System Integration

**Network Architecture**:

- All external connections through secure HTTPS/TLS
- VPN or dedicated network connections for internal systems
- API gateway with authentication and rate limiting
- Circuit breaker patterns for external system failures

**Integration Points**:

- **MGX System**: RESTful API integration for customer/product data
- **Mango Database**: Direct SQL connection for project references
- **SAP System**: OData services for material master and cost data
- **Azure AD**: OAuth 2.0/JWT for user authentication

#### Security & Compliance

- **SSL/TLS encryption** for all communications
- **Container isolation** with minimal privileges
- **Network segmentation** between containers
- **Regular security updates** for base images
- **Backup strategy** with encrypted storage
- **Monitoring and logging** for security events

---

## Team Composition

### Core Development Team (5 people)

#### Technical Lead/Architect (1 person)

- **Responsibilities**: Architecture design, technical decisions, code reviews
- **Skills Required**: Full-stack experience, system architecture, team leadership
- **Time Allocation**: 12-15 days across project lifecycle

#### Frontend Developer (1 person)

- **Responsibilities**: Vue.js application, input wizards, user interface, i18n implementation
- **Skills Required**: Vue.js 3, TypeScript, responsive design, internationalization
- **Time Allocation**: 50-66 days (primary focus on wizard development)

#### Backend Developer (1 person)

- **Responsibilities**: NestJS API, calculation engine, external integrations
- **Skills Required**: NestJS, TypeScript, database design, API integrations
- **Time Allocation**: 65-89 days (calculation engine and integrations)

#### DevOps/Infrastructure Engineer (1 person)

- **Responsibilities**:
  - Docker containerization and orchestration
  - VMware server environment setup and configuration
  - CI/CD pipeline implementation
  - Database deployment and backup strategies
  - Security configuration and monitoring
  - Essential testing and deployment automation
- **Skills Required**:
  - Docker & Docker Compose
  - VMware infrastructure management
  - PostgreSQL & Redis administration
  - CI/CD tools (GitLab CI, Jenkins, or GitHub Actions)
  - Nginx/Traefik configuration
  - Basic security and monitoring tools
- **Time Allocation**: 14-18 days

#### Project Manager (1 person)

- **Responsibilities**: Project coordination, timeline management, stakeholder communication, risk management
- **Skills Required**: Project management, Agile/Scrum methodologies, stakeholder management
- **Time Allocation**: 20-25 days (throughout project lifecycle, part-time allocation)

### Supporting Roles

#### UX/UI Designer (Optional - External/Consultant)

- **Responsibilities**: Interface design, user experience optimization
- **Skills Required**: UI/UX design, responsive design principles
- **Time Allocation**: 5-10 days (design consultation, wireframes)
- **Engagement**: Part-time consultant or external agency
- **Deliverables**:
  - Wizard interface mockups
  - Design system guidelines
  - Responsive layout designs
  - User experience flow validation

#### Additional Supporting Roles (External/Part-time)

- **Technical Project Manager**: Coordination, stakeholder communication, **domain expertise support**
- **Business Analyst**: Requirements validation, user acceptance testing

#### **Required: Technical PM with Domain Knowledge**

- **Critical Need**: Technical Project Manager with deep understanding of manufacturing processes, cost calculation methodologies, and Excel-based workflow
- **Domain Support**: Help development team understand complex business logic, formula relationships, and industry-specific requirements
- **Time Allocation**: Throughout project lifecycle (20-30% capacity)
- **Key Responsibilities**: Domain knowledge transfer, business logic validation, stakeholder liaison

---

## Project Timeline & Estimation

### Estimation Summary

| Scenario        | Duration | Person-Days | Risk Level  | Recommended Use             |
| --------------- | -------- | ----------- | ----------- | --------------------------- |
| **Optimistic**  | 18 weeks | 250 days    | High risk   | Best-case planning          |
| **Realistic**   | 22 weeks | 302 days    | Medium risk | **Primary planning target** |
| **Pessimistic** | 26 weeks | 360 days    | Low risk    | Risk mitigation planning    |

### Detailed Breakdown (Realistic Scenario)

| Component                   | Frontend    | Backend      | DevOps/Infra | PM          | Total        | Duration     |
| --------------------------- | ----------- | ------------ | ------------ | ----------- | ------------ | ------------ |
| **Setup & Architecture**    | 4 days      | 8 days       | 5 days       | 3 days      | 20 days      | 3 weeks      |
| **Infrastructure Setup**    | 1 day       | 2 days       | 6 days       | 1 day       | 10 days      | 1.5 weeks    |
| **Authentication**          | 3 days      | 5 days       | 2 days       | 1 day       | 11 days      | 1.5 weeks    |
| **Input Wizards + Session** | 30 days     | 15 days      | 2 days       | 5 days      | 52 days      | 5.5 weeks    |
| **Calculation Engine**      | 15 days     | 55 days      | 1 day        | 10 days     | 81 days      | 8 weeks      |
| **External Integrations**   | 4 days      | 14 days      | 2 days       | 2 days      | 22 days      | 3 weeks      |
| **Export Functionality**    | 5 days      | 10 days      | 1 day        | 2 days      | 18 days      | 2.5 weeks    |
| **Save Feature**            | 3 days      | 5 days       | 1 day        | 1 day       | 10 days      | 1 week       |
| **Testing & QA**            | 8 days      | 12 days      | 4 days       | 3 days      | 27 days      | 4 weeks      |
| **Deployment & Monitoring** | 2 days      | 3 days       | 8 days       | 2 days      | 15 days      | 2 weeks      |
| **Contingency (18%)**       | 14 days     | 24 days      | 6 days       | 6 days      | 50 days      | -            |
| **TOTAL**                   | **89 days** | **146 days** | **36 days**  | **31 days** | **302 days** | **22 weeks** |

### Optional Designer Allocation

| Component                    | Designer Days | When Needed            |
| ---------------------------- | ------------- | ---------------------- |
| **UX Research & Wireframes** | 3 days        | Weeks 1-2              |
| **UI Design & Mockups**      | 4 days        | Weeks 3-4              |
| **Design System Creation**   | 2 days        | Weeks 5-6              |
| **User Testing Support**     | 2 days        | Weeks 13-14            |
| **TOTAL (Optional)**         | **11 days**   | **Throughout project** |

### Project Timeline (Realistic Scenario - 22 Weeks)

```
    Week:  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22
           |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |

Infrastructure Setup:
    [██████]                                                                (2 weeks)

Project Setup & Auth:
    [████████████████]                                                      (4 weeks)

Input Wizards + Session:
                      [██████████████████████████]                          (6 weeks)

Calculation Engine:
                                          [██████████████████████████████] (8 weeks)

Integration & Export:
                                                                    [████████] (2 weeks)

Testing & QA (Parallel):
                                                                    [████████████] (3 weeks)

Deployment:
                                                                          [████] (2 weeks)

Legend: [██] = Active Development Phase
```

### Development Process Flow

**Process**: Task Definition & Refinement → Development → QA → Release Candidate (RC)

#### Parallel Development Tracks

#### Weeks 1-4: Foundation Phase

- **Task Definition & Refinement**: Requirements analysis, architecture design
- **Development**: Environment setup, frameworks, database design, authentication
- **Domain Learning**: Time allocated for understanding business processes, Excel formulas, and manufacturing workflows
- **QA**: Test environment setup, testing strategy definition
- **RC**: Development environment validation

#### Weeks 5-17: Core Development Phase

- **Task Definition & Refinement**: Detailed feature specifications
- **Development**: Frontend wizards (weeks 5-9), backend calculation engine (weeks 10-17)
- **Domain Learning**: Continuous learning of complex formulas and business logic during development
- **QA**: Parallel testing of completed components, unit tests
- **RC**: Feature validation and integration testing

#### Weeks 18-19: Integration Phase

- **Task Definition & Refinement**: Integration requirements validation
- **Development**: External systems integration, export functionality
- **QA**: Integration testing, end-to-end testing (parallel with development)
- **RC**: System integration validation

#### Weeks 17-20: Testing & Deployment Phase

- **Task Definition & Refinement**: Deployment and go-live requirements
- **Development**: Bug fixes, performance optimization
- **QA**: User acceptance testing, performance testing (parallel)
- **RC**: Production deployment, go-live support

---

## Complexity Analysis

### Excel Workbook Complexity Assessment

#### Analysis Results

- **Total Formulas**: 1,056 across 11 worksheets
- **Complex Formulas**: 424 (40.2%) with nested logic and cross-references
- **Medium Formulas**: 303 (28.7%) requiring moderate migration effort
- **Simple Formulas**: 329 (31.2%) with low migration risk
- **Complexity Score**: High (based on comprehensive analysis)
- **MVP Migration**: Target 450 formulas covering ~43% of functionality in Phase 1

### Technical Complexity Factors

**High Complexity**: Calculation engine (Excel migration), External integrations (3 systems), Data consistency, Performance optimization

**Medium Complexity**: Multi-step wizard UI, PowerPoint export, Azure AD authentication

**Low Complexity**: Basic CRUD operations, Static content, Monitoring

---

## External System Integrations

- **MGX System**: REST API, 3 person-days, Customer/product data
- **Mango Database**: Direct connection, 3 person-days, Project references
- **SAP System**: OData services, 4 person-days, Material master/costs
- **Total Integration Effort**: 10 person-days

---

## Risk Assessment & Assumptions

### Key Assumptions

#### Technical Assumptions

1. **Excel Analysis Accuracy**: Current formula analysis covers 90% of use cases
2. **External System Availability**: MGX, Mango, SAP systems accessible during development
3. **Team Expertise**: Team has required technical skills or can learn quickly
4. **Infrastructure Readiness**: VMWare environment ready for deployment

#### Business Assumptions

1. **User Requirements Stability**: No major scope changes during development
2. **Stakeholder Availability**: Business users available for testing and feedback
3. **Data Quality**: External systems provide consistent, reliable data
4. **Timeline Flexibility**: Some buffer acceptable for unforeseen challenges

### Risk Analysis

#### High Impact Risks

1. **Formula Complexity Underestimated** (Probability: Medium)

   - **Impact**: Additional 2-4 weeks development time
   - **Mitigation**: Early prototype of critical calculations, phased approach

2. **External System Integration Issues** (Probability: Medium)

   - **Impact**: 1-2 weeks delay per system
   - **Mitigation**: Early connectivity testing, fallback mechanisms

3. **Performance Requirements** (Probability: Low)
   - **Impact**: Architecture changes, additional optimization
   - **Mitigation**: Performance testing throughout development

#### Medium Impact Risks

1. **Team Learning Curve** (Probability: Medium)

   - **Impact**: Slower initial development velocity
   - **Mitigation**: Training, mentoring, code reviews

2. **Scope Creep** (Probability: Medium)

   - **Impact**: Timeline extension, budget increase
   - **Mitigation**: Clear MVP definition, change control process

3. **User Acceptance Issues** (Probability: Low)
   - **Impact**: Additional UI/UX iterations
   - **Mitigation**: Regular user feedback, iterative design

### Contingency Planning

- **Time Contingency**: 20% buffer included in realistic estimate
- **Scope Contingency**: Clear MVP boundaries with future phase planning
- **Technical Contingency**: Alternative solutions identified for high-risk components

---

## Investment Summary

### Cost Breakdown by Scenario

| Scenario        | Timeline | Person-Days | Risk Level  | Recommendation        |
| --------------- | -------- | ----------- | ----------- | --------------------- |
| **Optimistic**  | 18 weeks | 250 days    | High risk   | Aggressive timeline   |
| **Realistic**   | 22 weeks | 302 days    | Medium risk | **Recommended**       |
| **Pessimistic** | 26 weeks | 360 days    | Low risk    | Conservative approach |

---

## Summary

### Key Points

This rough estimation provides a foundation for project planning while acknowledging significant uncertainties. **We cannot guarantee the effects or outcomes** of this project.

**Most Important Considerations:**

### Assumptions

- Excel analysis accuracy covers 90% of use cases
- External systems (MGX, Mango, SAP) remain accessible
- Team has required technical skills or can learn quickly
- **Technical PM with domain knowledge will be available throughout the project**
- **Time allocated for domain learning is sufficient for understanding complex business processes**
- No major scope changes during development
- Business users available for testing and feedback

### Risks

- **Formula complexity may be underestimated** - could add 2-4 weeks
- **Domain knowledge gap** - insufficient understanding of business processes could delay development
- **External system integration issues** - potential 1-2 weeks delay per system
- **Team learning curve** - may slow initial development, especially for domain-specific aspects
- **Scope creep** - risk of timeline extension
- **Performance requirements** - may require architecture changes
- **Technical PM availability** - lack of domain expertise support could significantly impact timeline

**Process**: Task Definition & Refinement → Development → QA (parallel) → Release Candidate

**Recommendation**: 22 weeks with 302 person-days and 5-person team, with 18% contingency buffer included. Timeline reflects formula complexity, session management requirements, and infrastructure requirements for Docker containerization and private VM deployment.
