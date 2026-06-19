# FMDBS — Dr. Ameen Interview: System Analysis & Key Insights

> Interview with Dr. Ameen, creator of the existing Access DB system for the PM Registry
> Conducted by Team Tira-miss-u | June 2026
> Purpose: Understand how a production forensic medicine system operates

---

## 1. System Overview

Dr. Ameen built and maintains a Microsoft Access split-database system used at the Department of Forensic Medicine. It consists of:

- **PM Records NHK** — Post-mortem registry (66 fields in main table, 10 tables total)
- **MLE Records NHK** — Clinical medico-legal examination registry (36 fields, 7 tables)
- Both use a **frontend/backend split** — frontend `.accdb` contains forms and queries, backend `.accdb` stores the data
- Synced via **OneDrive** to the network; backup via a command script to another PC

The system is used daily by mortuary workers, office clerks, and doctors. It has **no role-based access control** — everyone accesses the same frontend.

---

## 2. PM Number Encoding System

The PM reference number encodes multiple pieces of metadata:

```
Format: [Serial] / [Month] . [CaseType] [DoctorCode]
Example: 1567/6.268 IQ AI
```

| Component | Meaning |
|-----------|---------|
| `1567` | Current serial number (continuous) |
| `/6` | Month indicator (June) |
| `.268` | Additional sequential number |
| `IQ` | **Case type:** IQ = Inquest, OS = Outside, DC = Death Certificate only (no PM) |
| `AI` | **Doctor code:** AI = Dr. Ameen, KE = another doctor |

> *"So, with this number, I am trying to identify this... If you are automating, but you are with the TATASA entering this number, they all get some time. They must get some wrong numbers."*

**Key insight for new system:** Auto-generate this number with configurable rules. Changing the doctor code auto-changes the doctor's serial number.

---

## 3. Staged Data Entry Workflow

Data entry happens in **three stages** by different roles:

### Stage 1: Mortuary Worker (at body admission)
- Morgue number
- BHT number
- Name, sex, age

> *"Usually, they enter only those three. Because at the moment of entry, they enter only these three."*

### Stage 2: Office Clerk (administrative details)
- Police station details
- Court information
- Phone numbers
- Documents and correspondence

> *"From the office, they will enter. This is the phone number."*

### Stage 3: Doctor (medical findings)
- Examination findings
- Cause of death
- Report generation
- Audio recordings

---

## 4. Auto-Population Features

Dr. Ameen built field auto-population to speed up data entry:

> *"When they enter that number, they have police station and they have mobile numbers. If it is already entered to the hospital or the military, it will come and come out. I don't want that kind of function [to be missing]. Otherwise, they have to enter in 50 cases in half an hour. It is very hard."*

**Implemented auto-fills:**
- Police officer number → station name + mobile number
- Doctor code in PM number → auto-changes serial number and doctor name
- BHT number → linked to existing hospital records

---

## 5. Uniqueness Constraints & Data Integrity

Dr. Ameen implemented specific uniqueness rules:

> *"BHT numbers are not... they should be able to duplicate the BHT number. So, I have coupled these two. The PM numbers and all I have made, this part is unique."*

- **BHT number alone:** Can duplicate (same patient, multiple cases)
- **BHT + PM number combined:** Must be unique
- **PM number (serial portion):** Enforced unique — cannot re-enter same number
- If a duplicate is attempted, user is forced to re-enter

---

## 6. Contact Log — "One of the Important Findings"

Dr. Ameen considers the communication log one of his most important innovations:

> *"After 3-4 years, if I go to this table, I know what are the important communications that we have. We have never introduced this before. We know how to maintain this. That is one of the important findings that we have."*

**Use cases for contact log:**
- Police call about a case — documented with name, time, content
- Letters sent to courts — tracked with reference numbers
- Family inquiries — logged for accountability
- Multiple communication entries per case over years

> *"I am asking them to inform them over the phones and letters and put it here. One day, if we have a problem, that whose fault it is, they can simply find out."*

---

## 7. Specimen / Investigation Tracking

### Colour-Coded Status System

| Colour | Meaning |
|--------|---------|
| **Yellow** | Specimen not yet sent to lab |
| **Normal** | Sent and pending results |
| **Completed** | Results received |

> *"This yellow colour means it's still not sent. Once they open, they also can see the yellow colour... Once they have sent it, they will get a reference number. Once they have the reference number and change the status as pending, this will be done."*

### Specimen Loss Problem

> *"Sometimes what happens is they get the samples after two years. Once I try to write the report, then try to write the results of the investigation, it has all completely lost."*

**Key insight:** The new system must alert when specimens are overdue for forwarding.

---

## 8. Report Generation System

### Context-Sensitive Templates

> *"If it is a neonator, I can see that if neonator is there, it will give a separate report. If it is decomposed, it is a different report. If it is skeleton, different report. If the boson is this one, it will give the findings related to the head."*

### COD Rules Engine (tblCODRules)

> *"I have a table with these other phrases. Electrocution, fall, head injury. If it is available in that given case, and it has to insert this text to this bookmark."*

