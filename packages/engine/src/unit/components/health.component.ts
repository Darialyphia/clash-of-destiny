export type HealthComponentOptions = {
  initialValue: number;
  max: number;
};

export class HealthComponent {
  private _current: number;
  max: number;

  constructor(options: HealthComponentOptions) {
    this._current = options.initialValue;
    this.max = options.max;
  }

  get current() {
    return this._current;
  }

  setTo(value: number) {
    this._current = Math.min(Math.max(value, 0), this.max);
  }

  add(amount: number) {
    this._current = Math.min(this._current + amount, this.max);
  }

  remove(amount: number) {
    this._current = Math.max(this._current - amount, 0);
  }
}
