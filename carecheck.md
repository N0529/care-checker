**PROJECT PROPOSAL**

**CareCheck**

Hospital Transparency Platform for India

A Community-Driven Web Platform for Rating Hospital Wait Times,

Billing Transparency, and Patient Experience Across India

  ----------------------------------- -----------------------------------
  **Program**                         MCA / M.Tech (Computer Science &
                                      Engineering)

  **Project Type**                    Postgraduate Academic Project ---
                                      Team of 2--3

  **Domain**                          Healthcare Technology / Web
                                      Application Development

  **Academic Year**                   2025 -- 2026

  **Platform**                        Web Application (Browser-Based)

  **Document Version**                v1.0 --- Initial Proposal
  ----------------------------------- -----------------------------------

**Table of Contents**

**1. Executive Summary**

CareCheck is a proposed web-based hospital transparency platform
designed for the Indian healthcare ecosystem. The platform enables
patients to browse hospitals, compare them based on community-submitted
transparency ratings, view geographic locations on an interactive map,
and make informed decisions before their visit. Administrators can
monitor the platform through a management panel, access summary metrics,
and export data as structured CSV reports.

India has over 70,000 hospitals, yet no dedicated, community-driven
platform exists that surfaces patient-reported transparency data ---
specifically around wait times and billing clarity. CareCheck addresses
this gap by combining geographic discovery, structured patient reviews,
and an administrative oversight layer into a single coherent system.

The project is to be developed as a full-stack web application by a team
of 2--3 postgraduate students as part of their academic programme. The
system will be designed with scalability and future extensibility in
mind.

**2. Problem Statement**

The Indian healthcare system presents patients with several critical
information asymmetries at the point of decision-making:

-   Patients cannot easily compare hospitals before visiting.
    General-purpose review platforms such as Google Maps and Practo list
    hospitals but lack structured, transparency-focused quality
    indicators.

-   Billing surprises are common. Patients frequently encounter final
    bills that differ significantly from initial estimates, with no
    prior community-sourced indication of a hospital\'s billing
    transparency practices.

-   Wait times are unpredictable. No accessible platform aggregates real
    patient-reported wait time satisfaction data at the hospital level
    in India.

-   No trusted, India-specific community review system exists for
    hospitals. Platforms like Yelp, which serve this function
    internationally, are not widely adopted in the Indian context.

-   Administrators and healthcare oversight bodies lack simple tools.
    There is no lightweight admin layer for monitoring community
    sentiment, tracking review counts, or exporting hospital quality
    data without access to complex enterprise tools.

The absence of such a platform creates information asymmetry that
disadvantages patients, particularly those without prior familiarity
with a hospital or access to trusted personal networks.

**3. Project Objectives**

The primary objectives of the CareCheck project are as follows:

1.  Design and develop a web-based hospital discovery and review
    platform tailored to the Indian healthcare context.

2.  Enable patients to browse, search, and compare hospitals using
    community-submitted transparency ratings focused on wait time
    satisfaction and billing clarity.

3.  Integrate interactive map-based hospital discovery using geographic
    coordinates.

4.  Build a structured review submission system that captures
    quantifiable transparency signals from real patients.

5.  Implement an administrative panel that provides summary metrics,
    hospital oversight, and CSV data export functionality.

6.  Persist all hospital records and derived review metrics across
    system sessions.

7.  Lay the architectural groundwork for future features such as user
    authentication, real-time data, and mobile access.

**4. Project Scope**

**4.1 In Scope**

-   Patient-facing hospital listing with search by name and address

-   Hospital detail view showing ratings, review count, and map location

-   Structured review submission form (wait time satisfaction and
    billing transparency)

-   Automatic rating and review count updates on review submission

-   Admin panel showing all hospitals with address, rating, review
    count, and coordinates

-   Admin summary dashboard: total hospitals, average rating, total
    reviews

-   CSV export of hospital data from the admin panel

-   Data persistence across application restarts

-   User registration and login (JWT-based authentication)

-   Review linked to authenticated user account --- one review per user
    per hospital

-   Review moderation layer to flag abusive submissions

-   Hospital claim feature --- verified hospitals can respond to reviews

-   Integration with NABH (National Accreditation Board for Hospitals)
    public data for accreditation status

-   Integration with NHA (National Health Authority) Ayushman Bharat
    hospital registry

-   Automated hospital seeding from government open datasets

-   Multi-dimensional review model: cleanliness, staff behaviour,
    emergency responsiveness

**4.2 Out of Scope (Current Version)**

-   Mobile application (iOS/Android)

-   Payment, appointment booking, or telemedicine features

-   Multi-language support (e.g. Hindi, Marathi)

**5. Existing Systems and Competitive Analysis**

