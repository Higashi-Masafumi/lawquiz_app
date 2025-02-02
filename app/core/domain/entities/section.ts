import { Post } from "./post";

export class Section {
  constructor(
    public readonly id: string,
    public readonly section: string,
    public readonly slug: string,
    public readonly description: string,
    public readonly updatedAt: string,
    public readonly createdAt: string,
    public readonly publishedAt: string,
    public readonly revisedAt: string,
    public readonly posts: Post[] = []
  ) {}
}
