module.exports = class Post {
  constructor({ id, title, imageUrl, content, creator, createdAt }) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl.replace(/\\/g, '/');
    this.content = content;
    this.creator = creator;
    if (createdAt) {
      this.createdAt = createdAt;
    } else {
      this.createdAt = new Date();
    }
  }

  save() {
    return fetch('http://localhost:3001/posts', {
      method: 'POST',
      body: JSON.stringify(this),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json());
  }

  update() {
    return fetch(`http://localhost:3001/posts/${this.id}`, {
      method: 'PUT',
      body: JSON.stringify(this),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json());
  }

  static fetchAll() {
    return fetch('http://localhost:3001/posts')
      .then((res) => res.json())
      .catch((err) => {
        console.log({ err });
      });
  }

  static findById(id) {
    return fetch(`http://localhost:3001/posts/${id}`)
      .then((res) => res.json())
      .catch((err) => {
        console.log({ err });
      });
  }

  static delete(id) {
    return fetch(`http://localhost:3001/posts/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .catch((err) => {
        console.log({ err });
      });
  }
};
