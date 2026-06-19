# FMDBS — Access DB vs SRS Gap Analysis

> Analysis by Antigravity | June 2026
> **Sources:** `MLE Records NHK_be (1).accdb` · `PM Records NHK_be (1).accdb` · `FMDBS_SRS_Tira-miss-u.pdf v1.0`

---

## 1. Overview of What Exists

The repository contains two **split-database** Microsoft Access applications:

| File Pair | Purpose | Tables |
|-----------|---------|--------|
| `MLE Records NHK MAC.accdb` (frontend) | UI / forms / queries only | 0 user tables |
| `MLE Records NHK_be.accdb` (backend) | Actual data store | **7 tables** |
| `PM Records NHK MAC.accdb` (frontend) | UI / forms / queries only | 0 user tables |
| `PM Records NHK_be.accdb` (backend) | Actual data store | **10 tables** |

Both frontends list named queries that act as named views: `Claim Summary`, `Contact Log`, `Documents`, `MLE Records`, `Photos`, `Reports`, `Samples` (MLE); `Claims Summary`, `Contact Log`, `Documents`, `Investigations PM`, `PM Records`, `Photos`, `Reports`, `tblCODAbbreviations`, `tblCODRules`, `tblUsers` (PM).

---

## 2. Extracted Schema Summary

### 2.1 MLE (Clinical) Backend — 7 Tables

#### `MLE Records` — Core clinical case table (36 fields)
| Field | Type | Notes |
|-------|------|-------|
| ID | Integer | Auto PK |
| CME_No | Text(255) | **Primary case reference** |
| MLEF_No | Text(255) | Police-issued MLEF number |
| BHT_No | Text(250) | Bed Head Ticket |
| Full_Name | Text(255) | Patient name |
| Address | Text(250) | |
| Sex | Text(6) | |
| Age_Years | Text(255) | Stored as text, not numeric |
| Examined_date | Date/Time | NOT NULL |
| Category | Text(50) | Case type |
| Date_of_Trial | Date/Time | Court date |
| Courts | Text(255) | |
| Police | Text(255) | Police station |
| Summoned | Text(255) | Summons reference |
| Place | Text(255) | Place of examination |
| Age_Days | Text(255) | |
| Produced_BY | Text(255) | Who produced the patient |
| Seen_BY | Text(255) | Examining doctor |
| Age_Months | Text(255) | |
| Evidence | Text(255) | |
| Case_No | Text(255) | |
| MLEF_Status | Text(255) | |
| Contact_No | Text(255) | Patient contact |
| Evidence_Claim | Text(255) | |
| Completed_ON | Date/Time | |
| SR_No | Text(255) | Serial/register number |
| Contact_No_Police | Text(255) | |
| Tags | Memo | Free-text tags |
| MLRGeneratedOn | Date/Time | |
| TRClaim_Date | Date/Time | Travel claim date |
| TRClaim_Amount | Currency | Travel claim amount |
| Summon_Received_ON | Date/Time | |
| Hurt | Memo | Free-text injury description |
| TOXGeneratedOn | Date/Time | Toxicology report generated |
| STIGeneratedOn | Date/Time | STI report generated |
| PSYCHGeneratedOn | Date/Time | Psychiatry report generated |

#### `Contact Log` — Communications log (8 fields)
`CME_No`, `Reference`, `Contents` (Memo), `Actions` (Memo), `Date_Log`, `Full_Name`, `Contact_No`

#### `Documents` — Scanned document file references (5 fields)
`CME_No`, `FilePath`, `FileName`, `FileType`

#### `Photos` — Photo file references (5 fields)
`CME_No`, `FilePath`, `FileName`, `FileType`

#### `Reports` — Report dispatch tracking (12 fields)
`CME_No`, `Full_Name`, `Reports_TO`, `Reports_Via`, `Reports_Date`, `Reports_Certificate`, `MLEF_No`, `RC_No`, `Claim_Reports`, `Claim_SentON`, `Claim_ReceivedON`

