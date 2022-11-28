import { useState } from "react"
import Image from "next/image"
import type { Todo } from "@prisma/client"
import {formatDistanceToNow} from 'date-fns'
import {useQueryClient, useMutation} from '@tanstack/react-query'
import TrashIcon from '../../public/images/trash.svg'
interface TodoCardProps {
  todo: Todo
}


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

export const TodoCard = ({ todo }:TodoCardProps) => {
  const [isComplete, setIsComplete] = useState(todo.isComplete)

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
<article className="p-10 bg-white text-[#2e026d] rounded-md  shadow-md flex flex-col">
  <div className="flex justify-between">
    <div>
      <input type="checkbox" checked={isComplete} onClick={() => {
        toggleTodoMutation.mutate({
          id: todo.id, 
          isComplete: !isComplete, 
          completionDate: !isComplete ? new Date() : null
        })
        setIsComplete(!isComplete)
        }
      }/> 
    </div>
    <div>
      <button type="button" onClick={() => deleteTodoMutation.mutate(todo.id)}><Image src={TrashIcon} width={20} height={20} alt="Delete Todo"/></button>
    </div>
  </div>
  <h3 className="text-xl">{isComplete ? <s>{todo.title}</s> : <>{todo.title}</>}</h3>
  <div>Task created: {formatDistanceToNow(new Date(todo.createdAt), {addSuffix: true})}</div>
  <div>Task updated: {formatDistanceToNow(new Date(todo.updatedAt), { addSuffix: true})} </div>
  {todo.completionDate ? (<div>Task complete: {formatDistanceToNow(new Date(todo.completionDate))}</div>) : null}
</article>
)
}