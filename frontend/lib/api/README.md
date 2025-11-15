# StudyWise Database & API Layer

## Architecture Overview

The system follows an MCP (Model Context Protocol) inspired architecture with three layers:

1. **Types Layer** (`lib/db/types.ts`) - Schema definitions
2. **Service Layer** (`lib/db/service.ts`) - Firestore operations
3. **API Router** (`lib/api/router.ts`) - Centralized request handler

## Database Schema

### Collections Structure

```
students/
  ├── {userId}/
  │   ├── (profile document)
  │   ├── quizzes/
  │   │   ├── {quizId}
  │   │   ├── {quizId}
  │   │   └── ...
  │   ├── lessons/
  │   │   ├── {lessonId}
  │   │   └── ...
  │   └── stats/
  │       └── summary
```

## Data Types

### StudentProfile
```typescript
{
  userId: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  createdAt: Timestamp
  lastLogin: Timestamp
  streak: number
  totalQuizzesTaken: number
  averageScore: number
  preferredSubjects: string[]
}
```

### QuizAttempt
```typescript
{
  id?: string
  userId: string
  topic: string
  score: number
  total: number
  percentage: number
  timestamp: Timestamp
  duration?: number
  questionsAnswered: QuestionRecord[]
}
```

### LessonProgress
```typescript
{
  id?: string
  userId: string
  topic: string
  content: string
  lastAccessed: Timestamp
  completed: boolean
  timeSpent: number
}
```

### StudentStats
```typescript
{
  userId: string
  totalQuizzesTaken: number
  averageScore: number
  streak: number
  topicsMastered: number
  totalTimeSpent: number
  lastActivityDate: Timestamp
  topicBreakdown: TopicMastery[]
}
```

## Usage Examples

### Option 1: Using the Convenience API (Recommended)

```typescript
import { api } from '@/lib/api/router';

// Get student profile
const profileResponse = await api.profile.get(userId);
if (profileResponse.success) {
  const profile = profileResponse.data;
  console.log(`Hello, ${profile?.displayName}`);
}

// Update profile
const updateResponse = await api.profile.upsert({
  userId,
  displayName: 'John Doe',
  preferredSubjects: ['Math', 'Science']
});

// Save quiz attempt
const quizResponse = await api.quiz.save({
  userId,
  topic: 'Calculus',
  score: 8,
  total: 10,
  percentage: 80,
  questionsAnswered: [...]
});

// Get all quizzes for a student
const quizzesResponse = await api.quiz.getAll(userId);

// Get quizzes for a specific topic
const topicQuizzesResponse = await api.quiz.getByTopic(userId, 'Calculus');

// Save lesson progress
const lessonResponse = await api.lesson.save({
  userId,
  topic: 'Derivatives',
  content: 'Full lesson content...',
  completed: false,
  timeSpent: 1200 // 20 minutes in seconds
});

// Get all lessons
const lessonsResponse = await api.lesson.getAll(userId);

// Get last lesson for "continue where you left off"
const lastLessonResponse = await api.lesson.getLast(userId);

// Get student statistics
const statsResponse = await api.stats.get(userId);
if (statsResponse.success) {
  console.log(`Average Score: ${statsResponse.data?.averageScore}%`);
  console.log(`Topics Mastered: ${statsResponse.data?.topicsMastered}`);
}
```

### Option 2: Using the Main API Handler

```typescript
import { apiHandler, APIAction } from '@/lib/api/router';

const action: APIAction = {
  type: 'profile.get',
  userId: 'user123'
};

const response = await apiHandler(action);
```

### Option 3: Using Direct Service Functions

```typescript
import { getStudentProfile, saveQuizAttempt } from '@/lib/db/service';

// Direct service call
const profile = await getStudentProfile(userId);

// Direct quiz save
const quiz = await saveQuizAttempt({
  userId,
  topic: 'Algebra',
  score: 9,
  total: 10,
  percentage: 90,
  questionsAnswered: [...]
});
```

## Integration with Components

### Example: Analytics Page

```typescript
import { useEffect, useState } from 'react';
import { api } from '@/lib/api/router';
import { StudentStats } from '@/lib/db/types';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const userId = 'current-user-id'; // From auth store
      const response = await api.stats.get(userId);
      
      if (response.success) {
        setStats(response.data);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Your Stats</h1>
      <p>Average Score: {stats?.averageScore}%</p>
      <p>Quizzes Completed: {stats?.totalQuizzesTaken}</p>
      <p>Topics Mastered: {stats?.topicsMastered}</p>
      
      {stats?.topicBreakdown.map((topic) => (
        <div key={topic.topic}>
          <h3>{topic.topic}</h3>
          <p>Average: {topic.averageScore}%</p>
          <p>{topic.mastered ? '✓ Mastered' : 'In Progress'}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example: Quiz Save Flow

```typescript
import { api } from '@/lib/api/router';

async function submitQuiz(answers: QuestionRecord[]) {
  const userId = 'current-user-id';
  const topic = 'Current topic';
  
  // Calculate score
  const correctCount = answers.filter(a => a.isCorrect).length;
  const percentage = Math.round((correctCount / answers.length) * 100);

  // Save to database
  const response = await api.quiz.save({
    userId,
    topic,
    score: correctCount,
    total: answers.length,
    percentage,
    questionsAnswered: answers
  });

  if (response.success) {
    console.log('Quiz saved!');
    // Show results to user
  } else {
    console.error('Failed to save quiz:', response.error);
  }
}
```

## API Response Format

All API calls return a standardized response:

```typescript
{
  success: boolean
  data?: T (the actual data if successful)
  error?: string (error message if failed)
  message?: string (human-readable message)
}
```

## Best Practices

1. **Always check `response.success`** before accessing `response.data`
2. **Use the convenience API** (`api.quiz.save()`) for cleaner code
3. **Handle errors gracefully** in your components
4. **Cache frequently accessed data** to reduce database calls
5. **Use the stats API** for aggregated data instead of calculating manually

## Database Indexing

For optimal performance, create composite indexes for:

```
students/{userId}/quizzes
  - topic (ascending)
  - timestamp (descending)

students/{userId}/lessons
  - completed (ascending)
  - lastAccessed (descending)
```

## Future Enhancements

- [ ] Real-time listeners for live stats updates
- [ ] Batch operations for bulk data handling
- [ ] Caching layer (Redis)
- [ ] Advanced filtering and sorting
- [ ] Data export functionality
- [ ] Analytics aggregation service
