export type HealthComponentOptions = {
  initialValue: number;
  max: number;
};

export class HealthComponent {
  private damageTaken = 0;
  max: number;

  constructor(options: HealthComponentOptions) {
    this.max = options.max;
  }

  get current() {
    return this.max - this.damageTaken;
  }

  add(amount: number) {
    this.damageTaken = Math.max(this.damageTaken - amount, 0);
  }

  remove(amount: number) {
    this.damageTaken = Math.min(this.damageTaken + amount, this.max);
  }
}
