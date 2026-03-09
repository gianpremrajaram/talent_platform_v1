"use server";

import { prisma } from "@/lib/prisma";
import {
  upsertStudentPersonalInfo,
  saveStudentSocialLinks,
} from "@/lib/services/student-services";
import { SocialPlatform } from "@prisma/client";

type SaveStudentPersonalInfoInput = {
  userId: string;
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    dateOfBirth?: string | null;
    gender?: string;
    phoneCode?: string;
    phoneNumber?: string;
    designation?: string;
    address1?: string;
    address2?: string;
    country?: string;
    state?: string;
    city?: string;
    postalCode?: string;
  };
};

export async function saveStudentPersonalInfoAction({
  userId,
  data,
}: SaveStudentPersonalInfoInput) {
  const { firstName, lastName, email, dateOfBirth, ...personalInfoData } = data;

  await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      email,
    },
  });

  await upsertStudentPersonalInfo(userId, {
    ...personalInfoData,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
  });

  return { success: true };
}

type SaveStudentSocialLinksInput = {
  userId: string;
  links: {
    platform: SocialPlatform;
    url: string;
  }[];
};

export async function saveStudentSocialLinksAction({
  userId,
  links,
}: SaveStudentSocialLinksInput) {
  return saveStudentSocialLinks(userId, links);
}
