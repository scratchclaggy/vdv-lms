import { faker } from "@faker-js/faker";
import type { Consultation, Student, Tutor } from "@/generated/prisma/client";
import { ConsultationStatus } from "@/generated/prisma/enums";
import { StudentBuilder } from "./student-builder";
import { TutorBuilder } from "./tutor-builder";

type ConsultationWithRelations = Consultation & {
  tutor: Tutor;
  student: Student;
};

export class ConsultationBuilder {
  private id = faker.string.uuid();
  private reason = faker.lorem.sentence();
  private startTime = faker.date.future();
  private endTime = new Date(this.startTime.getTime() + 60 * 60 * 1000);
  private status: ConsultationStatus = ConsultationStatus.PENDING;
  private createdAt = new Date();
  private updatedAt = new Date();
  private tutor = new TutorBuilder().db();
  private student = new StudentBuilder().db();

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withReason(reason: string): this {
    this.reason = reason;
    return this;
  }

  withStartTime(startTime: Date): this {
    this.startTime = startTime;
    return this;
  }

  withEndTime(endTime: Date): this {
    this.endTime = endTime;
    return this;
  }

  withStatus(status: ConsultationStatus): this {
    this.status = status;
    return this;
  }

  withCreatedAt(createdAt: Date): this {
    this.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): this {
    this.updatedAt = updatedAt;
    return this;
  }

  withTutor(configure: (builder: TutorBuilder) => void): this {
    const builder = new TutorBuilder();
    configure(builder);
    this.tutor = builder.db();
    return this;
  }

  withStudent(configure: (builder: StudentBuilder) => void): this {
    const builder = new StudentBuilder();
    configure(builder);
    this.student = builder.db();
    return this;
  }

  /**
   * Returns only the scalar fields needed for a Prisma `db.consultation.create`
   * call — no nested relation objects.
   */
  db(): Consultation {
    return {
      id: this.id,
      reason: this.reason,
      startTime: this.startTime,
      endTime: this.endTime,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tutorId: this.tutor.id,
      studentId: this.student.id,
    };
  }

  build(): ConsultationWithRelations {
    return {
      ...this.db(),
      tutor: this.tutor,
      student: this.student,
    };
  }
}
