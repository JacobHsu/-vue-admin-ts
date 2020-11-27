import request from '@/utils/request'

export const getAccounts = (params: any) =>
  request({
    url: '/accounts',
    method: 'get',
    params
  })

export const createAccount = (data: any) =>
  request({
    url: '/accounts',
    method: 'post',
    data
  })