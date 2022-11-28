import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../../server/db/client"

const putTodos = async (req: NextApiRequest, res: NextApiResponse) => {
  const todoUpdate = req.body["updatedTodo"]
  console.log(todoUpdate)
  await prisma.todo.update({
    where: {
      id: todoUpdate.id
    },
    data: {
      ...todoUpdate
    }
  })
  res.status(200).json(todoUpdate)
}

export default putTodos