#### `Samples` — Investigation/specimen table (9 fields)
`CME_No`, `Full_Name`, `Date_Sampled`, `Specimen`, `Sent_TO`, `Results`, `MLEF_No`, `Ix_No`

#### `Claim Summary` — Financial claims table (8 fields)
`High_Courts`, `Type`, `Amount` (Currency), `Sent_On`, `Received_On`, `Claim_Status`, `Voucher`

---

### 2.2 PM (Autopsy) Backend — 10 Tables

#### `PM Records` — Core autopsy case table (66 fields)
Key fields beyond MLE equivalents:
| Field | Type | Notes |
|-------|------|-------|
| PM_No | Text(255) | Primary autopsy reference |
| Case_No | Text(50) | Inquest/court case number |
| Morgue_No | Text(255) | |
| Name_of_Deceased | Text(255) | |
| COD | Text(250) | Cause of death (primary) |
| COD_1b/1c/1d | Text(255) | WHO antecedent/contributory causes |
| COD_2 | Text(255) | Other significant conditions |
| Verdict | Text(255) | Accident/suicide/natural/open |
| Done_BY | Text(255) | Examining doctor |
| Date_of_MorAdm | Date/Time | Morgue admission date |
| Time_of_MorAdm | Date/Time | Morgue admission time |
| Date_of_Adm | Date/Time | Hospital admission |
| Time_of_Adm | Date/Time | |
| Date_of_Death | Date/Time | |
| Time_of_Death | Date/Time | |
| PHN_No | Text(255) | Preliminary hospital number |
| NOK | Text(255) | Next of Kin |
| Relationship | Text(255) | |
| NIC | Text(255) | Deceased NIC |
| Date_BR | Date/Time | Body release date |
| Time_BR | Date/Time | |
| Tech_BR | Text(255) | Technician for body release |
| DC_No | Text(255) | Death certificate number |
| Tech_1, Tech_2 | Text(255) | Assisting technicians |
| Cemetery | Memo | |
| Mode | Text(255) | Mode of death |
| Storage | Text(255) | Body storage details |
| DD_No | Text(255) | |
| Religion | Text(255) | |
| Police_Officer | Text(255) | |
| Evidence/Evidence_Claim | Text(255) | |
| TrialCourts/TrialCase_No | Text(255) | Trial court details |
| CODGeneratedOn, TOXGeneratedOn, PMRGeneratedOn, HISTOGeneratedOn, MICROGeneratedOn | Date/Time | Report generation timestamps |

#### `Investigations PM` — Specimens and lab investigations (13 fields)
Extends MLE Samples: adds `Discarded_On`, `Date_Results`, `Specimen_No` (Integer), `CT_No`

#### `tblCODAbbreviations` — COD abbreviation lookup
`Abbreviation`, `FullText`, `IsActive`, `Area`

#### `tblCODRules` — Automated COD template-filling rules
`Phrase`, `TargetBookmark`, `InsertText`, `AppendMode`, `Priority`, `IsActive`

#### `tblUsers` — User authentication table
`UserID`, `Username`, `Password` (Text 255), `DoctorName`, `IsAdmin` (Boolean), `IsActive` (Boolean)

#### `Contact Log`, `Documents`, `Photos`, `Reports`, `Claims Summary`
Equivalent to MLE counterparts; `Reports` uses `PM_No` as foreign key, `Contact Log` adds `Contact_Person` field, `Claims Summary` has `Cheque_No` instead of `Voucher`.

---

## 3. Gaps: What the Access DB Has That the SRS Lacks or Under-specifies

### 3.1 Financial / Claims Management (Entire domain missing from SRS)
The Access DB has a full **claims management subsystem** absent from the SRS:

| Access DB Field | Meaning |
|-----------------|---------|
| `TRClaim_Date`, `TRClaim_Amount` | Travel reimbursement claims made by doctors to courts |
| `Claim Summary` table | Tracks claims sent to High Courts with `Type`, `Amount`, `Sent_On`, `Received_On`, `Claim_Status`, `Voucher`/`Cheque_No` |
| `Reports.Claim_Reports`, `Claim_SentON`, `Claim_ReceivedON` | Claim lifecycle tracking per report |
| `Claims Summary.Claim_Status` | Whether a claim was paid/pending/rejected |

