// TODO: probably should be a class
// and get constants for url, options, etc...

class Auth {
  #user = {}
  #token = ''
  #endpoint = 'http://localhost:8000'

  constructor() {
    this.#token = localStorage.getItem('token')
    this.#user = JSON.parse(localStorage.getItem('user'))
  }

  setToken(token) {
    this.#token = token
    localStorage.setItem('token', token)
  }

  setUser(user) {
    this.#user = user
    localStorage.setItem('user', JSON.stringify(user))
  }

  async isAuthenticated() {
    // should check if token is valid calling /key/user
    if (this.#token) {
      return true
    } else return false
  }

  async isAdmin() {
    if (this.#user.role === 'admin') {
      return true
    } else return false
  }

  getToken() {
    if (this.#token !== '') {
      return this.#token
    }

    this.#token = localStorage.getItem('token')
    return this.#token
  }

  async signin(username, password) {
    const res = await fetch(this.#endpoint + '/signin', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        NS: 'test',
        DB: 'test',
        AC: 'user',
        username,
        password,
      }),
    })

    const data = await res.json()

    if (data.code !== 200) {
      alert(`Error:\n- ${data.description}\n- ${data.information}`)

      return false
    } else {
      this.setToken(data.token)
      await this.getUser()

      return true
    }
  }

  // fetch(`${this.#endpoint}/signin`, {
  //   method: 'POST',
  //   headers: {
  //     Accept: 'application/json',
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     NS: 'test',
  //     DB: 'test',
  //     AC: 'user',
  //     username,
  //     password,
  //   }),
  // })
  //   .then(async (res) => await res.json())
  //   .then((data) => {
  //     console.log(data)
  //     if (data.code !== 200) {
  //       alert(`Error:\n- ${data.description}\n- ${data.information}`)
  //       // throw new Error(data.error)
  //       return false
  //     }
  //     this.setToken(data.token)
  //     this.getUser()
  //
  //     return true
  //   })
  // .catch((err) => {
  //   alert(`Error:\n- ${err}`)
  //   return false
  // })

  async getUser() {
    // if no token error
    // if error remove token
    return await fetch(`${this.#endpoint}/key/user`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.getToken()}`,
      },
    })
      .then(async (res) => await res.json())
      .then((data) => {
        if (data.error) {
          this.setToken('')
          alert(`Error: ${data.error}`)
          return
        }

        this.setUser(data[0].result[0])
        return this.#user
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  }
}

export const auth = new Auth()
