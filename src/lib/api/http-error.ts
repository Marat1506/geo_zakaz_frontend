/** Thrown when API returns a non-2xx response (NestJS body preserved in `response.data`). */
export class HttpError extends Error {
  readonly response: { status: number; data: unknown };

  constructor(status: number, data: unknown, message?: string) {
    super(message ?? `HTTP ${status}`);
    this.name = 'HttpError';
    this.response = { status, data };
  }
}
