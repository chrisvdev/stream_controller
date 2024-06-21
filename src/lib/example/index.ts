let count = 0;

export default class Example {
  private id: number;
  constructor() {
    count++;
    this.id = count;
  }
  public getId() {
    return this.id;
  }
}

export const countPlus = () => ++count;

export function countMinus() {
  count--;
}

export const countGet = () => count;
