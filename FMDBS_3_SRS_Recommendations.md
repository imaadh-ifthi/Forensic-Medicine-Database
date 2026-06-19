# FMDBS SRS v1.0 — Improvement Recommendations

> Based on analysis of Dr. Ameen's production Access DB system, interview with Dr. Ameen, and proposed normalized schema
> Prepared by: Team Tira-miss-u | June 2026

---

## Context

The primary objective of this SRS is to **design a new system** for the Department of Forensic Medicine, University of Peradeniya. The existing Microsoft Access database (created by Dr. Ameen) and the interview conducted with him serve as a **reference for understanding how a production forensic medicine system operates in practice**. Data migration from the Access DB is a secondary consideration.

The recommendations below are drawn from:
1. **Schema analysis** of Dr. Ameen's Access DB (7 MLE tables, 10 PM tables)
2. **Interview with Dr. Ameen** — revealing operational workflows, pain points, and features developed from years of real-world use
3. **Normalized schema design** (3NF/BCNF) comparing what the SRS specifies vs. what the real system needs

### How to Read This Document

Each recommendation is mapped to a **specific SRS section** with the exact location where the change should be made.

- **[ADD]** — New content to insert
- **[MODIFY]** — Existing content to revise
- **[EXPAND]** — Existing content that needs more detail

Priority: 🔴 Critical | 🟡 Important | 🟢 Nice-to-have

---

## Section 1: Introduction (SRS Pages 3–5)

### 1.3 Scope (Page 3–4)

**[MODIFY]** 🔴 The scope statement reads:

> *"The system will NOT manage financial transactions, human resources payroll, or patient clinical treatment records beyond what is documented in forensic examination forms."*

**Problem:** Dr. Ameen's production system actively manages **court fee claims** (travel reimbursements, attendance fees). The `Claim Summary` table and `TRClaim_*` fields in `MLE Records` confirm this is a daily operational need. During the interview, Dr. Ameen demonstrated how reports are tracked alongside claims to courts — these are not "financial transactions" in the payroll sense, but case-linked claim tracking.

**Recommendation:** Revise to:

> *"The system will NOT manage human resources payroll or patient clinical treatment records beyond what is documented in forensic examination forms. However, the system SHALL track court-related fee claims (travel reimbursement, attendance fees) linked to individual cases, as this is an integral part of the forensic case lifecycle."*

---

### 1.4 Definitions, Acronyms, and Abbreviations (Page 5)

**[ADD]** 🟡 Terms observed in Dr. Ameen's system and interview that are not defined in the SRS:

| Term | Definition to Add |
|------|-------------------|
| CME No | Clinical Medico-legal Examination Number: internal department reference number assigned to each clinical forensic case |
| SR No | Serial Register Number: sequential number in the department's physical register |
| NOK | Next of Kin: closest relative or legal representative of the deceased |
| COD Form | Medicolegal Autopsy Notification Form (Cause of Death form) submitted to the Registrar General |
| DC No | Death Certificate Number |
| ICD | International Classification of Diseases (WHO coding standard used in COD forms) |
| Morgue No | Sequential number assigned upon body admission to the mortuary |
| PHN No | Preliminary Hospital Number |
| IQ | Inquest case type — post-mortem ordered by an Inquirer into Sudden Deaths |
| OS | Outside case type — death occurring outside the hospital |
| Yomu Ankaya | Sinhala term for court summons document |

---

## Section 2: Overall System Description (SRS Pages 6–9)

### 2.2 Product Functions Summary (Page 6)

**[ADD]** 🔴 Two core functions are missing from the numbered list. Dr. Ameen's system has both:

| # | Function to Add | Evidence |
|---|-----------------|----------|
| 12 | Court fee claim tracking and reimbursement lifecycle management | `Claim Summary` table + `TRClaim_*` fields in both MLE and PM databases |
| 13 | Case-linked communication/contact logging for incoming calls, visits, and correspondence | `Contact Log` table in both databases; Dr. Ameen: *"after 3-4 years, if I go to this table, I know what are the important communications that we have"* |

