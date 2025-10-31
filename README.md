Hospital System 
 a backend system for a hospital that handles user signups, patient–doctor assignments, doctor note submissions, and dynamic scheduling of actionable steps based on live LLM processing. The system must secure sensitive data and use a live LLM to extract actionable steps—divided into a checklist (immediate tasks) and a plan (scheduled actions). New note submissions should cancel any existing actionable steps and create new ones.


 API Documentation: https://app.getpostman.com/join-team?invite_code=5f76b7a72d378cd6785a6f96b10d74ff0f723de7c02765e63c4d4e5b7a229511&target_code=e9d3124dcf42488feda998b85e83f1ca

 
 live url: https://hospital-system-llb9.onrend

full system design documentation: https://docs.google.com/document/d/1PJCQ7PUN7u6enrSFsf8bXGY9RJbNmB2vrRHqckXpWGM/edit?usp=sharing
 


**Justification for Scheduling & Note Processing**

Doctors can create encrypted medical notes for patients. In addition to storing the notes securely, the system also:
Extracts key insights: Using processDoctorNote(), the system extracts key action items and a treatment plan from the doctor’s note.
Schedules reminders for patients: Patients receive automated reminders based on the treatment plan.
Ensures doctor-patient relationship validation: The system checks if the doctor is authorized to create notes for a given patient.
Implementation Details
Checklist Generation: Extracts tasks from the doctor’s note and assigns a checklist to the patient.
Reminder Scheduling:
Extracts key dates from the treatment plan.
Creates scheduled reminders and stores them in a Reminder model.
Ensures reminders are added transactionally along with the note to maintain consistency.
When reminders are missed by the user, a reference is made to the Plan model. Each reminder has a plan model it belongs to during creation. The plan model has the following pairs 
   > startDateTime
   > endDateTIme
   > minutesBetweenReminders
From the plan model, we can determine the end date and time for the last scheduled reminder. So if a user misses a reminder, and the time past is greater than the minutes between reminder, we add the minutes between reminder to the last date and time for the reminders and schedule it . This way, missed reminders will be repeated without breaking the plan irrespective of whatever it is
