You are tasked with generating a set of 40 multiple-choice English Language practice questions styled after the real BECE (Basic Education Certificate Examination) English paper, designed for educational assessment. The questions must be divided into four sections as follows:

- **Section A (50% of total questions):** Asks students: "From the alternatives lettered A to D, choose the one which most suitably completes each sentence." Examples include: "All work and no play makes Jack a dull boy, ______?", with options ["A. shan’t it", "B. isn’t it", "C. doesn’t it", "D. can’t it"]; "Where ______ Asana and Betty spending their next holidays?", with options ["A. is", "B. are", "C. were", "D. was"]; "______, learners must behave well.", with options ["A. The last but not least", "B. The last but not the least", "C. Last but not least", "D. Last but not the least"]. Cover topics such as verb tense, prepositions, gerunds, subjunctive mood, subject-verb agreement, conjunctions, adverbs, pronouns, question tags, conditional sentences, adjective order, and quantifiers.
- **Section B (15% of total questions):** Asks students: "Choose from the alternatives lettered A to D the one which is nearest in meaning (Synonyms) to the underlined word in each sentence." Examples include: "The <u>commotion</u> at the stadium was avoidable.", with options ["A. trouble", "B. confusion", "C. issue", "D. violence"]; "The robbers <u>ransacked</u> the house.", with options ["A. torched", "B. destroyed", "C. invaded", "D. looted"].
- **Section C (20% of total questions):** Asks students: "Choose from the alternatives lettered A to D the one that best explains the underlined group of words." Examples include: "I was informed <u>at the eleventh hour</u> about his decision to leave town. This means that I heard it", with options ["A. very late", "B. at eleven o’clock", "C. immediately", "D. in good time"]; "Samantha's main problem is that she <u>can see no further than her nose.</u> This means that Samantha", with options ["A. lacks foresight", "B. is easily deceived", "C. has a long nose", "D. cannot think"]; "When he lost his job, Yaro was left <u>to sink or swim.</u> This means that Yaro", with options ["A. had to find another job", "B. shouted for help", "C. had to survive on his own", "D. was depressed"]. Focus on idioms and figurative expressions.
- **Section D (15% of total questions):** Asks students: "Choose the one that is most nearly opposite in meaning (Antonyms) to the word underlined in each sentence." Examples include: "The story was written in <u>simple</u> language.", with options ["A. foreign", "B. strange", "C. local", "D. complex"]; "The <u>arrogant</u> storekeeper lost all his customers.", with options ["A. respectful", "B. obedient", "C. modest", "D. sympathetic"]; "The <u>unfavourable</u> weather affected their health.", with options ["A. beautiful", "B. pleasant", "C. cool", "D. promising"].

**Guidelines for Generation:**
- Use "______" to indicate blanks in sentences instead of other punctuation like "........".
- Structure each question as a JSON object with the following keys and their respective values:
  - "question_type": Always "objective".
  - "topic": Either "Grammar" (for Section A) or "Vocabulary" (for Sections B, C, D).
  - "subtopic": Specific subtopic (e.g., "Verb Tense", "Synonyms", "Idioms", "Antonyms").
  - "question": The question text with "______" for blanks in Section A or "<u>underlined</u>" for vocabulary focus words in Sections B, C, and D.
  - "options": An array of four options labeled "A.", "B.", "C.", and "D.".
  - "correct_answers": An array containing the correct option(s) (e.g., ["A. boring"]).
  - "model_answer": Always null.
  - "explanation": A brief explanation of why the correct answer is right and why others are wrong.
  - "hint": A short hint to guide the student toward the correct answer.
  - "difficulty": One of "Easy", "Medium", or "Hard".
  - "marks": Always 1.
  - "media_url": A placeholder URL (e.g., "https://example.com/english/[subtopic].jpg").
  - "media_type": Always "image".
  - "keywords": An array of relevant keywords (e.g., ["grammar", "verb tense", "conditional"]).
  - "learning_objectives": An array of learning goals (e.g., ["Apply present tense in conditionals", "Understand future outcomes"]).
  - "estimated_time": Always "2 minutes".
  - "source_reference": Always "WAEC Practice Materials".
  - "ai_feedback": A brief note on what the question tests.
- CRITICAL: Distribute correct answers evenly and randomly across all options (A, B, C, D) throughout the 40 questions. Avoid favoring any single position (e.g., not mostly A) or creating detectable patterns (e.g., repeating ABCD sequences or consistent placement every few questions). A balanced, randomized distribution is essential to maintain test fairness and ensure performance reflects true understanding, not test-taking strategies.
- Use realistic BECE-level language and contexts, avoiding overly complex or culturally specific references.
- The current date is June 03, 2025, and questions should feel relevant to this time.

**Output Format:**
Wrap the entire JSON array in a single <xaiArtifact> tag with the following attributes:
- artifact_id: A unique UUID (e.g., "5804693f-fe3e-47cc-a608-a94ac58425f6").
- artifact_version_id: A unique UUID (e.g., "06765942-bb10-4772-9d73-59ea378c38ea").
- title: "BECE English Language Practice Test 2025 - 40 Questions".
- contentType: "application/json".

Generate the content directly without additional commentary.