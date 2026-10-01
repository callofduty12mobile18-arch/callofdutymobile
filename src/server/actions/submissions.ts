'use server';

import { prisma } from '@/lib/db/prisma';
import { playerPortfolioSubmissionSchema, PlayerPortfolioSubmissionInput } from '@/lib/validation/submission';
import { SubmissionStatus, SubmissionType } from '@prisma/client';

export interface SubmissionResponse {
  success: boolean;
  message: string;
  submissionId?: string;
  errors?: Record<string, string[]>;
}

export async function submitPlayerPortfolio(
  prevState: SubmissionResponse | null,
  formData: FormData
): Promise<SubmissionResponse> {
  try {
    const rawEntries: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      rawEntries[key] = value;
    });

    // Check honeypot
    if (rawEntries.honeypot) {
      return { success: false, message: 'Invalid submission request' };
    }

    const parseResult = playerPortfolioSubmissionSchema.safeParse(rawEntries);

    if (!parseResult.success) {
      const flattenedErrors = parseResult.error.flatten().fieldErrors;
      return {
        success: false,
        message: 'Please resolve the highlighted validation errors.',
        errors: flattenedErrors as Record<string, string[]>,
      };
    }

    const data = parseResult.data;

    let submissionId: string;

    try {
      const created = await prisma.submission.create({
        data: {
          type: SubmissionType.PLAYER_PORTFOLIO,
          status: SubmissionStatus.PENDING,
          submitterName: data.submitterName,
          submitterEmail: data.submitterEmail,
          submitterPhone: data.submitterPhone || null,
          rawData: data as unknown as object,
        },
      });
      submissionId = created.id;
    } catch (dbErr) {
      console.error('Submission database insert failed:', dbErr);
      return {
        success: false,
        message: 'We could not save your submission right now. Please try again shortly.',
      };
    }

    return {
      success: true,
      message:
        'Your player portfolio has been successfully submitted! Our editorial and verification team will review your records.',
      submissionId,
    };
  } catch (err: unknown) {
    console.error('Submission error:', err);
    return {
      success: false,
      message: 'An unexpected error occurred while processing your submission. Please try again.',
    };
  }
}
