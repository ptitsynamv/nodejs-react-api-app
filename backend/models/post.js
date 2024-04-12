module.exports = class Post {
  constructor({ title, imageUrl, content, creator }) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.content = content;
    this.creator = creator;
    this.createdAt = new Date();
  }

  save() {
    return fetch('http://localhost:3001/posts', {
      method: 'POST',
      body: JSON.stringify(this),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .catch((err) => {
        console.log({ err });
      });
  }

  static fetchAll() {
    return fetch('http://localhost:3001/posts')
      .then((res) => res.json())
      .catch((err) => {
        console.log({ err });
      });
  }
};
