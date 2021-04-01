class Lesson {
  constructor (data) {
    this.title = data.lesson;
    this.subgroup = data.subgroup;
    this.teacher = data.teacher;
    this.number = data.lessonNumber;
    this.address = data.address;
    this.classroom = data.classroom;
  }
}
module.exports = Lesson;
