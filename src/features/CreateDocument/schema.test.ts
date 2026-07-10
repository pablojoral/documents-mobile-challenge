import { createDocumentSchema, DOCUMENT_NAME_MAX_LENGTH, MAX_FILES } from './schema';

const validFile = { uri: 'file:///a.pdf', name: 'a.pdf', size: 1024, type: 'application/pdf' };

const makeFile = (index: number, overrides: Partial<typeof validFile> = {}) => ({
  ...validFile,
  uri: `file:///${index}.pdf`,
  name: `${index}.pdf`,
  ...overrides,
});

const validInput = {
  name: 'Report',
  version: '1.0.0',
  files: [validFile],
};

describe('createDocumentSchema', () => {
  it('accepts valid input', () => {
    const result = createDocumentSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = createDocumentSchema.safeParse({ ...validInput, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a name longer than the max length', () => {
    const result = createDocumentSchema.safeParse({
      ...validInput,
      name: 'a'.repeat(DOCUMENT_NAME_MAX_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });

  it('accepts a name exactly at the max length', () => {
    const result = createDocumentSchema.safeParse({
      ...validInput,
      name: 'a'.repeat(DOCUMENT_NAME_MAX_LENGTH),
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty version', () => {
    const result = createDocumentSchema.safeParse({ ...validInput, version: '' });
    expect(result.success).toBe(false);
  });

  it.each(['1', '1.0', '1.0.0.0', 'a.b.c', '1..0', '100.0.0'])(
    'rejects an invalid version format: %s',
    version => {
      const result = createDocumentSchema.safeParse({ ...validInput, version });
      expect(result.success).toBe(false);
    },
  );

  it.each(['0.0.0', '1.2.3', '99.99.99'])('accepts a valid version format: %s', version => {
    const result = createDocumentSchema.safeParse({ ...validInput, version });
    expect(result.success).toBe(true);
  });

  it('rejects an empty files array', () => {
    const result = createDocumentSchema.safeParse({ ...validInput, files: [] });
    expect(result.success).toBe(false);
  });

  it('rejects more than the maximum number of files', () => {
    const result = createDocumentSchema.safeParse({
      ...validInput,
      files: Array.from({ length: MAX_FILES + 1 }, (_, i) => makeFile(i)),
    });
    expect(result.success).toBe(false);
  });

  it('accepts exactly the maximum number of files', () => {
    const result = createDocumentSchema.safeParse({
      ...validInput,
      files: Array.from({ length: MAX_FILES }, (_, i) => makeFile(i)),
    });
    expect(result.success).toBe(true);
  });

  it('accepts multiple files under the maximum', () => {
    const result = createDocumentSchema.safeParse({
      ...validInput,
      files: [makeFile(0), makeFile(1), makeFile(2)],
    });
    expect(result.success).toBe(true);
  });

  it('rejects when any single file is larger than the max size', () => {
    const result = createDocumentSchema.safeParse({
      ...validInput,
      files: [validFile, makeFile(1, { size: 11 * 1024 * 1024 })],
    });
    expect(result.success).toBe(false);
  });

  it('accepts a file exactly at the max size', () => {
    const result = createDocumentSchema.safeParse({
      ...validInput,
      files: [{ ...validFile, size: 10 * 1024 * 1024 }],
    });
    expect(result.success).toBe(true);
  });

  it('accepts a file with an unknown (null) size', () => {
    const result = createDocumentSchema.safeParse({
      ...validInput,
      files: [{ ...validFile, size: null }],
    });
    expect(result.success).toBe(true);
  });

  it('does not sum file sizes when checking the per-document limit', () => {
    const result = createDocumentSchema.safeParse({
      ...validInput,
      files: Array.from({ length: MAX_FILES }, (_, i) => makeFile(i, { size: 9 * 1024 * 1024 })),
    });
    expect(result.success).toBe(true);
  });
});