A review of existing platforms reveals a clear gap in structured,
transparency-focused hospital ratings for Indian patients. The following
table summarises relevant comparisons:

  ---------------------- ---------------------- -------------------------
  **Platform**           **Strengths**          **Gap Addressed by
                                                CareCheck**

  Google Maps / Search   Wide coverage,         No structured
                         location data, user    transparency fields;
                         reviews                generic star ratings only

  Practo                 Strong doctor          No hospital-level billing
                         discovery, appointment or wait time transparency
                         booking                ratings

  Lybrate                India-specific, doctor No community review layer
                         profiles               for hospitals; no
                                                transparency signals

  CMS Care Compare (USA) Structured hospital    US government tool; not
                         quality metrics,       applicable to Indian
                         public data            hospitals or
                                                community-driven

  Yelp (Healthcare       Community reviews,     Not widely adopted in
  category)              structured categories  India; no India-specific
                                                healthcare context

  CareCheck (Proposed)   India-specific,        Fills the entire gap ---
                         structured             no comparable Indian
                         transparency reviews,  product exists
                         admin panel, map       
  ---------------------- ---------------------- -------------------------

CareCheck\'s core differentiator is the structured review model ---
rather than a single star rating, patients explicitly rate wait time
satisfaction and billing transparency as separate dimensions, producing
more actionable data for both patients and administrators.

**6. User Personas and Use Cases**

**6.1 User Personas**

**Persona 1: Priya Sharma --- Patient / General Public**

  ---------------------- ------------------------------------------------
  **Age**                34

  **Location**           Pune, Maharashtra

  **Context**            Needs to choose a hospital for a scheduled
                         procedure for her elderly father

  **Pain Point**         Does not know which hospitals in her area have
                         transparent billing or manageable wait times

  **Goal**               Find a nearby hospital with high transparency
                         ratings before committing to an appointment

  **Tech Comfort**       Comfortable with smartphones and web browsing
  ---------------------- ------------------------------------------------

**Persona 2: Rajan Mehta --- Post-Discharge Patient**

  ---------------------- ------------------------------------------------
  **Age**                52

  **Location**           Mumbai, Maharashtra

  **Context**            Recently discharged after a 3-day hospital stay;
                         received a bill significantly higher than quoted

  **Pain Point**         Wants to warn other patients about billing
                         practices at the hospital

  **Goal**               Submit a review to help others make informed
                         decisions

  **Tech Comfort**       Moderate; uses desktop browser at home
  ---------------------- ------------------------------------------------

**Persona 3: Admin / Healthcare Oversight Officer**

  ---------------------- ------------------------------------------------
  **Role**               Platform administrator or healthcare quality
                         analyst

  **Context**            Monitors hospital review data for quality
                         insights

  **Goal**               View all hospitals, check summary metrics, and
                         export data for reporting

  **Tech Comfort**       High; works with data tools regularly
  ---------------------- ------------------------------------------------

**6.2 Key Use Cases**

  ---------------- ------------ ------------------------------------------
  **Use Case**     **Actor**    **Description**

  UC-01: Browse    Patient      User opens the platform and sees a list of
  Hospitals                     hospitals with ratings and locations

  UC-02: Search    Patient      User types a name or address into a search
  Hospital                      bar; results filter in real time

  UC-03: View      Patient      User clicks a hospital; its pin is
  Hospital on Map               highlighted on the embedded map

  UC-04: Submit    Patient      User fills in a structured form rating
  Review                        wait time satisfaction and billing
                                transparency; system updates hospital
                                rating

  UC-05: Admin     Admin        Admin views all hospitals with rating,
  Dashboard                     review count, and coordinate data

  UC-06: View      Admin        Admin sees total hospitals, average
  Summary Metrics               rating, and total reviews on the dashboard

  UC-07: Export    Admin        Admin clicks export; receives a CSV file
  CSV                           containing all hospital data
  ---------------- ------------ ------------------------------------------

**7. System Architecture**

**7.1 High-Level Architecture**

CareCheck follows a classic three-tier web application architecture
consisting of a Presentation Layer (frontend), an Application Layer
(backend/API), and a Data Layer (persistent storage). The three tiers
communicate over HTTP, with the frontend consuming a RESTful API exposed
by the backend.

  ---------------- ---------------------- -------------------------------
  **Layer**        **Component**          **Responsibility**

  Presentation     Browser-based Web UI   Hospital listing, search, map,
                                          review form, admin panel

  Application      Backend REST API       Business logic: search
                   Server                 filtering, review aggregation,
                                          rating updates, CSV generation

  Data             Persistent Data Store  Hospital records,
                                          review-derived metrics
                                          (ratings, review counts,
                                          coordinates)
  ---------------- ---------------------- -------------------------------

