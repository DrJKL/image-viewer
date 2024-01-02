import { Injectable } from '@angular/core';
import { ReplaySubject, combineLatest, from, timer } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  scan,
  switchAll,
  switchMap,
  throttleTime,
} from 'rxjs/operators';
import { sortedIndexBy } from 'lodash';

@Injectable({ providedIn: 'root' })
export class FolderWatcher {
  readonly POLLING_RATE = 1_000;

  private readonly folderToWatch = new ReplaySubject<FileSystemDirectoryHandle>(
    1
  );

  readonly filesFound$ = combineLatest([
    this.folderToWatch,
    timer(0, this.POLLING_RATE),
  ]).pipe(
    switchMap(([folder]) => from(getFilesRecursively(folder))),
    scan(async (acc, fileRecord) => {
      const fileList = await acc;
      if (
        fileList.some(
          (record) =>
            record.path === fileRecord.path &&
            record.file.name === fileRecord.file.name
        )
      ) {
        return fileList;
      }
      const sortedIndex = sortedIndexBy(
        fileList,
        fileRecord,
        (r) => r.lastModified
      );
      fileList.splice(sortedIndex, 0, fileRecord);
      return fileList;
    }, Promise.resolve<FileRecord[]>([])),
    switchAll(),
    map((files) => [...files]),
    distinctUntilChanged((prev, curr) => prev.length === curr.length),
    throttleTime(this.POLLING_RATE, undefined, {
      leading: true,
      trailing: true,
    })
  );

  watchFolder(folderToWatch: FileSystemDirectoryHandle) {
    console.log('new folder to watch', folderToWatch);
    this.folderToWatch.next(folderToWatch);
  }
}

type FileRecord = {
  path: string;
  file: FileSystemFileHandle;
  lastModified: number;
};

const ALLOWED_EXTENSIONS = ['png', 'jpg', 'mp4', 'gif'] as const;

export async function* getFilesRecursively(
  entry: FileSystemFileHandle | FileSystemDirectoryHandle,
  path = ''
): AsyncGenerator<FileRecord> {
  switch (entry.kind) {
    case 'file':
      const file = await entry.getFile();
      const { lastModified } = file;
      const extension = entry.name.slice(entry.name.lastIndexOf('.') + 1);
      const valid = ALLOWED_EXTENSIONS.some((ext) => ext === extension);
      if (file !== null && valid) {
        yield { path, file: entry, lastModified };
      }
      break;
    case 'directory':
      for await (const handle of entry.values()) {
        yield* getFilesRecursively(handle, `${path}/${entry.name}`);
      }
      break;
  }
}
