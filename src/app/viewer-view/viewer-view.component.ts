import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import ExifReader, { ExifTags } from 'exifreader';
import { showDirectoryPicker } from 'file-system-access';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'iv-viewer-view',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    FormsModule,
    ImageModule,
    InputNumberModule,
    PaginatorModule,
    ProgressBarModule,
    ToolbarModule,
  ],
  templateUrl: './viewer-view.component.html',
  styleUrl: './viewer-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerViewComponent {
  readonly loading = signal(false);
  readonly files = signal<Array<FileSystemFileHandle>>([]);
  readonly page = signal(0);
  readonly first = signal(0);
  readonly itemsPerPage = signal(9);
  readonly columns = signal(3);

  readonly imageSlice = signal<
    Array<readonly [string, string, ExifReader.Tags]>
  >([]);

  readonly updateSliceEffect = effect(() => {
    const files = this.files();
    const filesSlice = files.slice(
      this.first(),
      this.first() + this.itemsPerPage()
    );
    Promise.all(
      filesSlice.map(
        async (handle): Promise<readonly [string, string, ExifReader.Tags]> => {
          const file = await handle.getFile();
          return [
            handle.name,
            URL.createObjectURL(file),
            await ExifReader.load(file),
          ] as const;
        }
      )
    ).then((slice) => this.imageSlice.set(slice));
  });

  async openFolderSelector(_$event: MouseEvent) {
    const directoryHandle = await showDirectoryPicker();
    if (!directoryHandle) {
      return;
    }
    this.loading.set(true);
    this.files.set([]);
    this.page.set(0);
    this.first.set(0);
    const buffer: FileSystemFileHandle[] = [];
    for await (const file of getFilesRecursively(directoryHandle)) {
      if (buffer.length >= 40) {
        this.files.update((files) => [...files, ...buffer]);
        buffer.splice(0, buffer.length);
      }
      buffer.push(file);
    }
    this.files.update((files) => [...files, ...buffer]);
    this.loading.set(false);
  }

  onPageChange($event: PaginatorState) {
    if ($event.page !== undefined) {
      this.page.set($event.page);
    }
    if ($event.first !== undefined) {
      this.first.set($event.first);
    }
    if ($event.rows !== undefined) {
      this.itemsPerPage.set($event.rows);
    }
  }

  checkExifData($event: MouseEvent, tags: ExifReader.Tags) {
    console.log({ tags });
    const { prompt, workflow } = tags;
    if (prompt) {
      const promptJSON = JSON.parse(prompt.value);
      console.log(promptJSON);
    }
    if (workflow) {
      const workflowJSON = JSON.parse(workflow.value);
      console.log(workflowJSON);
    }
  }
}

const ALLOWED_EXTENSIONS = ['png', 'jpg', 'mp4', 'gif'] as const;

async function* getFilesRecursively(
  entry: FileSystemFileHandle | FileSystemDirectoryHandle
): AsyncGenerator<FileSystemFileHandle> {
  switch (entry.kind) {
    case 'file':
      const file = await entry.getFile();
      const extension = entry.name.slice(entry.name.lastIndexOf('.') + 1);
      const valid = ALLOWED_EXTENSIONS.some((ext) => ext === extension);
      if (file !== null && valid) {
        yield entry;
      }
      break;
    case 'directory':
      for await (const handle of entry.values()) {
        yield* getFilesRecursively(handle);
      }
      break;
  }
}
