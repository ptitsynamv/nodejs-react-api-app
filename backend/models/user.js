module.exports = class User {
  constructor({ id, email, name, password, status = 'Im new', posts = [] }) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.password = password;
    this.status = status;
    this.posts = posts;
  }

  save() {
    return fetch('http://localhost:3001/users', {
      method: 'POST',
      body: JSON.stringify(this),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json());
  }

  update() {
    return fetch(`http://localhost:3001/users/${this.id}`, {
      method: 'PUT',
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

  static findById(id) {
    return fetch(`http://localhost:3001/users/${id}`)
      .then((res) => res.json())
      .catch((err) => {
        console.log({ err });
      });
  }

  static fetchAll() {
    return fetch('http://localhost:3001/users')
      .then((res) => res.json())
      .catch((err) => {
        console.log({ err });
      });
  }
};
