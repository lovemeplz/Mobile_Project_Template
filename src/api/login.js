import request from '@/utils/request'


export function login (params) {
  return request({
    url: '/v1/index/login',
    methods: '  POST',
    data: params
  })
  // return new Promise((resolve, reject) => {
  //   resolve({
  //     token: 'xxxx-aaaa-ss'
  //   })
  // })
}


export function getUserInfo () {
  return request({
    url: userApi.UserInfo,
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function logout () {
  return request({
    url: userApi.Logout,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
