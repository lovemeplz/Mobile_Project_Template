import Storage from './storage'
export function getToken() {
  return Storage.get('userInfo') || {}
}