import { FileStorage } from "../core/storage";
import { Article } from "../entities/article.dto";

export class ArticleRepository {
  protected storage: FileStorage<Article>;

  constructor(filePath: string) {
    this.storage = new FileStorage<Article>(filePath);
  }

  getById(id: string): Article | null {
    const art = this.storage.load(id);
    if (!art) return null;

    if (art.createdAt) art.createdAt = new Date(art.createdAt);
    if (art.updatedAt) art.updatedAt = new Date(art.updatedAt);

    return art;
  }

  getAll(): Article[] {
    const articles = this.storage.loadAll();
    articles.forEach((art) => {
      if (art.createdAt) art.createdAt = new Date(art.createdAt);
      if (art.updatedAt) art.updatedAt = new Date(art.updatedAt);
    });
    return articles;
  }

  add(article: Article): Article {
    const obj: Article = {
      content: article.content,
      title: article.title,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    try {
      const saved = this.storage.save(obj);
      return saved;
    } catch (err) {
      throw new Error(`Saving failed: ${(err as Error).message}`);
    }
  }

  delete(id: string): boolean {
    try {
      return this.storage.delete(id);
    } catch (err) {
      throw new Error(`Deletion failed: ${(err as Error).message}`);
    }
  }

  update(article: Article): boolean {
    if (!article.id) throw new Error(`Article has no id`);

    const loaded = this.storage.load(article.id);
    if (!loaded) return false;

    const obj: Article = {
      ...loaded,
      content: article.content,
      title: article.title,
      updatedAt: new Date(),
    };
    try {
      return this.storage.update(obj);
    } catch (err) {
      throw new Error(`Update failed: ${(err as Error).message}`);
    }
  }
}
