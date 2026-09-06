export interface LessonContent {
  title: string
  conceptText: string
  snippet: string
  question: string
  options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[]
  answerId: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

export interface ChallengeContent {
  title: string
  briefing: string
  starterCode: string
  tests: { input: string; expectedOutput: string; isHidden: boolean }[]
}

export interface QuestContent {
  title: string
  lore: string
  instructions: string[]
  starterCode: string
  tests: { input: string; expectedOutput: string; isHidden: boolean }[]
}

export const LESSON_CONTENT: Record<string, LessonContent> = {
  // --- PYTHON CHAPTERS ---
  'python-ch1-lesson1': {
    title: 'Variables & Data Types',
    conceptText: 'In Python, a variable is created the moment you first assign a value to it. There is no need to declare its type. Think of it as a labeled box where you can store data like text (strings) or numbers (integers, floats).',
    snippet: `name = "Alex"
age = 25
is_coder = True
print(name, "is", age)`,
    question: 'How do you create a variable named `score` and set it to 100 in Python?',
    options: [
      { id: 'A', text: 'int score = 100' },
      { id: 'B', text: 'score = 100' },
      { id: 'C', text: 'var score = 100' },
      { id: 'D', text: 'score : 100' },
    ],
    answerId: 'B',
    explanation: 'Python is dynamically typed and doesn\'t require keywords like int or var to declare variables.',
  },
  'python-ch2-lesson1': {
    title: 'Strings & Number Operations',
    conceptText: 'Python makes string manipulation easy. You can combine strings using + or inject variables directly using f-strings. You can also perform mathematical operations just like a calculator.',
    snippet: `hero = "Alex"
health = 100
health -= 20
print(f"{hero} has {health} HP left!")`,
    question: 'What is the correct syntax for an f-string?',
    options: [
      { id: 'A', text: 'f"Hello {name}"' },
      { id: 'B', text: '"Hello {name}".format()' },
      { id: 'C', text: 'f("Hello name")' },
      { id: 'D', text: 'format"Hello {name}"' },
    ],
    answerId: 'A',
    explanation: 'Placing an "f" right before the string quotes allows you to embed variables directly using curly braces {}.',
  },
  'python-ch3-lesson1': {
    title: 'Conditionals & Logic',
    conceptText: 'Programs need to make decisions. The `if` statement checks a condition. If it is true, the indented code runs. You can use `elif` and `else` to provide alternative paths.',
    snippet: `level = 5
if level >= 10:
    print("Master")
elif level >= 5:
    print("Apprentice")
else:
    print("Novice")`,
    question: 'Which of the following is true if the level is 5?',
    options: [
      { id: 'A', text: 'It prints Master' },
      { id: 'B', text: 'It prints Novice' },
      { id: 'C', text: 'It prints Apprentice' },
      { id: 'D', text: 'It causes an error' },
    ],
    answerId: 'C',
    explanation: 'Since level >= 10 is false, it checks level >= 5, which is true, printing Apprentice.',
  },
  'python-ch4-lesson1': {
    title: 'The While Loop: Repeating with Purpose',
    conceptText: 'A while loop repeats a block of code as long as a specified test condition evaluates to True. When the condition evaluates to False, the loop stops immediately.',
    snippet: `count = 3
while count > 0:
    print("Countdown:", count)
    count -= 1
print("Blast off!")`,
    question: 'What happens if you forget to decrease `count` inside the loop?',
    options: [
      { id: 'A', text: 'The program skips the loop.' },
      { id: 'B', text: 'The loop runs forever (Infinite Loop).' },
      { id: 'C', text: 'Python automatically stops after 10 loops.' },
      { id: 'D', text: 'It prints "Blast off!" immediately.' },
    ],
    answerId: 'B',
    explanation: 'Without count -= 1, count remains 3 forever. The condition count > 0 is always true, resulting in an infinite loop.',
  },

  // --- JS CHAPTERS ---
  'js-ch1-lesson1': {
    title: 'Variables: let & const',
    conceptText: 'In modern JavaScript, we use `const` for variables that should not change, and `let` for variables that will be updated later. (Avoid using the old `var` keyword).',
    snippet: `const heroName = "Lumi";
let hp = 100;
hp = hp - 10;
console.log(heroName + " has " + hp + " HP");`,
    question: 'What happens if you try to reassign a `const` variable?',
    options: [
      { id: 'A', text: 'It updates normally' },
      { id: 'B', text: 'It is ignored silently' },
      { id: 'C', text: 'It throws a TypeError' },
      { id: 'D', text: 'It becomes undefined' },
    ],
    answerId: 'C',
    explanation: 'Variables declared with const cannot be reassigned; trying to do so results in a TypeError.',
  },
  'js-ch2-lesson1': {
    title: 'Arrow Functions',
    conceptText: 'Arrow functions provide a more concise syntax for writing function expressions. They are especially useful for callbacks.',
    snippet: `const add = (a, b) => {
  return a + b;
};

// Shorthand for single returns:
const double = x => x * 2;`,
    question: 'Which is a valid shorthand arrow function?',
    options: [
      { id: 'A', text: 'const fn = x => { x * 2 }' },
      { id: 'B', text: 'const fn = x -> x * 2' },
      { id: 'C', text: 'const fn = x => x * 2' },
      { id: 'D', text: 'fn(x) => x * 2' },
    ],
    answerId: 'C',
    explanation: 'If there are no curly braces, the arrow function implicitly returns the expression immediately following the arrow.',
  },
  'js-ch3-lesson1': {
    title: 'Arrays & Map',
    conceptText: 'JavaScript arrays have built-in methods. `.map()` is incredibly powerful: it creates a new array populated with the results of calling a provided function on every element.',
    snippet: `const numbers = [1, 2, 3];
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6]`,
    question: 'What does map() return?',
    options: [
      { id: 'A', text: 'The original array modified' },
      { id: 'B', text: 'A completely new array' },
      { id: 'C', text: 'A single value (number)' },
      { id: 'D', text: 'Undefined' },
    ],
    answerId: 'B',
    explanation: '.map() does not mutate the original array, it always returns a brand new array.',
  },
}

// Fallback generator for missing lessons
export const getLessonContent = (id: string): LessonContent => {
  if (LESSON_CONTENT[id]) return LESSON_CONTENT[id]
  return {
    title: 'Introductory Concepts',
    conceptText: 'Welcome to this module. Here you will learn the fundamental building blocks of this technology and how it fits into the broader ecosystem.',
    snippet: `// Welcome to the sandbox\nconsole.log("Ready to learn!");`,
    question: 'Are you ready to proceed?',
    options: [
      { id: 'A', text: 'Yes' },
      { id: 'B', text: 'Definitely' },
      { id: 'C', text: 'Absolutely' },
      { id: 'D', text: 'Let\'s go' },
    ],
    answerId: 'A',
    explanation: 'Great enthusiasm! Any choice represents readiness.',
  }
}

export const CHALLENGE_CONTENT: Record<string, ChallengeContent> = {
  // PYTHON
  'python-ch1-ex01': {
    title: 'Fix the Variables',
    briefing: 'Declare two variables: `name` (a string) and `score` (an integer). Then print them out separated by a space.',
    starterCode: `# Declare name and score here

print(name, score)`,
    tests: [{ input: '', expectedOutput: 'Alex 100', isHidden: false }] // Note: Will require specific values or we mock it. Let's assume name='Alex' score=100
  },
  'python-ch4-ex01': {
    title: 'Countdown Loop',
    briefing: 'Write a while loop that counts down from 3 to 1. On each iteration, print "Count: [number]". Then print "Go!".',
    starterCode: `count = 3
# Write your while loop here

print("Go!")`,
    tests: [
      { input: '', expectedOutput: 'Count: 3\nCount: 2\nCount: 1\nGo!', isHidden: false }
    ]
  },
  
  // JS
  'js-ch1-ex01': {
    title: 'Constants and Lets',
    briefing: 'Declare a const `hero` with the value "Lumi". Declare a let `level` with value 1. Then print them.',
    starterCode: `// Write your code here

console.log(hero, level);`,
    tests: [{ input: '', expectedOutput: 'Lumi 1', isHidden: false }]
  }
}

export const getChallengeContent = (id: string): ChallengeContent => {
  if (CHALLENGE_CONTENT[id]) return CHALLENGE_CONTENT[id]
  return {
    title: 'Basic Challenge',
    briefing: 'Write code that prints "Success" to the console to pass this challenge.',
    starterCode: `// Print "Success"\n`,
    tests: [{ input: '', expectedOutput: 'Success', isHidden: false }]
  }
}

export const QUEST_CONTENT: Record<string, QuestContent> = {
  // PYTHON
  'python-ch1-quest01': {
    title: 'The First Gateway',
    lore: 'The gates to the mainframe are locked. You must provide the exact security sequence by declaring the correct access variables to override the lock.',
    instructions: [
      'Create a variable called `access_code` and set it to 999.',
      'Create a variable called `user` and set it to "admin".',
      'Print the user and access_code separated by a space.'
    ],
    starterCode: `def unlock_gate():
    # Your code here
    pass

unlock_gate()`,
    tests: [{ input: '', expectedOutput: 'admin 999', isHidden: false }]
  },
  'python-ch4-quest01': {
    title: 'The Reactor Countdown',
    lore: 'The core reactor is destabilizing! We need an automated script to initiate the emergency lockdown sequence. Time is running out.',
    instructions: [
      'Create a function called `countdown(n)`',
      'Use a while loop to print the countdown from `n` to 1.',
      'After the loop, print "Lockdown initiated!"'
    ],
    starterCode: `def countdown(n):
    # Your code here
    pass

countdown(3)`,
    tests: [{ input: '', expectedOutput: '3\n2\n1\nLockdown initiated!', isHidden: false }]
  },

  // JS
  'js-ch1-quest01': {
    title: 'Initializing the Web App',
    lore: 'The client portal is down! You need to initialize the global variables for the emergency backup system before it goes offline permanently.',
    instructions: [
      'Declare a const `systemStatus` equal to "ACTIVE".',
      'Declare a let `powerLevel` equal to 10.',
      'Print `systemStatus` and `powerLevel` on the same line.'
    ],
    starterCode: `function bootSystem() {
  // Your code here
}

bootSystem();`,
    tests: [{ input: '', expectedOutput: 'ACTIVE 10', isHidden: false }]
  }
}

export const getQuestContent = (id: string): QuestContent => {
  if (QUEST_CONTENT[id]) return QUEST_CONTENT[id]
  return {
    title: 'The Unknown Artifact',
    lore: 'You have encountered a strange artifact. To unlock it, you must prove your basic proficiency.',
    instructions: ['Print the exact string "Artifact Unlocked" to the console.'],
    starterCode: `// Your code here\n`,
    tests: [{ input: '', expectedOutput: 'Artifact Unlocked', isHidden: false }]
  }
}