**[MODIFY]** 🟡 Function #4 ("Audio recording and transcript generation") — Dr. Ameen confirmed this is specifically for **post-mortem examinations**: *"I usually record [during autopsy]. So, when I am preparing the final report, I can listen to this and prepare the reports."*

---

### 2.3 User Classes and Characteristics (Pages 6–8)

#### 2.3.2 Doctor (Page 7)

**[ADD]** 🟡 Based on Dr. Ameen's demonstrated workflow:

> - File court fee claims (travel reimbursement, attendance fees) linked to cases where the doctor has provided testimony or reports
> - Log incoming communications (phone calls, visits from police/family/courts) against a case record
> - Record voice during post-mortem examinations for later transcription and report writing
> - Access a configurable COD rules/abbreviation engine for automated report generation

#### 2.3.3 Clerk / Administrative Staff (Page 7)

**[ADD]** 🟡 Dr. Ameen described the clerk/office workflow: *"from the office, they will enter [the details]. This is the phone number..."* Add:

> - Record court fee claim dispatch and receipt details
> - Enter contact log entries for incoming communications on behalf of doctors
> - Manage body release documentation and next-of-kin records for autopsy cases
> - Track specimen/investigation forwarding status (Dr. Ameen: *"once they have sent it, they will change this [status]. So, I am monitoring whether my sample is actually being sent or still pending"*)

#### 2.3.4 Lab Staff / Technician (Page 7)

**[EXPAND]** 🟡 Dr. Ameen describes a "Mortuary Worker" sub-role that does basic data entry:

> *"these mortuary workers, basic test level entry... they have to know each and every case by the case number name because they want to release the body... they are the one taking the samples and sending upstairs... they have to know what samples they have taken."*

Add to the SRS:

> - Mortuary workers (a sub-role of Lab Staff) shall perform initial case data entry (3 basic fields: PM number, BHT number, name/sex/age)
> - Record specimen collection and forwarding status
> - Record body release details (to whom, when)
> - **After body release, case access for this role shall be restricted** (Dr. Ameen: *"after releasing, to whom they are releasing, and after releasing only, the access should be closed to this case"*)

---

### 2.4 Operating Environment (Page 8)

**[ADD]** 🟢 Dr. Ameen raised specific infrastructure concerns:

> *"UPS is the issue. The night is suddenly, machine is switching off."*
> *"they don't have a proper mortuary for the university"*
> *"he has a smartphone, he stays home"*

Add note:

> The system shall handle unreliable power conditions gracefully (auto-save, data persistence on unexpected shutdown). Mobile access via smartphone shall be supported for mortuary workers who may use personal devices, with privacy controls ensuring photos are not stored to local device storage.

---

## Section 3: Functional Requirements (SRS Pages 10–17)

### 3.1 User Authentication and Access Control (Page 10)

#### FR-AUTH-02: Role-Based Access Control

**[EXPAND]** 🔴 Dr. Ameen explicitly confirmed the need for RBAC and its current absence:

> *"one thing I wanted to improve is that some role-based user log-ins. I don't have any user log-ins. Everyone looks into the front end."*

The SRS correctly defines 5 roles but should add:

> **FR-AUTH-02c:** Different roles shall see different views of the same case record. Mortuary workers see only basic identification and body tracking fields. Clerks see administrative fields but not clinical findings. Doctors see all fields for their own cases. The Super Administrator has read-only oversight of all cases.

> **FR-AUTH-02d:** The Super Administrator role is transferable (Dr. Ameen: *"superintendent transfers... sometimes changes the head of department. So, it's a transferable role"*). The system shall support re-assigning the Super Administrator role without creating a new account.

---

### 3.2 Clinical Forensic Case Management (Pages 10–12)

#### FR-CLIN-01: Case Registration (Page 10–11)

**[EXPAND]** 🔴 The registration field list is incomplete. Add based on the production system and interview:

