# Desk to Employee Mapping

This document contains the complete mapping of desk zones to assigned employees.

## Mapping Table

| Desk Zone | Employee Name | Status |
|-----------|---------------|---------|
| desk_01 | Safia Imtiaz | Active |
| desk_02 | Kinza Amin | Active |
| desk_03 | Aiman Jawaid | Active |
| desk_04 | Nimra Ghulam Fareed | Active |
| desk_05 | Summaiya Khan | Active |
| desk_06 | Arifa Dhari | Active |
| desk_07 | Khalid Ahmed | Active |
| desk_08 | Vacant | Vacant |
| desk_09 | Muhammad Arsalan | Active |
| desk_10 | Saadullah Khoso | Active |
| desk_11 | Muhammad Taha | Active |
| desk_12 | Muhammad Awais | Active |
| desk_13 | Nabeel Bhatti | Active |
| desk_14 | Abdul Qayoom | Active |
| desk_15 | Sharjeel Abbas | Active |
| desk_16 | Saad Bin Salman | Active |
| desk_17 | Sufiyan Ahmed | Active |
| desk_18 | Muhammad Qasim | Active |
| desk_19 | Sameer Panhwar | Active |
| desk_20 | Bilal Soomro | Active |
| desk_21 | Saqlain Murtaza | Active |
| desk_22 | Syed Hussain Ali Kazi | Active |
| desk_23 | Saad Khan | Active |
| desk_24 | Kabeer Rajput | Active |
| desk_25 | Mehmood Memon | Active |
| desk_26 | Ali Habib | Active |
| desk_27 | Bhamar Lal | Active |
| desk_28 | Atban Bin Aslam | Active |
| desk_29 | Sadique Khowaja | Active |
| desk_30 | Syed Awwab | Active |
| desk_31 | Samad Siyal | Active |
| desk_32 | Wasi Khan | Active |
| desk_33 | Kashif Raza | Active |
| desk_34 | Wajahat Imam | Active |
| desk_35 | Bilal Ahmed | Active |
| desk_36 | Muhammad Usman | Active |
| desk_37 | Arsalan Khan | Active |
| desk_38 | Abdul Kabeer | Active |
| desk_39 | Gian Chand | Active |
| desk_40 | Ayan Arain | Active |
| desk_41 | Zaib Ali Mughal | Active |
| desk_42 | Abdul Wassay | Active |
| desk_43 | Aashir Ali | Active |
| desk_44 | Ali Raza | Active |
| desk_45 | Muhammad Tabish | Active |
| desk_46 | Farhan Ali | Active |
| desk_47 | Tahir Ahmed | Active |
| desk_48 | Zain Nawaz | Active |
| desk_49 | Ali Memon | Active |
| desk_50 | Muhammad Wasif Samoon | Active |
| desk_51 | Vacant | Vacant |
| desk_52 | Sumair Hussain | Active |
| desk_53 | Natasha Batool | Active |
| desk_54 | Vacant | Vacant |
| desk_55 | Preet Nuckrich | Active |
| desk_56 | Vacant | Vacant |
| desk_57 | Vacant | Vacant |
| desk_58 | Konain Mustafa | Active |
| desk_59 | Muhammad Uzair | Active |
| desk_60 | Vacant | Vacant |
| desk_61 | Hira Memon | Active |
| desk_62 | Muhammad Roshan | Active |
| desk_63 | Syed Safwan Ali Hashmi | Active |
| desk_64 | Arbaz | Active |
| desk_65 | Muhammad Shakir | Active |
| desk_66 | Muneeb Intern | Active |

## Summary

- **Total Desks**: 66
- **Active Employees**: 58
- **Vacant Desks**: 8 (desk_08, desk_51, desk_54, desk_56, desk_57, desk_60)

## Usage in Code

This mapping is used in the `employees.service.js` file to convert desk zone detections into employee names:

```javascript
const DESK_EMPLOYEE_MAPPING = {
  "desk_01": "Safia Imtiaz",
  "desk_02": "Kinza Amin",
  // ... (complete mapping)
};
```

## Notes

- Vacant desks will show as "Person at desk_XX" in the system
- This mapping should be updated when desk assignments change
- The system uses this mapping to track employee attendance based on desk zone detections from Frigate API

## Last Updated

- Date: 2025-10-21
- Purpose: Corrected employee-to-desk assignments for accurate attendance tracking


