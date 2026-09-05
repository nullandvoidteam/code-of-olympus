-- Migration: Prepare Challenges Foundation for Team Arcade Battles
-- Description: Adds question_type, standardizes difficulty mapping, adds indexes for language+difficulty+published, and ensures robust Arcade sampling

-- 1. Add question_type column to challenges table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'challenges' AND column_name = 'question_type'
  ) THEN
    ALTER TABLE public.challenges ADD COLUMN question_type TEXT NOT NULL DEFAULT 'code';
  END IF;
END $$;

-- 2. Standardize existing challenge difficulties for consistent Arcade matching
UPDATE public.challenges
SET difficulty = 'Easy'
WHERE LOWER(difficulty) IN ('beginner', 'novice');

UPDATE public.challenges
SET difficulty = 'Medium'
WHERE LOWER(difficulty) IN ('intermediate', 'mid');

UPDATE public.challenges
SET difficulty = 'Hard'
WHERE LOWER(difficulty) IN ('advanced', 'expert');

-- 3. Composite and single-column indexes for fast Arcade question pool queries
CREATE INDEX IF NOT EXISTS idx_challenges_arcade_pool 
ON public.challenges (language, difficulty, is_published);

CREATE INDEX IF NOT EXISTS idx_challenges_question_type 
ON public.challenges (question_type);

-- 4. Seed additional published coding questions for JavaScript and Python to ensure rich arcade pools
INSERT INTO public.challenges (
  id,
  title,
  slug,
  description,
  instructions,
  difficulty,
  category,
  language,
  question_type,
  starter_code,
  sample_input,
  solution_code,
  solution_explanation,
  hints,
  xp_reward,
  is_published,
  order_index
)
VALUES
  (
    'f0000000-0000-0000-0000-000000000005',
    'Two Sum Pair Finder',
    'two-sum-pair-finder',
    'Find the indices of two numbers in an array that add up to a specific target.',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    'Medium',
    'JavaScript',
    'javascript',
    'code',
    'function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9));',
    '[2, 7, 11, 15], 9',
    'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}',
    'Use a hash map to achieve single-pass O(N) time complexity.',
    '["Use a Map to track previously seen numbers and their indices."]'::jsonb,
    100,
    true,
    5
  ),
  (
    'f0000000-0000-0000-0000-000000000006',
    'Valid Palindrome Verifier',
    'valid-palindrome-verifier',
    'Determine if a string is a palindrome considering only alphanumeric characters.',
    'Given a string s, return true if it is a palindrome, or false otherwise after removing non-alphanumeric characters.',
    'Easy',
    'JavaScript',
    'javascript',
    'code',
    'function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean === clean.split("").reverse().join("");
}

console.log(isPalindrome("A man, a plan, a canal: Panama"));',
    '"A man, a plan, a canal: Panama"',
    'function isPalindrome(s) {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return clean === clean.split("").reverse().join("");\n}',
    'Filter with regex, then compare clean string with its reverse.',
    '["Use replace(/[^a-z0-9]/gi, \"\") to sanitize."]'::jsonb,
    75,
    true,
    6
  ),
  (
    'f0000000-0000-0000-0000-000000000007',
    'Fibonacci Sequence Matrix',
    'fibonacci-sequence-matrix',
    'Compute the n-th Fibonacci number using dynamic programming.',
    'Write a function that calculates the n-th Fibonacci number where F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2).',
    'Hard',
    'JavaScript',
    'javascript',
    'code',
    'function fib(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

console.log(fib(10));',
    '10',
    'function fib(n) {\n  if (n <= 1) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    const c = a + b;\n    a = b;\n    b = c;\n  }\n  return b;\n}',
    'Iterative constant-space dynamic programming.',
    '["Maintain two variables for F(i-1) and F(i-2) to avoid O(N) space."]'::jsonb,
    150,
    true,
    7
  ),
  (
    'f0000000-0000-0000-0000-000000000008',
    'Python Word Frequency Counter',
    'python-word-frequency-counter',
    'Count word occurrences in a text string using Python dictionaries.',
    'Write a Python function count_words(text) that returns a dictionary mapping each lowercase word to its count.',
    'Easy',
    'Python',
    'python',
    'code',
    'def count_words(text):
    words = text.lower().split()
    counts = {}
    for w in words:
        counts[w] = counts.get(w, 0) + 1
    return counts

print(count_words("apple banana apple cherry banana apple"))',
    '"apple banana apple cherry banana apple"',
    'def count_words(text):\n    words = text.lower().split()\n    counts = {}\n    for w in words:\n        counts[w] = counts.get(w, 0) + 1\n    return counts',
    'Use .split() and a frequency map with dict.get().',
    '["Use dict.get(key, 0) to increment counts cleanly."]'::jsonb,
    75,
    true,
    8
  ),
  (
    'f0000000-0000-0000-0000-000000000009',
    'Python Anagram Detector',
    'python-anagram-detector',
    'Check if two strings are anagrams of each other.',
    'Write a Python function is_anagram(s1, s2) that returns True if s1 and s2 contain the exact same characters with the same frequencies.',
    'Medium',
    'Python',
    'python',
    'code',
    'def is_anagram(s1, s2):
    return sorted(s1.lower().replace(" ", "")) == sorted(s2.lower().replace(" ", ""))

print(is_anagram("listen", "silent"))',
    '"listen", "silent"',
    'def is_anagram(s1, s2):\n    return sorted(s1.lower().replace(" ", "")) == sorted(s2.lower().replace(" ", ""))',
    'Sort the sanitized strings and compare them.',
    '["You can sort both strings or compare frequency dictionaries."]'::jsonb,
    100,
    true,
    9
  ),
  (
    'f0000000-0000-0000-0000-000000000010',
    'Python Binary Search Algorithm',
    'python-binary-search-algorithm',
    'Implement logarithmic binary search in a sorted array.',
    'Given a sorted array of distinct integers and a target value, return the index if target is found or -1 if not.',
    'Hard',
    'Python',
    'python',
    'code',
    'def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

print(binary_search([-1, 0, 3, 5, 9, 12], 9))',
    '[-1, 0, 3, 5, 9, 12], 9',
    'def binary_search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: left = mid + 1\n        else: right = mid - 1\n    return -1',
    'Classic binary search maintaining left and right pointers in O(log N).',
    '["Calculate mid = (left + right) // 2 and adjust pointers based on comparison."]'::jsonb,
    150,
    true,
    10
  )
