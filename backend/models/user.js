module.exports = class User {
  constructor({ email, name, password, status = 'Im new' }) {
    this.email = email;
    this.name = name;
    this.password = password;
    this.status = status;
  }

  save() {
    return fetch('http://localhost:3001/users', {
      method: 'POST',
      body: JSON.stringify(this),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json());
  }

  static findByEmail(email) {
    return fetch(`http://localhost:3001/users?email=${email}`)
      .then((res) => res.json())
      .catch((err) => {
        console.log({ err });
      });
  }
};
