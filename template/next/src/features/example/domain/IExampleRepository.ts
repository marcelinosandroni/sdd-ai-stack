export interface IExampleRepository {
  create(input: { title: string; body: string }): Promise<Example>;
  findById(id: string): Promise<Example | null>;
}

export interface Example {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
}