> **SRS Improvement needed:** The SRS explicitly states the system "will NOT manage financial transactions" — but the real-world workflow **does** involve court fee claims by forensic doctors. The SRS should either formally include a lightweight **Court Claim Tracking** module, or at minimum acknowledge this as a future consideration. The existing Access DB proves this is an active, daily-use feature.

---

### 3.2 Contact Log / Communication History
The Access DB has a dedicated `Contact Log` table for both MLE and PM:

| Field | Description |
|-------|-------------|
| `Reference` | Communication reference |
| `Contents` (Memo) | Full text of communication |
| `Actions` (Memo) | Actions taken |
| `Date_Log` (auto-timestamped) | When logged |
| `Full_Name`, `Contact_No` | Who contacted |

> **SRS Gap:** FR-NOTIF covers outgoing notifications only. There is no requirement for **incoming communication logging** — i.e., recording phone calls, walk-ins, or correspondence received from families, police, or courts about a case. The Access DB shows this is a real operational need. The SRS should add a `FR-COMM` requirement for a case-linked contact/communication log.

---

### 3.3 Age Stored as Three Separate Text Fields
The Access DB stores age as `Age_Years` (Text!), `Age_Months` (Text), `Age_Days` (Text) — all as `Text(255)`.

> **SRS Gap:** Appendix B lists `Age` as a single field. The SRS should specify:
> - Age shall be stored as Years/Months/Days (three integer fields) — because forensic age estimation of children often requires sub-year precision.
> - Age should be **Integer**, not Text. The Access DB's use of Text creates data quality risks (e.g., "3 years" vs "3" vs "3yrs" all valid).

---

### 3.4 Produced_BY / Seen_BY Fields (Chain of Custody)
The MLE Records table tracks:
- `Produced_BY` — who brought the patient (police officer?)
- `Seen_BY` — which doctor examined them

> **SRS Gap:** FR-CLIN-01 captures the examining doctor but does not specify tracking **who produced/brought the patient** (typically a police officer escorting the person). This is a chain-of-custody detail with legal significance. The SRS should capture this as a required field under FR-CLIN-01.

---

### 3.5 Multiple Report Generation Timestamps
Both DB backends track **separate generation timestamps** per report type:
- `MLRGeneratedOn`, `TOXGeneratedOn`, `STIGeneratedOn`, `PSYCHGeneratedOn` (MLE)
- `CODGeneratedOn`, `TOXGeneratedOn`, `PMRGeneratedOn`, `HISTOGeneratedOn`, `MICROGeneratedOn` (PM)

> **SRS Improvement:** The SRS treats report generation monolithically (FR-CLIN-04: "Generate Report"). The real system needs to independently track when each report type (Toxicology, Histology, Psychiatry, STI, MLR, COD, PMR, Microbiology) was generated. The SRS should define each report type as a distinct tracked document with its own `GeneratedOn`, `DispatchedOn`, and `ReceivedOn` timestamps.

---

### 3.6 Specimen / Investigation Discarding
The `Investigations PM` table has a `Discarded_On` field — indicating specimens are formally discarded after a period.

> **SRS Gap:** There is no requirement covering **specimen lifecycle management** — i.e., logging when a specimen is sent, when results come back (`Date_Results`), and when the specimen is formally discarded. This should be added under FR-AUTO-05.

---

### 3.7 Next-of-Kin (NOK) and Body Release (PM only)
The PM Records table has a cluster of body release fields completely absent from the SRS:

| Field | Meaning |
|-------|---------|
| `NOK`, `Relationship` | Next of kin details |
| `NIC` | Deceased's NIC |
| `Date_BR`, `Time_BR` | Body release date/time |
| `Tech_BR` | Technician who released the body |
| `DC_No` | Death certificate number |
| `Cemetery` | Where buried/cremated |
| `Mode` | Mode of death delivery context |
| `Storage`, `DD_No` | Body storage and DD number |
| `Religion` | For religious rites at release |

