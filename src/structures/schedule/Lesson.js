class Lesson {
  constructor (data) {
    this.title = data.lesson;
    this.teacher = data.teacher;
    this.number = data.lessonNumber;
    this.address = data.address;
    this.classroom = data.classroom;
  }
}
module.exports = Lesson;
