import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { ArticleRepository } from "../../../src/repositories/articleRepository";
import fs from "fs";
import { Article } from "../../../src/entities/article.dto";
import { FileStorage } from "../../../src/core/storage";

const storagePath = "./test-storage";
const filePath = "articles";

describe(`ArticleRepository`, () => {
  let repo: ArticleRepository;
  beforeEach(() => {
    FileStorage.setBasePath(storagePath);
    repo = new ArticleRepository(filePath);
  });
  afterEach(() => {
    const files = fs.readdirSync(`${storagePath}/${filePath}`);
    files.forEach((name) =>
      fs.unlinkSync(`${storagePath}/${filePath}/${name}`)
    );
    fs.rmdirSync(`${storagePath}/${filePath}`);
    fs.rmdirSync(`${storagePath}`);
    jest.clearAllMocks();
  });
  it(`creating new article`, () => {
    const art: Article = {
      id: "not-id",
      content: "some content",
      title: "some title",
    };
    const saved = repo.add(art);
    expect(saved?.id).not.toEqual(art.id);
    expect(saved?.content).toEqual(art.content);
    expect(saved?.title).toEqual(art.title);
    expect(saved?.createdAt).toBeDefined();
    expect(saved?.createdAt).toEqual(saved?.updatedAt);
  });
  it(`loading an article by id`, () => {
    const art: Article = {
      id: "not-id",
      content: "some content",
      title: "some title",
    };
    const saved = repo.add(art);

    const loaded = repo.getById(saved.id as string);
    expect(loaded).toBeDefined();
    expect(loaded?.content).toEqual(art.content);
    expect(loaded?.title).toEqual(art.title);
  });
  it(`update an article`, async () => {
    const art: Article = {
      id: "not-id",
      content: "some content",
      title: "some title",
    };
    const saved = repo.add(art);

    await new Promise((resolve) => setTimeout(resolve, 100));
    const result = repo.update({
      ...saved,
      content: "new content",
    });
    expect(result).toEqual(true);

    const loaded = repo.getById(saved.id as string);
    expect(loaded?.content).toEqual("new content");
    expect(loaded?.createdAt).toEqual(saved.createdAt);
    expect(loaded?.updatedAt?.getTime()).toBeGreaterThan(
      (saved.updatedAt as Date).getTime()
    );
  });
  it(`load all`, () => {
    const saved1 = repo.add({
      title: "some title 1",
    });
    const saved2 = repo.add({
      title: "some title 2",
    });
    const saved3 = repo.add({
      title: "some title 3",
    });

    const all = repo.getAll();
    expect(all.length).toEqual(3);
    expect(typeof all[0].createdAt).toBe("object");
    expect(typeof all[0].updatedAt).toBe("object");
  });
});