ON CONFLICT (slug) DO UPDATE SET
  difficulty = EXCLUDED.difficulty,
  language = EXCLUDED.language,
  question_type = EXCLUDED.question_type,
  is_published = EXCLUDED.is_published;

-- 5. Update respond_to_team_challenge to ensure flexible difficulty matching
CREATE OR REPLACE FUNCTION public.respond_to_team_challenge(
  p_challenge_id UUID,
  p_response TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_challenge RECORD;
  v_action TEXT := LOWER(TRIM(p_response));
  v_selected_exercise_ids JSONB := '[]'::jsonb;
  v_match_id UUID;
  v_match RECORD;
BEGIN
  -- Validate caller authentication
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  -- Validate response action
  IF v_action NOT IN ('accepted', 'declined') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid response action.');
  END IF;

  -- Lock and retrieve challenge
  SELECT * INTO v_challenge
  FROM public.arcade_team_challenges
  WHERE id = p_challenge_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Challenge not found.');
  END IF;

  IF v_challenge.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Challenge is no longer pending (' || v_challenge.status || ').');
  END IF;

  -- Verify caller belongs to challenged team (or is admin)
  IF NOT EXISTS (
    SELECT 1 FROM public.arcade_team_members
    WHERE team_id = v_challenge.challenged_team_id AND user_id = v_caller_id
  ) AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only members of the challenged squad can respond.');
  END IF;

  -- If declined
  IF v_action = 'declined' THEN
    UPDATE public.arcade_team_challenges
    SET status = 'declined', updated_at = now()
    WHERE id = p_challenge_id;

    RETURN jsonb_build_object('success', true, 'status', 'declined');
  END IF;

  -- If accepted: sample questions and create match
  -- Try to find published challenges matching language and difficulty (with alias support)
  SELECT COALESCE(jsonb_agg(sub.id), '[]'::jsonb)
  INTO v_selected_exercise_ids
  FROM (
    SELECT c.id
    FROM public.challenges c
    WHERE c.is_published = true
      AND (
        LOWER(c.language) = LOWER(v_challenge.language)
        OR LOWER(v_challenge.language) IN ('all', 'any')
      )
      AND (
        LOWER(c.difficulty) = LOWER(v_challenge.difficulty)
        OR (LOWER(v_challenge.difficulty) = 'easy' AND LOWER(c.difficulty) IN ('easy', 'beginner'))
        OR (LOWER(v_challenge.difficulty) = 'medium' AND LOWER(c.difficulty) IN ('medium', 'intermediate'))
        OR (LOWER(v_challenge.difficulty) = 'hard' AND LOWER(c.difficulty) IN ('hard', 'advanced', 'expert'))
        OR LOWER(v_challenge.difficulty) IN ('all', 'any')
      )
    ORDER BY random()
    LIMIT v_challenge.question_count
  ) sub;

  -- Fallback: if not enough matching exercises, select published questions matching language
  IF jsonb_array_length(v_selected_exercise_ids) < v_challenge.question_count THEN
    SELECT COALESCE(jsonb_agg(sub_fallback.id), '[]'::jsonb)
    INTO v_selected_exercise_ids
    FROM (
      SELECT c.id
      FROM public.challenges c
      WHERE c.is_published = true
        AND (
          LOWER(c.language) = LOWER(v_challenge.language)
          OR LOWER(v_challenge.language) IN ('all', 'any')
        )
      ORDER BY random()
      LIMIT v_challenge.question_count
    ) sub_fallback;
  END IF;

  -- Second fallback: if still not enough, select any published questions
  IF jsonb_array_length(v_selected_exercise_ids) < v_challenge.question_count THEN
    SELECT COALESCE(jsonb_agg(sub_any.id), '[]'::jsonb)
    INTO v_selected_exercise_ids
    FROM (
      SELECT c.id
      FROM public.challenges c
      WHERE c.is_published = true
      ORDER BY random()
      LIMIT v_challenge.question_count
    ) sub_any;
  END IF;

  -- 2. Mark challenge as accepted
  UPDATE public.arcade_team_challenges
  SET status = 'accepted', updated_at = now()
  WHERE id = p_challenge_id;

  -- 3. Create match in arcade_team_matches
  INSERT INTO public.arcade_team_matches (
    team_a_id,
    team_b_id,
    language,
    difficulty,
    question_count,
    selected_exercise_ids,
    status
  )
  VALUES (
    v_challenge.challenger_team_id,
    v_challenge.challenged_team_id,
    v_challenge.language,
    v_challenge.difficulty,
    v_challenge.question_count,
    v_selected_exercise_ids,
    'lobby'
  )
  RETURNING * INTO v_match;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'accepted',
    'match_id', v_match.id,
    'match', row_to_json(v_match)
  );
END;
$$;
