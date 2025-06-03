You are tasked with generating a set of 40 multiple-choice Information and Communication Technology (ICT) practice questions styled after the real BECE (Basic Education Certificate Examination) ICT paper, designed for educational assessment. The questions must focus on the following specific topics: Basic Computer Operations, Input and Output Devices, Software Concepts, Internet and Web Technologies, Health and Safety in ICT, Data Representation and Storage, and ICT Terminology. 

Examples include: "In a spreadsheet application, when a user presses the tab key on the keyboard, the cursor moves", with options ["A. below the active cell.", "B. above the active cell.", "C. to the left of the active cell.", "D. to the right of the active cell."]; "Computer virus can also be classified as computer _____", with options ["A. firmware.", "B. liveware.", "C. software.", "D. hardware."]; "The process of putting the computer into a state of readiness for operation is referred to as", with options ["A. booting.", "B. loading.", "C. locating.", "D. starting."]; "One megabyte of data is approximately equal to", with options ["A. 1,000 bytes of data.", "B. 10,000 bytes of data.", "C. 100,000 bytes of data.", "D. 1,000,000 bytes of data."].

**Guidelines for Generation:**
- Structure each question as a JSON object with the following keys and their respective values:
  - "question_type": Always "objective".
  - "topic": Always "Information and Communication Technology".
  - "subtopic": One of the specified topics (e.g., "Basic Computer Operations", "Input and Output Devices", "Software Concepts", "Internet and Web Technologies", "Health and Safety in ICT", "Data Representation and Storage", "ICT Terminology").
  - "question": The question text, using "______" for blanks where applicable.
  - "options": An array of four options labeled "A.", "B.", "C.", and "D.".
  - "correct_answers": An array containing the correct option(s) (e.g., ["A. booting"]).
  - "model_answer": Always null.
  - "explanation": A brief explanation of why the correct answer is right and why others are wrong.
  - "hint": A short hint to guide the student toward the correct answer.
  - "difficulty": One of "Easy", "Medium", or "Hard".
  - "marks": Always 1.
  - "media_url": A placeholder URL (e.g., "https://example.com/ict/[subtopic].jpg").
  - "media_type": Always "image".
  - "keywords": An array of relevant keywords (e.g., ["ICT", "booting", "computer operations"]).
  - "learning_objectives": An array of learning goals (e.g., ["Understand computer startup processes", "Identify key ICT terms"]).
  - "estimated_time": Always "2 minutes".
  - "source_reference": Always "WAEC Practice Materials".
  - "ai_feedback": A brief note on what the question tests.
- CRITICAL: Distribute correct answers evenly and randomly across all options (A, B, C, D) throughout the 40 questions. Avoid favoring any single position (e.g., not mostly A) or creating detectable patterns (e.g., repeating ABCD sequences or consistent placement every few questions). A balanced, randomized distribution is essential to maintain test fairness and ensure performance reflects true understanding, not test-taking strategies.
- Use realistic BECE-level language and contexts, avoiding overly complex or culturally specific references.
- Ensure questions cover all specified topics: Basic Computer Operations (e.g., booting, file management), Input and Output Devices (e.g., keyboard, monitor), Software Concepts (e.g., types of software, viruses), Internet and Web Technologies (e.g., URLs, browsers), Health and Safety in ICT (e.g., ergonomic issues), Data Representation and Storage (e.g., bytes, storage devices), and ICT Terminology (e.g., shortcuts, jargon).
- The current date is June 03, 2025, and questions should feel relevant to this time.

**Output Format:**
Wrap the entire JSON array in a single <xaiArtifact> tag with the following attributes:
- artifact_id: A unique UUID (e.g., "5804693f-fe3e-47cc-a608-a94ac58425f6").
- artifact_version_id: A unique UUID (e.g., "06765942-bb10-4772-9d73-59ea378c38ea").
- title: "BECE ICT Practice Test 2025 - 40 Questions".
- contentType: "application/json".

Generate the content directly without additional commentary.