> **SRS Gap:** FR-AUTO-01 (Autopsy Case Registration) does not include **body release workflow** — which is a major operational post-autopsy step. The SRS should add a `FR-AUTO-09: Body Release and Next-of-Kin Management` requirement covering: NOK details, body release authorization, Death Certificate number, storage, and religious considerations.

---

### 3.8 Magistrate Court vs High Court Distinction
`Claim Summary.High_Courts` implies claims are specifically sent to High Courts, while `MLE Records.Courts` tracks the trial court. The PM table has both `Courts` (inquest) and `TrialCourts` (subsequent trial).

> **SRS Gap:** FR-CLIN-01 lists "Court" as a single field. The SRS should distinguish between:
> 1. **Ordering court** (magistrate court that issued the MLEF/inquest order)
> 2. **Trial court** (where the doctor is eventually summoned to testify — may be a High Court)

---

### 3.9 COD Rules Engine (Autopsy)
`tblCODRules` is a rules engine for auto-populating cause-of-death templates based on phrase matching — a sophisticated feature the SRS does not describe at all.

> **SRS Improvement:** FR-AUTO-06 says the COD form shall be "auto-generated using the Health Ministry template." The SRS should specify that the system uses a **configurable COD phrase-to-template mapping** (i.e., the doctor types/selects a COD phrase, and the system maps it to the correct WHO ICD-coded form field). This is real and tested in the Access DB.

---

### 3.10 Password Security
`tblUsers.Password` is stored as `Text(255)` — plaintext in the Access DB.

> **SRS correctly requires** bcrypt/Argon2 hashing (NFR-SEC-01). **However**, the SRS should explicitly note that the Access DB's legacy plaintext password storage is a known deficiency and migration of credentials will require forced password resets at go-live.

---

## 4. Gaps: What the SRS Specifies That Is Missing From the Access DB

### 4.1 Role-Based Access Control (RBAC)
The `tblUsers` table only has `IsAdmin` (Boolean) — two roles: admin and non-admin. The SRS defines **5 distinct roles** (Super Admin, Doctor, Clerk, Lab Staff, Photographer).

> The Access DB is far too coarse. The new DB needs a proper `Role` field (or a roles table with many-to-many user-role mapping) to support the SRS's RBAC model.

---

### 4.2 Audit Log
No `AuditLog` table exists in either Access DB.

> The SRS (FR-RPT-03, NFR-SEC-04) requires comprehensive audit logging. Needs a new table: `AuditLog(id, timestamp, user_id, action, table_name, record_id, old_value, new_value, ip_address)`.

---

### 4.3 Patient Profile (Multi-case Linkage)
The SRS states (FR-CLIN-01): *"One patient may have multiple forensic cases; the system shall link all cases to that patient's profile."*

The Access DB has no `Patient` entity — each MLE/PM record is self-contained with name/address duplicated per case.

> A normalized `Patient` table is needed, with cases linked via `patient_id`.

---

### 4.4 Referral Status Lifecycle
UC-02 defines referral states: **Pending → Completed** with document upload triggering state change and read-only lock.

The Access DB `Samples` table has no `status` field — only `Results`. There is no referral-specific table in the MLE DB (referrals appear to be tracked via `Samples`/`Contact Log` informally).

> A proper `Referrals` table is needed with: `referral_type`, `referred_to_department`, `referred_doctor`, `referral_date`, `status`, `document_path`, `completed_on`.

---

### 4.5 Audio Recording and Transcript
FR-AUTO-04 and Product Function #4 require audio recording during PM and transcript generation.

No audio recording, storage, or transcript field exists in either Access DB — this is an entirely new capability.

---

### 4.6 Notification System
No notification or scheduling tables exist in the Access DB. The SRS requires:
- In-system notifications (FR-NOTIF-01)
- SMS/WhatsApp notifications (FR-NOTIF-02)
- Court date reminders (7-day, 3-day, 1-day)