| Field | Rationale | Source |
|-------|-----------|--------|
| **CME Number (internal reference)** | The department assigns its own sequential reference, separate from the police MLEF number. Dr. Ameen: *"this is the doctor's number... he has his own serial number. This is the 320th autopsy he has done."* | Access DB: `CME_No` |
| **Serial Register Number (SR No)** | Sequential number in the physical register book. Required for paper cross-referencing. | Access DB: `SR_No` |
| **Produced By** | Who physically brought/escorted the patient. Chain-of-custody detail with legal significance. | Access DB: `Produced_BY` |
| **Police officer contact number** | Direct contact for the escorting officer. | Access DB: `Contact_No_Police` |
| **Patient contact number** | Patient's phone for follow-up. | Access DB: `Contact_No` |
| **Patient type: Inward / Outpatient** | Determines whether BHT/Ward fields are required. | SRS scope mentions it but field list omits it |
| **Examining doctor (Seen By)** | The specific doctor who performed the examination — may differ from assigned doctor. | Access DB: `Seen_BY` |

**[MODIFY]** 🔴 Age specification. Revise to:

> - Age: captured as three separate integer fields — **Years**, **Months**, and **Days** — to support forensic age estimation of children and infants where sub-year precision is legally required.

**[ADD]** 🟡 Auto-population and validation (from Dr. Ameen's interview):

> **FR-CLIN-01f:** The system shall support **auto-population of related fields**. When a police station is selected or a police officer's number is entered, previously stored station name and contact details shall be pre-filled. (Dr. Ameen: *"when they enter that number, they have police station and they have mobile numbers. If it is already entered... it will come out. I don't want that kind of function not there. Otherwise, they have to enter 50 cases in half an hour. It is very hard."*)

> **FR-CLIN-01g:** The system shall enforce **composite uniqueness constraints** on case identifiers. BHT numbers alone may duplicate across cases, but the combination of BHT + case reference shall be unique. (Dr. Ameen: *"they should be able to duplicate the BHT number. So, I have coupled these two... the PM numbers and all I have made, this part is unique."*)

**[ADD]** 🟡 Court distinction:

> **FR-CLIN-01h:** The system shall distinguish between the **ordering court** (magistrate court that issued the MLEF) and the **trial court** (where the doctor may later be summoned). These are frequently different jurisdictions and both shall be recorded separately.

---

#### FR-CLIN-02: MLEF Data Entry (Page 11)

**[EXPAND]** 🟡 Add OCR preview and confirmation flow details:

> **FR-CLIN-02b:** Upon upload of the scanned MLEF, the system shall use OCR to extract key fields and present them as a preview for the doctor to verify and confirm before saving. Once confirmed, extracted fields become **read-only**. (Dr. Ameen confirmed MLEF OCR feasibility: *"these are clear enough... we want them to edit those. You get a preview and then you can correct it."*)

> **FR-CLIN-02c:** The MLEF scan shall be stored as an immutable document linked to the case. A thumbnail shall be displayed on the case record with click-to-enlarge (lightbox) functionality.

---

#### FR-CLIN-03: Clinical Examination Findings and Investigations (Page 11)

**[EXPAND]** 🔴 Add full specimen lifecycle tracking. Dr. Ameen demonstrated a colour-coded status system:

> *"This yellow colour means it's still not sent... once they have sent it, they will change this... once they receive the reports, they will change this as received and the date will be automatically filled in."*

> **FR-CLIN-03f:** Each investigation/specimen record shall track the full lifecycle:
> - **Date sampled** — when collected
> - **Sent to** — laboratory or institution
> - **Investigation number (Ix No)** — lab-assigned tracking number
> - **Date results received** — when results returned
> - **Results** — findings (text or uploaded document)
> - **Date discarded** — when specimen was formally discarded
> - **Status** — Ordered → To Be Sent → Pending → Completed → Discarded
>
> The status shall be **visually indicated** (e.g., colour coding) so office staff can immediately see which specimens require action.

> **FR-CLIN-03g:** Dr. Ameen described how unforwarded specimens are a major pain point: *"sometimes what happens is they get the samples after two years."* The system shall highlight specimens in "To Be Sent" status for more than a configurable period (default: 7 days) as overdue.

**[MODIFY]** 🟡 The referral department list should be a **configurable lookup table**, not hardcoded, so departments can be added by the administrator without code changes.

---

#### FR-CLIN-04: Medico-Legal Report Generation (Pages 11–12)

**[EXPAND]** 🔴 Dr. Ameen's system tracks **separate generation timestamps** per report type and generates **context-sensitive reports**:

> *"if it is a neonator... it will give a separate report. If it is a decomposed, it is a different report. If it is skeleton, different report."*

> **FR-CLIN-04f:** The system shall independently track the generation, dispatch, and receipt for each report type, each with its own timestamp:
>
> | Report Type | Code | Applies To |
> |-------------|------|------------|
> | Medico-Legal Report | MLR | Clinical |
> | Toxicology Report | TOX | Both |
> | STI Report | STI | Clinical |
> | Psychiatry Report | PSYCH | Clinical |
> | Post-Mortem Report | PMR | Autopsy |
> | Cause of Death Form | COD | Autopsy |
> | Histology Report | HISTO | Autopsy |
> | Microbiology Report | MICRO | Autopsy |
>
> Report types shall be stored in a configurable lookup table.

> **FR-CLIN-04g:** The system shall select the appropriate **report template based on case characteristics** (e.g., neonatal, decomposed, skeletal remains). Template selection shall be configurable by the administrator.

---

#### FR-CLIN-05: MLEF Register (Page 12)

**[ADD]** 🟡 Dr. Ameen's register includes visual status indicators:

> *"these red colour changes are all the cases which I have photographs. So, I click that and I see that... by looking at it, you can get a summary."*

Add to register fields:
> - **CME Number** (internal reference)
> - **SR Number** (serial register number)
> - **Case status** (Open / Report Generated / Dispatched / Closed)
> - **Completion date**
> - **Visual indicators** for: has photographs, has pending reports, has pending specimens

---

### 3.3 Autopsy Case Management (Pages 12–15)

#### FR-AUTO-01: Autopsy Case Registration (Pages 12–13)

**[EXPAND]** 🔴 Dr. Ameen's PM system has **66 fields** compared to the SRS's much shorter list. Critical additions:

**PM Number Format** — Dr. Ameen explained the complex encoding:

> *"I am differentiating with that number. If this case is occurring, it must be outside. If it is outside, it will be OU. If the IQ is in question, it will be OS. And there will be another number, DC, which does not require post-mortem."*

> **FR-AUTO-01b:** The PM reference number shall encode: serial number / month / case-type code (IQ = inquest, OS = outside, DC = death certificate only) / doctor code. The system shall auto-generate this number based on configurable rules, with the doctor able to modify before confirmation.

**Additional registration fields:**

| Field | Rationale |
|-------|-----------|
| **Morgue Number** | Sequential intake number at the mortuary — the primary operational identifier used by mortuary workers |
| **PHN Number** | Preliminary Hospital Number — assigned before formal PM number |
| **Date/time of morgue admission** | When the body arrived (different from death date) |
| **Assisting technicians (Tech 1, Tech 2)** | Dr. Ameen: *"whoever has attended the autopsy and inserting in the system, so it comes"* |
| **Body storage details** | Refrigeration unit number, etc. |
| **DD Number** | Death declaration number |
| **Mode of death** | Contextual mode (hanging, drowning, shooting — different from COD) |
| **Next of Kin** | Name, relationship, NIC, contact — essential for body release |
| **Religion** | Required for culturally appropriate body handling |

**[ADD]** 🟡 Staged data entry — Dr. Ameen's system supports different users entering data at different stages:

> **FR-AUTO-01c:** Case registration shall support **staged data entry**:
> 1. **Stage 1 (Mortuary worker):** Morgue number, BHT number, name, sex, age (basic identification)
> 2. **Stage 2 (Office clerk):** Police details, court details, contact information
> 3. **Stage 3 (Doctor):** Medical findings, COD, report generation
>
> Dr. Ameen: *"usually, they enter only those three. Because at the moment of entry, they enter only these three. And they have to enter the name, sex, and age."*

---

#### **NEW: FR-AUTO-09: Body Release and Next-of-Kin Management**

**[ADD]** 🔴 This is a **major operational workflow** (12+ dedicated fields in the Access DB) completely absent from the SRS. Dr. Ameen was emphatic:

> *"ultimately, they have to release the body. When releasing, to whom they are releasing, and after releasing only, the access should be closed to this case."*

> **FR-AUTO-09:** The system shall record body release details:
> - Next of kin: full name, relationship to deceased, NIC, contact number
> - Release date and time
> - Releasing technician name
> - Death Certificate number (DC No)
> - Cemetery/crematorium (free text)
>
> Body release shall only be permitted after the PM examination is recorded. **After body release is finalized, case access for mortuary worker roles shall be restricted to read-only.** The body release record shall become immutable once finalized.

---

#### FR-AUTO-05: Investigation Management (Page 14)

**[EXPAND]** 🟡 Add specimen lifecycle as in FR-CLIN-03f, plus:

> The system shall additionally track **Specimen Number** (sequential count for multiple specimens of the same type), **CT Number** (CT scan reference), and **Microbiology report generation date** as a distinct investigation category.

Dr. Ameen described the sample forwarding workflow:

> *"once we take the samples... they see from that. This yellow colour means it's still not sent. Once they open, they also can see... once they have sent it, they will get a reference number. Once they have the reference number and change the status as pending, this will be done."*

---

#### FR-AUTO-06: Cause of Death Form (Page 14)

**[EXPAND]** 🟡 Dr. Ameen built a **rules engine** for automated COD report generation. The SRS should describe this:

> *"I have a table with these other phrases. Electrocution, fall, head injury. If it is available in that given case, and it has to insert this text to this bookmark."*

> **FR-AUTO-06b:** The system shall support a **configurable COD abbreviation lookup** and a **COD rules engine**:
> - Phrase matching with priority ordering
> - Target bookmark mapping to template sections
> - Configurable insert text with append mode
> - Administrative activation/deactivation of rules
>
> Doctors shall be able to continuously develop the abbreviation/rules tables: *"doctors can put the abbreviations... so they can continuously develop the table."*

---

#### FR-AUTO-07: PM Registry (Page 14)

**[ADD]** 🟡 Additional registry fields and visual indicators:

> - **Morgue number**
> - **Mode of death**
> - **Body release status** (Released / Pending)
> - **Death certificate number**
> - **Report generation status per type** — with colour coding (Dr. Ameen: *"all the cases where I have sent the report, all these details will become red... by looking at it, you can get a summary"*)

---

### NEW Section: 3.8 Court Fee Claim Management

**[ADD]** 🔴 Entirely new functional requirement section:

> **FR-CLAIM-01: Claim Registration**
>
> Doctors and clerks shall record court fee claims linked to a case, including:
> - Claim type (Travel, Attendance, Other)
> - Court (linked to the court entity)
> - Amount (currency)
> - Date sent
> - Date received
> - Status (Pending → Sent → Received → Paid)
> - Voucher/cheque number
>
> **FR-CLAIM-02: Claim Summary View**
>
> A filterable claim summary view showing all claims grouped by court, status, and date range.

**Justification:** The `Claim Summary` table exists in both the MLE and PM Access databases. Dr. Ameen's system actively tracks these alongside reports and court summons.

---

### NEW Section: 3.9 Contact and Communication Log

**[ADD]** 🔴 Entirely new functional requirement section. Dr. Ameen was emphatic about this:

> *"after 3-4 years, if I go to this table, I know what are the important communications that we have. We have never introduced this before. We know how to maintain this. That is one of the important findings that we have."*

> **FR-COMM-01: Contact Log**
>
> Authorized users (doctors, clerks) shall log communications linked to a specific case, including:
> - Contact person name and phone number
> - Reference (letter/fax reference number)
> - Contents (free text)
> - Actions taken (free text)
> - Timestamp (auto-generated)
> - Logged by (auto-captured from session)
>
> **FR-COMM-02: Quick-Log Interface**
>
> The system shall provide rapid contact logging with pre-filled options (e.g., "Phone call placed", "Letter sent", "Visit from police") to reduce typing burden for staff. Timestamp shall auto-insert on creation.

---

### 3.4 Document and Media Management (Pages 15-16)

#### FR-DOC-01: Document Upload

**[ADD]** 🟡 Dr. Ameen stores photos via folder paths and links:

> *"I am inserting photos through this... I am inserting the folders. So, I am inserting the photos. It loads this. So, again, I insert documents, so it will have the links."*

The new system should improve on this by storing files directly in the system rather than as external paths:

> **FR-DOC-01b:** The system shall store uploaded documents and photographs within its own managed storage (not as external file path references), ensuring portability and backup integrity.

**[ADD]** 🟡 Privacy for mobile photo uploads (from interview):

> **FR-DOC-01c:** When photographs are captured via the mobile application, images shall be uploaded directly to the server and **shall not be persisted to local device storage**. This addresses privacy requirements for using personal smartphones in the mortuary.

---

### 3.5 Notification and Communication System (Pages 15-16)

#### FR-NOTIF-01: In-System Notifications

**[ADD]** 🟡 Dr. Ameen described specimen-related notifications:

> *"This yellow colour means it's still not sent... these cases are here. 2025 cases also there. This is not sent yet."*

Add notification trigger:

> - Specimen not forwarded to lab within configurable period (default: 7 days)

---

### 3.7 Analytics and Reporting (Pages 16-17)

#### FR-RPT-01: Statistical Dashboard

**[ADD]** 🟡 Dr. Ameen uses **tags** for research filtering:

> *"I have put in small text, whatever thing we need... all the suicides occur in this field. So, I have put it here, suicide... all the deaths which occur with cardiovascular system. So, I'm putting a small tag here."*

> **FR-RPT-01b:** The system shall support **case tagging** with configurable keywords (e.g., suicide, cardiovascular, RTA, neonatal). Tags shall be selectable from a checkbox list maintained by administrators. Cases shall be filterable and searchable by tags for research and teaching purposes.

> **FR-RPT-01c:** Dr. Ameen uses the system for **teaching**: *"if I want to show a step. So, I search stamp injuries. All those cases come up."* The system shall support keyword-based case search with photo gallery view for educational use (subject to access controls).

---

## Section 4: Non-Functional Requirements (SRS Pages 18–20)

### 4.1 Security (Page 18)

**[ADD]** 🟡 Dr. Ameen raised concerns about doctor reluctance:

> *"even another doctor accessing their reports... they don't want us to go through their reports, but we should be able to."*

> **NFR-SEC-07:** The system shall enforce strict case-level access isolation by default — doctors can only view their own cases — with Super Administrator having read-only cross-case access. The audit log shall record every cross-case access event.

### 4.2 Performance (Page 19)

**[ADD]** 🟢 Dr. Ameen highlighted speed requirements for high-volume entry:

> *"they have to enter 50 cases in half an hour. It is very hard."*

> Performance requirement: Individual field auto-complete and lookup responses shall return within **500ms** to support rapid data entry workflows.

---

## Section 5: Use Cases (SRS Pages 21–24)

### UC-01: Register a New Clinical Forensic Case (Page 22)

**[MODIFY]** 🟡 Step 2 says *"User selects Outpatient."* Generalize:

> Step 2: User selects patient type (**Inward** or **Outpatient**). If Inward, user enters BHT number and ward.

### UC-04: Register Autopsy Case and Enter PMR (Page 23)

**[MODIFY]** 🟡 Add staged entry flow from Dr. Ameen's description:

> Step 1: **Mortuary worker** enters basic fields (morgue number, BHT, name/sex/age) upon body admission.
> Step 2: **Office clerk** enters police details, court details, and contact information.
> Step 3: Doctor uploads scanned inquest/court order, confirms preview.
> Step 4: Doctor performs PM, records voice, enters findings.
> *(remaining steps as current)*

### NEW Use Case: UC-06 — Record Body Release

**[ADD]** 🔴

| Field | Value |
|-------|-------|
| **Use Case ID** | UC-06 |
| **Name** | Record Body Release |
| **Actors** | Mortuary Worker, Clerk, Doctor |
| **Precondition** | Autopsy case registered. PM examination completed. |
| **Trigger** | Next of kin arrives to collect the body. |
| **Main Flow** | 1. Mortuary worker or Clerk opens case. 2. Enters NOK details. 3. Records release date/time, releasing technician. 4. Enters Death Certificate number. 5. Optionally records cemetery. 6. System marks body released; **case access for mortuary workers becomes read-only**. |
| **Postcondition** | Body release recorded. Case status updated. |

### NEW Use Case: UC-07 — File Court Fee Claim

**[ADD]** 🟡

| Field | Value |
|-------|-------|
| **Use Case ID** | UC-07 |
| **Name** | File Court Fee Claim |
| **Actors** | Doctor, Clerk |
| **Precondition** | Case exists. Doctor has dispatched a report or provided testimony. |
| **Trigger** | Doctor needs to claim travel/attendance reimbursement. |
| **Main Flow** | 1. User opens case. 2. Selects "Add Claim". 3. Enters claim type, court, amount. 4. Records date sent. 5. When payment received, records date and voucher/cheque number. 6. Status updates to "Paid". |
| **Postcondition** | Claim recorded and visible in the Claims Summary view. |

### NEW Use Case: UC-08 — Log Contact/Communication

**[ADD]** 🟡

| Field | Value |
|-------|-------|
| **Use Case ID** | UC-08 |
| **Name** | Log a Communication |
| **Actors** | Doctor, Clerk |
| **Precondition** | Case exists. |
| **Trigger** | Phone call, letter, or visit received about a case. |
| **Main Flow** | 1. User opens case. 2. Selects "Log Contact". 3. Selects communication type (phone call / letter / visit). 4. Enters contact person, number, contents, and actions. 5. Timestamp auto-captured. 6. Entry saved. |
| **Postcondition** | Communication logged against case. Searchable in the contact log. |

---

## Appendix B: MLEF Data Fields Reference (SRS Page 27)

**[EXPAND]** 🔴 Fields used in production but missing from Appendix B:

| Field Group | Fields to Add |
|-------------|---------------|
| **Department Reference** | CME Number (internal), SR Number (serial register), Case status, Completion date |
| **Patient Identity** | Contact number, Age as three integer fields (Years/Months/Days) |
| **Police Reference** | Police officer contact number |
| **Chain of Custody** | Produced By (who escorted the patient) |
| **Examining Officer** | Seen By (examining doctor), Doctor code (for auto-numbering) |
| **Court Reference** | Ordering court, Trial court — two separate fields |
| **Claims** | Travel claim date, Travel claim amount |

---

## NEW Appendix: Appendix D — Interview Insights Summary

**[ADD]** 🟢 Key operational insights from the interview with Dr. Ameen (creator of the existing Access DB system):

1. **PM numbering encodes metadata** — serial/month/case-type/doctor-code. The system must auto-generate this.
2. **Staged data entry** — mortuary workers enter 3 fields, office adds more, doctors complete. Not all users fill all fields.
3. **Auto-population is critical** — entering a police number should auto-fill station name and contact. Without this, 50 cases in 30 minutes is impossible.
4. **Contact log is one of the most important features** — Dr. Ameen considers it one of his key innovations for accountability.
5. **Specimen loss is a real problem** — specimens sit unforwarded for years. Visual status indicators (colour coding) are essential.
6. **Body release closes the case for mortuary** — access control should lock after release.
7. **COD rules engine** — phrase-to-bookmark matching for automated PM report generation. Doctors continuously develop the rules table.
8. **Report templates are context-sensitive** — neonatal, decomposed, skeletal remains each get different templates.
9. **Tags for research** — keyword tagging enables filtering for teaching and research.
10. **Privacy on mobile** — photos from smartphones must not persist to local storage.
11. **Doctors are reluctant** about cross-access — strict case isolation with audited admin override is essential.
12. **Different wards have different forms** — the system should provide a standardised format that can be distributed to wards.

---

## Summary of All Recommendations

| # | SRS Location | Type | Priority | Description |
|---|-------------|------|----------|-------------|
| 1 | §1.3 Scope | MODIFY | 🔴 | Include court fee claim tracking in scope |
| 2 | §1.4 Definitions | ADD | 🟡 | Add 11 missing acronyms (CME No, IQ, OS, etc.) |
| 3 | §2.2 Functions | ADD | 🔴 | Add functions #12 (claims) and #13 (contact log) |
| 4 | §2.3.2 Doctor role | ADD | 🟡 | Add claim filing, contact logging, COD rules capabilities |
| 5 | §2.3.3 Clerk role | ADD | 🟡 | Add claim management, contact log, body release, specimen tracking |
| 6 | §2.3.4 Lab Staff role | EXPAND | 🟡 | Add mortuary worker sub-role with staged entry and body release |
| 7 | §2.4 Environment | ADD | 🟢 | Power resilience, mobile privacy controls |
| 8 | §3.1 FR-AUTH-02 | EXPAND | 🔴 | Role-specific views, transferable super admin |
| 9 | §3.2 FR-CLIN-01 | EXPAND | 🔴 | Add 7 missing registration fields |
| 10 | §3.2 FR-CLIN-01 | MODIFY | 🔴 | Age as 3 integer fields (Y/M/D) |
| 11 | §3.2 FR-CLIN-01 | ADD | 🟡 | Auto-population, composite uniqueness, court distinction |
| 12 | §3.2 FR-CLIN-02 | EXPAND | 🟡 | OCR preview and read-only confirmation flow |
| 13 | §3.2 FR-CLIN-03 | EXPAND | 🔴 | Specimen lifecycle tracking with visual status indicators |
| 14 | §3.2 FR-CLIN-03 | ADD | 🟡 | Overdue specimen alerts |
| 15 | §3.2 FR-CLIN-04 | EXPAND | 🔴 | Independent report type tracking; context-sensitive templates |
| 16 | §3.2 FR-CLIN-05 | ADD | 🟡 | Additional register fields and visual status indicators |
| 17 | §3.3 FR-AUTO-01 | EXPAND | 🔴 | PM number format encoding; 9 additional fields; staged data entry |
| 18 | §3.3 NEW FR-AUTO-09 | ADD | 🔴 | Body release and NOK management with access lockdown |
| 19 | §3.3 FR-AUTO-05 | EXPAND | 🟡 | Specimen number, CT number, micro report |
| 20 | §3.3 FR-AUTO-06 | EXPAND | 🟡 | COD abbreviation lookup and rules engine |
| 21 | §3.3 FR-AUTO-07 | ADD | 🟡 | Additional PM registry fields with colour coding |
| 22 | NEW §3.8 | ADD | 🔴 | Court Fee Claim Management (FR-CLAIM-01/02) |
| 23 | NEW §3.9 | ADD | 🔴 | Contact/Communication Log (FR-COMM-01/02) |
| 24 | §3.4 FR-DOC-01 | ADD | 🟡 | Managed storage (not path refs); mobile photo privacy |
| 25 | §3.5 FR-NOTIF-01 | ADD | 🟡 | Overdue specimen forwarding notification |
| 26 | §3.7 FR-RPT-01 | ADD | 🟡 | Case tagging system; teaching search mode |
| 27 | §4.1 Security | ADD | 🟡 | Case isolation with audited admin override |
| 28 | §4.2 Performance | ADD | 🟢 | Auto-complete under 500ms for rapid entry |
| 29 | §5 UC-01 | MODIFY | 🟡 | Generalize patient type selection |
| 30 | §5 UC-04 | MODIFY | 🟡 | Add staged entry flow |
| 31 | §5 NEW UC-06 | ADD | 🔴 | Body Release use case |
| 32 | §5 NEW UC-07 | ADD | 🟡 | Court Fee Claim use case |
| 33 | §5 NEW UC-08 | ADD | 🟡 | Contact/Communication Log use case |
| 34 | Appendix B | EXPAND | 🔴 | Add missing MLEF data fields |
| 35 | NEW Appendix D | ADD | 🟢 | Interview insights summary |

**Total: 35 recommendations — 12 Critical, 17 Important, 6 Nice-to-have**