**7.2 Component Breakdown**

The following components make up the CareCheck system:

-   Hospital Service --- Handles CRUD operations for hospital records
    including name, address, coordinates, rating, and review count.

-   Review Service --- Accepts structured review input (wait time score,
    billing transparency score), validates it, and triggers the rating
    aggregation logic.

-   Rating Aggregator --- Recalculates the hospital\'s average rating
    and increments the review count on each new review submission.

-   Search Module --- Filters hospitals by name or address string match.

-   Map Integration Layer --- Passes geographic coordinates to an
    embedded mapping library (e.g. Leaflet.js with OpenStreetMap) for
    visualisation.

-   Admin Panel --- Provides a read-only management view of all
    hospitals plus summary metric computation.

-   CSV Exporter --- Serialises the hospital data store into a
    downloadable CSV report.

**8. Database Schema / Data Model**

**8.1 Entity: Hospital**

The Hospital entity is the central record in the system. All
review-derived metrics are stored directly on this record for efficient
read access.

  ------------------ ---------------- ------------------------------------
  **Field**          **Data Type**    **Description**

  hospital_id        UUID / Integer   Unique identifier for the hospital
                     (PK)             

  name               String (255)     Full name of the hospital

  address            String (500)     Street address, city, state

  latitude           Decimal (9,6)    Geographic latitude coordinate

  longitude          Decimal (9,6)    Geographic longitude coordinate

  average_rating     Decimal (3,2)    Computed average rating (0.00 to
                                      5.00); updated on each review

  review_count       Integer          Total number of reviews submitted;
                                      incremented on each review

  created_at         Timestamp        Record creation datetime

  updated_at         Timestamp        Last modification datetime
  ------------------ ---------------- ------------------------------------

**8.2 Entity: Review**

The Review entity stores each patient-submitted review. The two
transparency-specific scores are averaged to derive the contribution to
the hospital\'s overall rating.

  ---------------------------- ---------------- ------------------------------------
  **Field**                    **Data Type**    **Description**

  review_id                    UUID / Integer   Unique identifier for the review
                               (PK)             

  hospital_id                  FK → Hospital    Reference to the reviewed hospital

  wait_time_score              Integer (1--5)   Patient\'s rating of wait time
                                                satisfaction

  billing_transparency_score   Integer (1--5)   Patient\'s rating of billing
                                                transparency and clarity

  review_text                  Text (optional)  Optional free-text comment from the
                                                patient

  submitted_at                 Timestamp        Date and time of review submission
  ---------------------------- ---------------- ------------------------------------

**8.3 Rating Aggregation Logic**

On each new review submission, the system executes the following update
to the Hospital record:

new_review_score = (wait_time_score + billing_transparency_score) / 2

new_average = ((old_average \* old_count) + new_review_score) /
(old_count + 1)

review_count = review_count + 1

**9. Functional Requirements**

**9.1 Patient-Facing Features**

-   FR-01: The system shall display a searchable list of hospitals with
    name, address, average rating, and review count.

-   FR-02: The system shall allow users to filter hospitals by name or
    address using a real-time search input.

-   FR-03: The system shall display each hospital\'s location on an
    embedded interactive map using latitude and longitude coordinates.

-   FR-04: The system shall provide a structured review form with fields
    for wait time satisfaction score (1--5), billing transparency score
    (1--5), and optional free-text comment.

-   FR-05: On review submission, the system shall recalculate the
    hospital\'s average rating and increment the review count.

**9.2 Admin-Facing Features**

-   FR-06: The system shall provide an admin panel displaying all
    hospitals with name, address, average rating, review count, and
    coordinates.

-   FR-07: The admin panel shall display summary metrics: total
    hospitals registered, platform-wide average rating, and total
    reviews submitted.

-   FR-08: The system shall allow an admin to export all hospital data
    as a downloadable CSV file.

**9.3 Data Persistence**

-   FR-09: All hospital records and review-derived metrics shall persist
    across application restarts without data loss.

**10. Non-Functional Requirements**

  --------- --------------------- ----------------------------------------
  **ID**    **Requirement**       **Target**

  NFR-01    Performance           Hospital list page loads within 2
                                  seconds for up to 500 hospital records

  NFR-02    Usability             Platform usable on standard desktop and
                                  laptop browsers without specialist
                                  training

  NFR-03    Reliability           Data persists correctly across restarts;
                                  no data loss on review submission

  NFR-04    Maintainability       Codebase follows modular architecture;
                                  components independently testable

  NFR-05    Scalability           Architecture supports addition of
                                  authentication and mobile layers in
                                  future phases

  NFR-06    Accessibility         Meets WCAG 2.1 AA contrast and keyboard
                                  navigation standards for web content
  --------- --------------------- ----------------------------------------