New tables needed: `Notifications`, `NotificationConfig`, `SMSLog`.

---

### 4.7 Document Versioning
FR-DOC-03 requires version history for documents. The Access DB `Documents` table is a flat single-record-per-file store with no `version`, `previous_version_id`, or `uploaded_by` fields.

---

### 4.8 CME_No as Primary Key (Denormalization Risk)
The Access DB uses `CME_No` (Text) as the join key across all related tables — but it is not defined as a formal foreign key constraint in the schema (ADODB shows no referential integrity). It also appears to duplicate `MLEF_No` in some tables.

> The SRS should clarify and standardize: use a surrogate integer PK internally, with `CME_No` / `MLEF_No` / `PM_No` as business-layer unique identifiers. The new PostgreSQL schema must enforce FK constraints.

---

## 5. Structural Recommendations for SRS

| # | Recommendation | Priority |
|---|---------------|----------|
| 1 | Add `FR-CLAIM`: Court claim tracking (doctor fee claims per case) | High — active operational need |
| 2 | Add `FR-COMM`: Case-linked contact/communication log | High — active operational need |
| 3 | Add `FR-AUTO-09`: Body release and NOK management | High — active operational need |
| 4 | Clarify age storage as 3 integer fields (Years/Months/Days) in Appendix B | High |
| 5 | Add chain-of-custody field `Produced_By` to FR-CLIN-01 | Medium |
| 6 | Expand FR-CLIN-04 / FR-AUTO-08 to list all report types with independent timestamps | Medium |
| 7 | Add `FR-AUTO-05` specimen lifecycle (sent → results → discarded) | Medium |
| 8 | Distinguish ordering court vs trial court in FR-CLIN-01 / FR-AUTO-01 | Medium |
| 9 | Describe COD rules/phrase engine in FR-AUTO-06 | Medium |
| 10 | Add explicit note on credential migration from legacy plaintext Access DB | Medium |
| 11 | Add `FR-AUTH-04`: Role table with 5 roles replacing binary IsAdmin flag | High |
| 12 | Add `FR-RPT-03` audit log table schema to technical appendix | High |
| 13 | Add normalized `Patient` entity to data model (multi-case linkage) | High |
| 14 | Add `Referrals` table spec with status lifecycle to FR-CLIN-03 | High |
| 15 | Add audio recording storage schema to FR-AUTO-04 | Medium |
| 16 | Add document versioning schema to FR-DOC-03 | Medium |

---

## 6. Fields Present in Access DB Not in SRS Appendix B (MLEF Data Fields)

The following fields exist operationally but are not listed in Appendix B of the SRS:

| Field | DB Table | Missing from SRS |
|-------|----------|-----------------|
| `SR_No` | MLE Records | Serial register number |
| `Produced_BY` | MLE Records | Who brought the patient |
| `Age_Days`, `Age_Months` | MLE Records | Sub-year age precision |
| `Evidence`, `Evidence_Claim` | MLE Records | Physical evidence tracking |
| `Contact_No_Police` | MLE Records | Police contact number |
| `Hurt` (Memo) | MLE Records | Full injury free-text |
| `MLEF_Status` | MLE Records | Case status field |
| `Completed_ON` | MLE Records | When case was finalised |
| All claim fields (`TRClaim_*`) | MLE Records | Travel claim fields |
| `NOK`, `Relationship` | PM Records | Next of kin |
| `Cemetery`, `Religion`, `Mode` | PM Records | Body release fields |
| `DC_No` | PM Records | Death certificate number |
| `Tech_1`, `Tech_2`, `Tech_BR` | PM Records | Assisting technicians |
| `Storage`, `DD_No` | PM Records | Body storage tracking |
| `PHN_No` | PM Records | Preliminary hospital number |
| `CT_No` | Investigations PM | CT scan tracking |
| `Specimen_No` | Investigations PM | Specimen count |
| `Discarded_On`, `Date_Results` | Investigations PM | Specimen lifecycle |
| `Contact_Person` | PM Contact Log | Named contact person |
