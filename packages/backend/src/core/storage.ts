import { v4 as uuidv4 } from "uuid";
import fs from "fs";

interface IStorage<T extends { id?: string }> {
  save(data: T): T;
  load(id: string): T | null;
  loadAll(): T[];
  update(data: T): boolean;
  delete(id: string): boolean;
}

export class FileStorage<T extends { id?: string }> implements IStorage<T> {
  protected static basePath: string = "./storage";
  static setBasePath(path: string) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
    this.basePath = path;
  }

  constructor(protected localPath: string) {}

  save(data: T): T {
    const obj = {
      ...data,
      id: uuidv4(),
    };

    if (!fs.existsSync(FileStorage.basePath)) {
      fs.mkdirSync(FileStorage.basePath);
    }

    if (!fs.existsSync(`${FileStorage.basePath}/${this.localPath}`)) {
      fs.mkdirSync(`${FileStorage.basePath}/${this.localPath}`);
    }

    fs.writeFileSync(
      `${FileStorage.basePath}/${this.localPath}/${obj.id}`,
      JSON.stringify(obj)
    );

    return obj;
  }
  load(id: string): T | null {
    if (!fs.existsSync(`${FileStorage.basePath}/${this.localPath}/${id}`))
      return null;

    return JSON.parse(
      fs
        .readFileSync(`${FileStorage.basePath}/${this.localPath}/${id}`)
        .toString()
    );
  }
  loadAll(): T[] {
    const files = fs.readdirSync(`${FileStorage.basePath}/${this.localPath}`);
    const objects: T[] = [];
    files.forEach((name) => {
      const data = this.load(name);
      if (data) objects.push(data);
    });
    return objects;
  }
  update(data: T): boolean {
    if (!data.id) throw new Error(`The object doesn't have and ID`);
    const loaded = this.load(data.id);

    if (!loaded) return false;

    fs.writeFileSync(
      `${FileStorage.basePath}/${this.localPath}/${data.id}`,
      JSON.stringify({
        ...data,
      })
    );
    return true;
  }
  delete(id: string): boolean {
    if (!fs.existsSync(`${FileStorage.basePath}/${this.localPath}/${id}`))
      return false;

    fs.unlinkSync(`${FileStorage.basePath}/${this.localPath}/${id}`);
    return true;
  }
}
