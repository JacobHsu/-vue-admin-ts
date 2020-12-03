import faker from 'faker'
import { Response, Request } from 'express'
import { IAccountData } from '../../src/api/types'

const account: IAccountData[] = [
  {
    key: 'admin',
    username: 'jacob',
    password: '123456',
    newPassword: '',
    confirmPassword: '',
    name: 'Jacob',
    role: 'admin',
    status: 'open',
    description: 'Super Administrator. Have access to view all pages.',
    timestamp: faker.date.past().getTime()
  },
  {
    key: 'editor',
    username: 'Jack',
    password: '1234567Rd',
    newPassword: '',
    confirmPassword: '',
    name: 'Jack',
    role: 'editor',
    status: 'open',
    description: 'Normal Editor. Can see all pages except permission page',
    timestamp: faker.date.past().getTime()
  },
  {
    key: 'visitor',
    username: 'jason',
    password: '123456',
    newPassword: '',
    confirmPassword: '',
    name: 'Jason',
    status: 'open',
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
      key: faker.random.number({ min: 3, max: 10000 }),
      timestamp: faker.date.past().getTime()
    }
  })
}

export const updateAccount = (req: Request, res: Response) => {
  const { role } = req.body
  return res.json({
    code: 20000,
    data: {
      role
    }
  })
}

