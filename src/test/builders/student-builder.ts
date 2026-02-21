import { faker } from "@faker-js/faker";
import type { Student } from "@/generated/prisma/client";

export class StudentBuilder {
  private id = faker.string.uuid();
  private firstName = faker.person.firstName();
  private lastName = faker.person.lastName();
  private email = faker.internet.email();
  private createdAt = new Date();
  private updatedAt = new Date();

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

  build(): Student {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Returns the scalar fields needed for a Prisma `db.student.create` call.
   * Equivalent to `build()` since Student has no relations.
   */
  db(): Student {
    return this.build();
  }
}
