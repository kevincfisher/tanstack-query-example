import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../../server/db/client"

const deleteTodos = async (req: NextApiRequest, res: NextApiResponse) => {
  const todoID = req.body["id"]
   
  await prisma.todo.delete({
    where: {
      id: todoID
    },
  })
  res.status(200).json(todoID)
}

export default deleteTodos