The system matches phrases in the case data to bookmarks in Word document templates, auto-inserting text:
- **Phrase:** e.g., "electrocution"
- **Target Bookmark:** e.g., "CauseOfDeath_1a"
- **Insert Text:** e.g., pre-written paragraph about electrocution findings
- **Append Mode:** whether to append or replace
- **Priority:** for conflict resolution

> *"I keep on doing this. Now, I just insert a phrase. If it is anywhere in the post-mortem report, and then insert the word to this bookmark."*

### Visual Status in Registry

> *"These red colour changes are all the cases which I have photographs. So, I click that and I see that. So, I can show the students... by looking at it, you can get a summary. I have forwarded all the reports and all."*

---

## 9. Body Release Workflow

> *"Ultimately, they have to release the body. When releasing, to whom they are releasing, and after releasing only, the access should be closed to this case. Until that time, they have to have all this information because they may have missed the sample and they will take on the next day."*

**Key requirements:**
1. Body cannot be released until PM examination is complete
2. Release records: to whom (NOK), when, by which technician
3. Death Certificate number recorded
4. **After release: mortuary worker access is locked** — case becomes read-only for them
5. Samples must be accounted for before release (otherwise they take next day)

---

## 10. Tags for Research & Teaching

> *"I have put in small text, whatever thing we need... all the suicides occur in this field. So, I have put it here, suicide. All the deaths which occur with cardiovascular system. So, I'm putting a small tag."*

**Used for:**
- Filtering cases by category (suicide, cardiovascular, RTA)
- Teaching: *"if I want to show a step. So, I search stamp injuries. All those cases come up."*
- Research export (with anonymization requirements)

**Melbourne system reference:** Dr. Ameen described the Melbourne (Victoria) forensic system as having photographic similarity search across 100,000-200,000 photos — noted as aspirational.

---

## 11. Privacy & Security Concerns

### Doctor Reluctance

> *"Even they don't like, even another doctor accessing their reports... they don't want us to go through their reports, but we should be able to."*

**Resolution:** Strict case-level isolation (doctors see only own cases) with audited Super Admin read-only oversight.

### Mobile Photography Privacy

> *"Privacy thing, no. But if the clerk is doing it, we can configure it so they take a photo through the app. It doesn't get stored to their local storage."*

Photos must be uploaded directly to the server without persisting on the personal device.

### Data Sensitivity

> *"Since it is a public system, I cannot insert many things into this."*

Dr. Ameen maintains a separate personal copy with more sensitive documents. The new system should handle all documents in a single secure system with proper access controls.

---

## 12. Infrastructure & Practical Constraints

| Issue | Dr. Ameen's Comment |
|-------|---------------------|
| **UPS failures** | *"UPS is the issue. The night is suddenly, machine is switching off."* |
| **No standard ward forms** | Different wards use different formats for admission data |
| **Smartphone reliance** | Mortuary workers use personal phones; need app-based entry |
| **OneDrive backup** | Current backup is manual sync to OneDrive + scripted copy to another PC |
| **No internet guarantee** | System must work on hospital LAN without internet dependency |
| **Storage volume** | ~150-200 CDs worth of CT/photo data per unit; each CD ~1.5GB |

---

## 13. Dr. Ameen's Priorities for the New System

In order of emphasis during the interview:

1. **Role-based access control** — currently absent, explicitly requested
2. **Full case lifecycle tracking** — from body admission to body release
3. **Specimen forwarding monitoring** — visual status with overdue alerts
4. **Contact log** — for accountability over years
5. **Court summons tracking** — pending reports per court
6. **Automated report generation** — COD rules engine, context-sensitive templates
7. **Research tagging** — keyword filtering for teaching and research
8. **Data migration** — expressed interest but acknowledged as secondary
9. **Audio recording** — for PM examination voice notes

> *"Go through it and just don't think of different roles of other persons at all. Once you have made the application, then can you edit that, the different roles and all. First, can you make the full framework of whatever the software can do?"*

---

## 14. Differences Between Access DB System and SRS v1.0

| Feature | Access DB (Dr. Ameen) | SRS v1.0 | Gap |
|---------|----------------------|----------|-----|
| Claims management | Full Claim Summary table | Explicitly excluded | SRS needs revision |
| Contact log | Dedicated table, daily use | Not mentioned | SRS needs new section |
| Body release | 12+ fields | Not mentioned | SRS needs FR-AUTO-09 |
| RBAC | Binary IsAdmin only | 5 roles defined | SRS correctly addresses |
| Audit log | None | Required (FR-RPT-03) | SRS correctly addresses |
| Patient entity | None (duplicated per case) | Multi-case linkage required | SRS correctly addresses |
| Specimen lifecycle | Partial (no "discarded" in MLE) | Not detailed | Both need expansion |
| COD rules engine | Fully implemented | Vaguely mentioned | SRS needs specifics |
| Report templates | Context-sensitive (neonatal, etc.) | Not specified | SRS needs expansion |
| Audio recording | Partially (file links only) | Specified with transcription | SRS correctly addresses |
| Tags for research | Implemented via free-text tags | Partially covered | SRS needs tag system spec |
| Photo privacy (mobile) | Not addressed | Not addressed | Both need addition |
