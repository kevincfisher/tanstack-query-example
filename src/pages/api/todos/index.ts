import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../../server/db/client"

const todos = async (req: NextApiRequest, res: NextApiResponse) => {
  const todos = await prisma.todo.findMany();
  res.status(200).json(todos)

}

export default todos