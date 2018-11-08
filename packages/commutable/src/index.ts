import { Record } from "immutable";
import * as v4 from "./v4";
import * as v3 from "./v3";
import { ImmutableNotebook, JSONType } from "./primitives";

// .....................................
// API Exports
// Make sure the index.js.flow types stay in sync with this section
//

// from types
export * from "./primitives";

// from structures
export {
  emptyCodeCell,
  emptyMarkdownCell,
  emptyNotebook,
  monocellNotebook,
  createCodeCell,
  insertCellAt,
  insertCellAfter,
  deleteCell,
  appendCellToNotebook
} from "./structures";

// v4
export { StreamOutput, Output, createImmutableOutput } from "./v4";

export {
  createImmutableMimeBundle,
  makeDisplayData,
  makeErrorOutput,
  makeStreamOutput,
  makeExecuteResult
} from "./outputs";

export { makeRawCell, makeCodeCell, makeMarkdownCell } from "./cells";

// general

const freezeReviver = <T extends JSONType>(_k: string, v: T) =>
  Object.freeze(v) as T;

export type Notebook = v4.Notebook | v3.Notebook;

// Expected usage of below is fromJS(parseNotebook(string|buffer))
export const parseNotebook = (notebookString: string): Notebook =>
  JSON.parse(notebookString, freezeReviver);

export const fromJS = (
  notebook: v4.Notebook | v3.Notebook | ImmutableNotebook
) => {
  if (Record.isRecord(notebook)) {
    if (notebook.has("cellOrder") && notebook.has("cellMap")) {
      return notebook;
    }
    throw new TypeError(
      `commutable was passed an Immutable.Record structure that is not a notebook`
    );
  }

  if (notebook.nbformat === 4 && notebook.nbformat_minor >= 0) {
    var v4Notebook = notebook as v4.Notebook;

    if (
      Array.isArray(v4Notebook.cells) &&
      typeof notebook.metadata === "object"
    ) {
      return v4.fromJS(v4Notebook);
    }
  } else if (notebook.nbformat === 3 && notebook.nbformat_minor >= 0) {
    return v3.fromJS(notebook as v3.Notebook);
  }

  if (notebook.nbformat) {
    throw new TypeError(
      `nbformat v${notebook.nbformat}.${notebook.nbformat_minor} not recognized`
    );
  }

  throw new TypeError("This notebook format is not supported");
};

export const toJS = (immnb: ImmutableNotebook): v4.Notebook => {
  const minorVersion: null | number = immnb.get("nbformat_minor", null);

  if (
    immnb.get("nbformat") === 4 &&
    typeof minorVersion === "number" &&
    minorVersion >= 0
  ) {
    return v4.toJS(immnb);
  }
  throw new TypeError("Only notebook formats 3 and 4 are supported!");
};

// Expected usage is stringifyNotebook(toJS(immutableNotebook))
export const stringifyNotebook = (notebook: v4.Notebook) =>
  JSON.stringify(notebook, null, 2);
