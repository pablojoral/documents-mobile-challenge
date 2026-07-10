import { z } from 'zod';

export const DOCUMENT_NAME_MAX_LENGTH = 100;
/** Each segment of `major.minor.patch` allows at most two digits (0-99). */
export const VERSION_PATTERN = /^\d{1,2}\.\d{1,2}\.\d{1,2}$/;
/** Applies per document, not to the combined size of all attached files. */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
/** Matches the native picker's selection cap enforced in `DocumentInput`. */
export const MAX_FILES = 10;

const pickedFileSchema = z.object({
  uri: z.string(),
  name: z.string(),
  size: z.number().nullable(),
  type: z.string().nullable(),
});

export const createDocumentSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required.')
      .max(
        DOCUMENT_NAME_MAX_LENGTH,
        `Name must be ${DOCUMENT_NAME_MAX_LENGTH} characters or fewer.`,
      ),
    version: z
      .string()
      .trim()
      .min(1, 'Version is required.')
      .regex(VERSION_PATTERN, 'Version must be in the form 0-99.0-99.0-99 (e.g. 1.0.0).'),
    files: z.array(pickedFileSchema),
  })
  .superRefine((values, ctx) => {
    if (values.files.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Select at least one file to attach.', path: ['files'] });
      return;
    }
    if (values.files.length > MAX_FILES) {
      ctx.addIssue({
        code: 'custom',
        message: `You can attach up to ${MAX_FILES} files.`,
        path: ['files'],
      });
    }
    if (values.files.some(file => file.size !== null && file.size > MAX_FILE_SIZE_BYTES)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Each file must be 10 MB or smaller.',
        path: ['files'],
      });
    }
  });

export type CreateDocumentFormValues = z.infer<typeof createDocumentSchema>;
