import axios from 'axios'
import store from '@/store'
// import { getToken } from '@/utils/auth'

const service = axios.create({
  // baseURL: process.env.VUE_APP_BASE_API || '', // URL = baseURL + RequestUrl
  timeout: 5000, // request timeout
})

service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      // config.headers['X-Token'] = getToken()
      config.headers['X-Token'] = 'test'
    }
    return config
  },
  error => {
    console.log(error) // for debug
    return Promise.reject(error)
  },
)

service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      console.error('接口报错',res.message)
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.error('接口报错' + error) 
    return Promise.reject(error)
  },
)

export default service