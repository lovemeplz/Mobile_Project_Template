
class Storage {
  get(key) {
    return localStorage.getItem(key)
  }

  set(key, value) {
    if (Object.prototype.toString.call(value) === '[object Object]') {
      localStorage.setItem(key, JSON.stringify(value))
    } else {
      localStorage.setItem(key, value)
    }
  }

  remove(key) {
    localStorage.removeItem(key)
  }
}

export default new Storage()
