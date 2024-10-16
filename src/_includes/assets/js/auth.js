class Auth {
  #user = {}
  #token = ''
  #endpoint = DB_URL

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
    const res = await fetch(`${this.#endpoint}/signin`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...DB_CONFIG,
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

  async getUser() {
    // if no token error
    // if error remove token
    return await fetch(`${this.#endpoint}/sql`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: `SELECT * FROM $auth.id;`,
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
