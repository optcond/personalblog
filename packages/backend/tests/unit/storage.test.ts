import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import fs from "fs";
import { FileStorage } from "../../src/core/storage";

interface TestDTO {
  id?: string;
  name: string;
}

const storagePath = "./test-storage";
const filePath = "tests";

describe(`FileStorage implementation test`, () => {
  let storage: FileStorage<TestDTO>;
  beforeEach(() => {
    FileStorage.setBasePath(storagePath);
    storage = new FileStorage(filePath);
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
  it(`create a file`, () => {
    const obj: TestDTO = {
      name: "test",
    };
    const saved = storage.save(obj);
    expect(saved.id).toBeDefined();
    expect(fs.existsSync(`${storagePath}/${filePath}/${saved.id}`)).toEqual(
      true
    );

    const data = JSON.parse(
      fs.readFileSync(`${storagePath}/${filePath}/${saved.id}`).toString()
    ) as TestDTO;
    expect(data.name).toEqual("test");
    expect(data.id).toEqual(saved.id);
  });
  it(`load file correctly`, () => {
    const obj: TestDTO = {
      name: "test",
    };
    const saved = storage.save(obj);

    if (!saved.id) throw new Error(`File not saved correctly, ID is empty`);
    const loaded = storage.load(saved.id);

    expect(loaded?.name).toEqual(saved.name);
    expect(loaded?.id).toEqual(saved.id);
  });
  it(`load multiple files`, () => {
    const savedA = storage.save({ name: "a" } as TestDTO);
    const savedB = storage.save({ name: "b" } as TestDTO);
    const savedC = storage.save({ name: "c" } as TestDTO);

    const loaded = storage.loadAll();
    expect(loaded.length).toEqual(3);
    expect(new Set([savedA, savedB, savedC])).toEqual(new Set(loaded));
  });
  it(`update the file contents`, () => {
    const saved = storage.save({ name: "a" } as TestDTO);
    if (!saved.id) throw new Error(`File not saved correctly, ID is empty`);

    const updated = storage.update({
      ...saved,
      name: "new a",
    });
    expect(updated).toEqual(true);

    const loaded = storage.load(saved.id);
    expect(loaded?.id).toEqual(saved.id);
    expect(loaded?.name).toEqual("new a");

    const failUpdate = storage.update({
      ...saved,
      id: "500",
      name: "new a",
    });
    expect(failUpdate).toEqual(false);
  });
  it(`delete the file`, () => {
    const saved = storage.save({ name: "a" } as TestDTO);
    if (!saved.id) throw new Error(`File not saved correctly, ID is empty`);

    const deleted = storage.delete(saved.id);
    expect(deleted).toEqual(true);

    const loaded = storage.load(saved.id);
    expect(loaded).not.toBeDefined;
    expect(fs.existsSync(`${storagePath}/${filePath}/${saved.id}`)).toEqual(
      false
    );
  });
});
