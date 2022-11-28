import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../../server/db/client"

const postTodos = async (req: NextApiRequest, res: NextApiResponse) => {
  const todo = req.body["todo"]
  
  console.log(todo)
await prisma.todo.create({
  data: todo
})
  res.status(200).json(todo)
}

export default postTodos