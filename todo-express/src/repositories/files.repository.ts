import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { cwd } from "process";
import log from "~/middlewares/log";

const STORAGE = `${cwd()}/.userstorage`;

export const userstorage = {
  projects: ["icon"],
  tags: ["image"],
} as const;

export type ResourcesType = keyof typeof userstorage;
export type DataNameType = typeof userstorage[keyof typeof userstorage][number];

export class FilesRepository {
  private resources: ResourcesType;
  private data_name: DataNameType;

  constructor(resources: ResourcesType, data_name: DataNameType) {
    this.resources = resources;
    this.data_name = data_name;
  }

  public dir(id: number) {
    return path.resolve(STORAGE, this.resources, this.data_name, String(id));
  }

  public files(id: number) {
    return readdir(this.dir(id));
  }

  public delete(id: number) {
    rmrf(this.dir(id));
  }

  public async read(id: number) {
    const [filename] = this.files(id);

    if (filename) {
      return readFile(filename);
    } else {
      return Promise.resolve(null);
    }
  }

  public async write(id: number, filename: string, buffer: Buffer) {
    this.delete(id);
    return writeFile(this.dir(id), filename, buffer);
  }
}

const readdir = (dirpath: string) => {
  log.debug("readdir", dirpath);
  if (fs.existsSync(dirpath)) {
    return fs.readdirSync(dirpath).map((filename) => path.join(dirpath, filename));
  }
  return [];
};

const rmrf = (anypath: string) => {
  log.debug("rmrf", anypath);
  if (fs.existsSync(anypath)) {
    fs.rmSync(anypath, { recursive: true, force: true });
  }
};

const readFile = async (filepath: string) => {
  log.debug("readFile", filepath);
  if (fs.existsSync(filepath)) {
    return fsPromises.readFile(filepath);
  }
  return null;
};

const writeFile = async (dirpath: string, filename: string, buffer: Buffer) => {
  log.debug("writeFile", dirpath, filename);
  fs.mkdirSync(dirpath, { recursive: true });

  const filepath = path.join(dirpath, filename);
  return fsPromises.writeFile(filepath, buffer);
};
