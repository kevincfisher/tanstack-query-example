import {useAutoAnimate} from '@formkit/auto-animate/react'
import {formatDistanceToNow} from 'date-fns'
import {useQueryClient, useMutation} from '@tanstack/react-query'
import { TodoCard } from './TodoCard'


type UpdateTodo = Pick<Todo, 'id' | 'isComplete' | 'completionDate'>


const toggleTodo = async (updatedTodo: UpdateTodo) => {
  const results = await fetch('http://localhost:3000/api/todos/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({updatedTodo})
  })

  const data = await results.json()
  return data
}

const deleteTodo = async (todoId: string) => {
  const results = await fetch('http://localhost:3000/api/todos/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: todoId
    })
  })
  const data = await results.json()

  return data;
} 

interface TodoListProps {
  todos: Todo[] | undefined
}

export const TodoList = ({ todos}: TodoListProps) => {
  const [parent] = useAutoAnimate()

  return (
    <div className="grid grid-cols-3 gap-4" ref={parent}>
      {todos?.map(todo => (
        <TodoCard  key={`Todo_${todo.id}`} todo={todo} />
      ))}
    </div>
  )
}