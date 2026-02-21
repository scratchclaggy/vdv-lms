import { faker } from "@faker-js/faker";
import type { Consultation, Student, Tutor } from "@/generated/prisma/client";
import { ConsultationBuilder } from "./consultation-builder";

type ConsultationWithRelations = Consultation & {
  tutor: Tutor;
  student: Student;
};

export type TutorWithRelations = Tutor & {
  consultations: ConsultationWithRelations[];
};

export class TutorBuilder {
  private id = faker.string.uuid();
  private firstName = faker.person.firstName();
  private lastName = faker.person.lastName();
  private email = faker.internet.email();
  private createdAt = new Date();
  private updatedAt = new Date();
  private consultations: ConsultationWithRelations[] = [];

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withFirstName(firstName: string): this {
    this.firstName = firstName;
    return this;
  }

  withLastName(lastName: string): this {
    this.lastName = lastName;
    return this;
  }

  withEmail(email: string): this {
    this.email = email;
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

  withConsultation(configure: (builder: ConsultationBuilder) => void): this {
    const builder = new ConsultationBuilder();
    configure(builder);
    this.consultations.push(builder.build());
    return this;
  }

  /**
   * Returns only the scalar fields needed for a Prisma `db.tutor.create`
   * call — no nested relation objects.
   */
  db(): Tutor {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  build(): TutorWithRelations {
    return { ...this.db(), consultations: this.consultations };
  }
}
