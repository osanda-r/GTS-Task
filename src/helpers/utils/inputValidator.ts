/**
 * Utility functions for general input validation.
 */

export type RuleArray = Array<(input: unknown) => string | true>;

class InputValidator  {
  private readonly fieldName: string;
  private readonly rules: RuleArray;

 constructor(fieldName: string) {
    this.fieldName = fieldName;
    this.rules = [];
  }

  required(): this {
    this.rules.push((input: unknown) =>
      input != null && input !== '' ? true : `${this.fieldName} is required`
    );
    return this;
  }

  minChar(length: number): this {
    this.rules.push((input: unknown) =>
      typeof input === 'string' && input.length >= length
        ? true
        : `${this.fieldName} must be at least ${length} characters`
    );
    return this;
  }

  getRules(): RuleArray {
    if (this.rules.length === 0) {
      throw new Error(`No rules were found for the field ${this.fieldName}`);
    }
    return this.rules;
  }
}

export default function inputValidator(fieldName: string = 'This field'): InputValidator  {
  return new InputValidator (fieldName)
}

