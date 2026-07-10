import { z } from 'zod';

export const DOCUMENT_NAME_MAX_LENGTH = 100;
/** Each segment of `major.minor.patch` allows at most two digits (0-99). */
export const VERSION_PATTERN = /^\d{1,2}\.\d{1,2}\.\d{1,2}$/;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const pickedFileSchema = z
  .object({
    uri: z.string(),
    name: z.string(),
    size: z.number().nullable(),
    type: z.string().nullable(),
  })
  .nullable();

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
    file: pickedFileSchema,
  })
  .superRefine((values, ctx) => {
    if (values.file === null) {
      ctx.addIssue({ code: 'custom', message: 'Select a file to attach.', path: ['file'] });
      return;
    }
    if (values.file.size !== null && values.file.size > MAX_FILE_SIZE_BYTES) {
      ctx.addIssue({ code: 'custom', message: 'File must be 10 MB or smaller.', path: ['file'] });
    }
  });

export type CreateDocumentFormValues = z.infer<typeof createDocumentSchema>;
