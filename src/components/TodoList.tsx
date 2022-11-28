import {useAutoAnimate} from '@formkit/auto-animate/react'
import {formatDistanceToNow} from 'date-fns'
import {useQueryClient, useMutation} from '@tanstack/react-query'


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

  const queryClient = useQueryClient()
  
  const deleteTodoMutation = useMutation(
    (todoId) => deleteTodo(todoId),
    {
      onMutate: async (todoId: string) => {
        await queryClient.cancelQueries(['todos'])

        const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])
        if(previousTodos) {
          queryClient.setQueryData(['todos'], [...previousTodos.filter(todo => todo.id !== todoId)])
        }
        return { previousTodos }
      },
      onError: (err, variables, context) => {
        if(context?.previousTodos) {
          queryClient.setQueryData<Todo[]>(['todos'], context.previousTodos)
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['todos'])
      }
    }
  )
  const toggleTodoMutation = useMutation((updatedTodo: UpdateTodo) => toggleTodo(updatedTodo), 
  {
    onMutate: async (updatedTodo: UpdateTodo) => {
      await queryClient.cancelQueries(['todos'])

      const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])
      if(previousTodos) {
        queryClient.setQueryData<Todo[]>(['todos'], [
          ...previousTodos.map(todo => {
            if(todo.id !== updatedTodo.id) {
              return todo
            } else {
              return {
                ...todo,
                ...updatedTodo
              }
            }
          })
        ])
      }

      return { previousTodos }
    },
    onError: (err, variables, context) => {
      if(context?.previousTodos) {
        queryClient.setQueryData<Todo[]>(['todos'], context.previousTodos)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['todos'])
    }
  })

  return (
    <div className="grid grid-cols-3 gap-4" ref={parent}>
      {todos?.map(todo => (
              <article key={`Todo_${todo.id}`} className="p-10 bg-white text-[#2e026d] rounded-md  shadow-md flex flex-col">
                <div className="flex justify-between">
                <h3>{todo.isComplete ? <s>{todo.title}</s> : <>{todo.title}</>}</h3>
                <div>
                 <input type="checkbox" value={todo.isComplete ? 'true': 'false'} onClick={() => toggleTodoMutation.mutate({
                    id: todo.id, 
                    isComplete: !todo.isComplete, 
                    completionDate: !todo.isComplete ? new Date() : null
                  })}/> 
                </div>
                <div>
                  <button type="button" onClick={() => deleteTodoMutation.mutate(todo.id)}>Delete Todo</button>
                </div>
                </div>
                <div>Task created: {formatDistanceToNow(new Date(todo.createdAt), {addSuffix: true})}</div>
                <div>Task updated: {formatDistanceToNow(new Date(todo.updatedAt), { addSuffix: true})} </div>
                {todo.completionDate ? (<div>Task complete: {formatDistanceToNow(new Date(todo.completionDate))}</div>) : null}
              </article>
            ))}
    </div>
  )
}