import { createDocumentSchema, DOCUMENT_NAME_MAX_LENGTH } from './schema';

const validFile = { uri: 'file:///a.pdf', name: 'a.pdf', size: 1024, type: 'application/pdf' };

const validInput = {
  name: 'Report',
  version: '1.0.0',
  file: validFile,
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

  it('rejects a null file', () => {
    const result = createDocumentSchema.safeParse({ ...validInput, file: null });
    expect(result.success).toBe(false);
  });

  it('rejects a file larger than the max size', () => {
    const result = createDocumentSchema.safeParse({
      ...validInput,
      file: { ...validFile, size: 11 * 1024 * 1024 },
    });
    expect(result.success).toBe(false);
  });

  it('accepts a file exactly at the max size', () => {
    const result = createDocumentSchema.safeParse({
      ...validInput,
      file: { ...validFile, size: 10 * 1024 * 1024 },
    });
    expect(result.success).toBe(true);
  });

  it('accepts a file with an unknown (null) size', () => {
    const result = createDocumentSchema.safeParse({
      ...validInput,
      file: { ...validFile, size: null },
    });
    expect(result.success).toBe(true);
  });
});