**11. Recommended Technology Stack**

Since no specific technology preference was specified, the following
stack is recommended based on the project requirements, academic
context, and widespread use in Indian postgraduate programmes:

  --------------- ---------------------- ---------------------------------
  **Layer**       **Recommended          **Rationale**
                  Technology**           

  Frontend        React.js (or plain     Component-based UI, widely
                  HTML/CSS/JS)           taught; works well for map
                                         integration

  Backend         Python with Flask or   Strong academic ecosystem in
                  Django REST Framework  India; clean REST API development

  Database        SQLite (dev) /         SQLite for simplicity during
                  PostgreSQL             development; PostgreSQL for
                  (production)           deployment

  Map Integration Leaflet.js with        Open-source, free, no API key
                  OpenStreetMap          required; widely used in academic
                                         projects

  CSV Export      Python csv module or   Built into Python; no additional
                  pandas                 dependencies needed

  Version Control Git with GitHub /      Standard academic submission and
                  GitLab                 collaboration tool
  --------------- ---------------------- ---------------------------------

**12. Project Roadmap**

**Phase 1 --- MVP (Core Platform)**

-   Hospital listing, search, and map view

-   Structured review submission

-   Admin panel with metrics and CSV export

-   Data persistence

**Phase 2 --- Authentication and Trust (Included in Project)**

-   User registration and login (JWT-based authentication)

-   Review linked to authenticated user account --- one review per user
    per hospital

-   Review moderation layer to flag abusive submissions

-   Hospital claim feature --- verified hospitals can respond to reviews

**Phase 3 --- Data Enrichment (Included in Project)**

-   Integration with NABH (National Accreditation Board for Hospitals)
    public data for accreditation status

-   Integration with NHA (National Health Authority) Ayushman Bharat
    hospital registry

-   Automated hospital seeding from government open datasets

-   Multi-dimensional review model: cleanliness, staff behaviour,
    emergency responsiveness

**Phase 4 --- Scale and Access (Future Enhancement)**

-   Progressive Web App (PWA) for mobile access without a native app

-   Multi-language support: Hindi, Marathi, Tamil, and other regional
    languages

-   Real-time dashboard for admin with live review feed

-   Public API for third-party healthcare tools to access transparency
    data

**13. Proposed Project Plan**

  ---------------- ------------------------------------- ----------------
  **Phase**        **Activities**                        **Duration**

  Phase 1:         Finalise requirements, design data    2 Weeks
  Requirements &   model, wireframe UI, set up project   
  Design           repository                            

  Phase 2: Backend Implement REST API for hospitals and  3 Weeks
  Development      reviews, set up database, rating      
                   aggregation logic                     

  Phase 3:         Build hospital listing, search, map   3 Weeks
  Frontend         view, review form using chosen        
  Development      frontend stack                        

  Phase 4: Admin   Implement admin dashboard, summary    2 Weeks
  Panel            metrics, CSV export functionality     

  Phase 5:         End-to-end testing, bug fixes,        2 Weeks
  Integration &    performance checks, data persistence  
  Testing          validation                            

  Phase 6:         Final report, user manual, code       2 Weeks
  Documentation &  comments, presentation preparation    
  Submission                                             
  ---------------- ------------------------------------- ----------------

**14. Team Structure and Roles**

The project will be executed by a team of 2--3 postgraduate students
with the following suggested role distribution:

  --------------- --------------------- ----------------------------------
  **Member**      **Primary Role**      **Responsibilities**

  Member 1        Full-Stack Lead       Backend API development, database
                                        design, data persistence, rating
                                        logic

  Member 2        Frontend Developer    UI development, map integration,
                                        review form, admin panel interface

  Member 3        QA & Documentation    Testing, report writing,
  (optional)                            deployment, presentation
                                        preparation
  --------------- --------------------- ----------------------------------

**15. Conclusion**

CareCheck addresses a real and pressing problem in the Indian healthcare
landscape: the lack of a structured, community-driven platform where
patients can evaluate hospitals based on transparency-specific criteria
before making healthcare decisions.

By combining geographic discovery, structured patient reviews, and an
administrative oversight panel into a cohesive web application, the
project delivers measurable value to both individual patients and
healthcare quality stakeholders. The system is scoped appropriately for
a postgraduate academic project while being architecturally designed for
meaningful future extensibility --- including integration with Indian
government health registries such as NABH and NHA.

The project demonstrates applied competencies across full-stack web
development, relational data modelling, RESTful API design, geographic
data visualisation, and structured data export --- all highly relevant
to the postgraduate curriculum and to professional software engineering
practice.

*End of Proposal Document*
