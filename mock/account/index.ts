import faker from 'faker'
import { Response, Request } from 'express'
import { IAccountData } from '../../src/api/types'

const account: IAccountData[] = [
  {
    key: 'admin',
    username: 'jacob',
    password: '123456',
    name: 'Jacob',
    role: 'admin',
    description: 'Super Administrator. Have access to view all pages.',
    timestamp: faker.date.past().getTime()
  },
  {
    key: 'editor',
    username: 'Jack',
    password: '123456',
    name: 'Jack',
    role: 'editor',
    description: 'Normal Editor. Can see all pages except permission page',
    timestamp: faker.date.past().getTime()
  },
  {
    key: 'visitor',
    username: 'jason',
    password: '123456',
    name: 'Jason',
    role: 'visitor',
    description: 'Just a visitor. Can only see the home page and the document page',
    timestamp: 1579469166352
  }
]

export const getAccounts = (req: Request, res: Response) => {
  return res.json({
    code: 20000,
    data: {
      total: account.length,
      items: account
    }
  })
}

export const createAccount = (req: Request, res: Response) => {
  return res.json({
    code: 20000,
    data: {
      key: faker.random.number({ min: 3, max: 10000 })
    }
  })
}


