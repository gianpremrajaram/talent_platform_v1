// prisma/seed.ts
import {
  PrismaClient,
  OrganisationType,
  UserStatus,
  CompanyStatus,
} from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

type RawMember = {
  id: string;
  credentials: {
    email: string;
    password: string;
  };
  company: {
    name: string;
    contact_first: string;
    contact_last: string;
  };
  membership: {
    tier: "bronze" | "silver" | "gold" | "platinum";
    status: "active" | "inactive" | "pending" | "suspended";
    expiry?: string | Date;
    manager?: string;
  };
  redeemed_benefits?: string[];
};

const passwordHashCache = new Map<string, string>();

async function hashPassword(plain: string): Promise<string> {
  if (passwordHashCache.has(plain)) {
    return passwordHashCache.get(plain)!;
  }
  const hash = await bcrypt.hash(plain, 10);
  passwordHashCache.set(plain, hash);
  return hash;
}

//
// ─────────────────────────────────────────────────────────────
//   1. Seed Membership Tiers
// ─────────────────────────────────────────────────────────────
//
async function seedMembershipTiers() {
  console.log("\nSeeding membership tiers...");
  const tiers = [
    { key: "BRONZE", label: "Bronze", rank: 1 },
    { key: "SILVER", label: "Silver", rank: 2 },
    { key: "GOLD", label: "Gold", rank: 3 },
    { key: "PLATINUM", label: "Platinum", rank: 4 },
  ];
  for (const t of tiers) {
    await prisma.membershipTier.upsert({
      where: { key: t.key },
      update: {},
      create: t,
    });
  }
}

//
// ─────────────────────────────────────────────────────────────
//   2. Seed Apps & Access Rules
// ─────────────────────────────────────────────────────────────
//
async function seedApps() {
  console.log("\nSeeding apps and access rules...");

  const appDefs = [
    {
      key: "MEMBERSHIP_DASHBOARD",
      name: "Membership Dashboard",
      basePath: "/membership-dashboard",
    },
    {
      key: "IXN_WORKFLOW_MANAGER",
      name: "IXN Workflow Manager",
      basePath: "/ixn-workflow-manager",
    },
    {
      key: "TALENT_DISCOVERY",
      name: "Talent Discovery",
      basePath: "/talent-discovery",
    },
  ];

  for (const app of appDefs) {
    await prisma.app.upsert({
      where: { key: app.key },
      update: {},
      create: app,
    });
  }

  const [talentApp, membershipApp, bronzeTier] = await Promise.all([
    prisma.app.findUniqueOrThrow({ where: { key: "TALENT_DISCOVERY" } }),
    prisma.app.findUniqueOrThrow({ where: { key: "MEMBERSHIP_DASHBOARD" } }),
    prisma.membershipTier.findUniqueOrThrow({ where: { key: "BRONZE" } }),
  ]);

  // Recreate access rules idempotently for the two partner-facing apps.
  // STUDENT + TALENT_DISCOVERY is a role-based bypass in access-control.ts (no rule needed).
  // Recruiters fall through to the tier check, so bronze-minimum covers all tiers.
  await prisma.appAccessRule.deleteMany({
    where: { appId: { in: [talentApp.id, membershipApp.id] } },
  });
  await prisma.appAccessRule.createMany({
    data: [
      {
        appId: talentApp.id,
        minMembershipTierId: bronzeTier.id,
        accessType: "ALLOW",
      },
      {
        appId: membershipApp.id,
        minMembershipTierId: bronzeTier.id,
        accessType: "ALLOW",
      },
    ],
  });
}

//
// ─────────────────────────────────────────────────────────────
//   3. Seed Organisations & Recruiter Users (from members.yml)
// ─────────────────────────────────────────────────────────────
//
async function seedOrganisationsAndRecruiters() {
  console.log(
    "\nSeeding organisations and recruiter users from members.yml...",
  );

  const yamlPath = path.join(__dirname, "members.yml");
  const raw = parse(fs.readFileSync(yamlPath, "utf8")) as RawMember[];

  const recruiterRole = await prisma.role.upsert({
    where: { key: "RECRUITER" },
    update: {},
    create: { key: "RECRUITER", label: "Recruiter" },
  });

  const talentApp = await prisma.app.findUnique({
    where: { key: "TALENT_DISCOVERY" },
  });

  const tierKeyMap: Record<string, string> = {
    bronze: "BRONZE",
    silver: "SILVER",
    gold: "GOLD",
    platinum: "PLATINUM",
  };

  const companyStatusMap: Record<string, CompanyStatus> = {
    active: "APPROVED",
    inactive: "SUSPENDED",
    pending: "PENDING",
    suspended: "SUSPENDED",
  };

  const userStatusMap: Record<string, UserStatus> = {
    active: "ACTIVE",
    inactive: "SUSPENDED",
    pending: "PENDING_APPROVAL",
    suspended: "SUSPENDED",
  };

  for (const member of raw) {
    const tierKey = tierKeyMap[member.membership.tier];
    const tier = await prisma.membershipTier.findUniqueOrThrow({
      where: { key: tierKey },
    });

    const companyStatus =
      companyStatusMap[member.membership.status] ?? "PENDING";
    const userStatus = userStatusMap[member.membership.status] ?? "PENDING_APPROVAL";
    const domain = member.credentials.email.split("@")[1];

    const org = await prisma.organisation.upsert({
      where: { slug: member.id },
      update: { status: companyStatus },
      create: {
        name: member.company.name,
        slug: member.id,
        domain,
        type: OrganisationType.INDUSTRY,
        status: companyStatus,
      },
    });

    const passwordHash = await hashPassword(member.credentials.password);

    const user = await prisma.user.upsert({
      where: { email: member.credentials.email },
      update: { userStatus, organisationId: org.id },
      create: {
        email: member.credentials.email,
        passwordHash,
        firstName: member.company.contact_first,
        lastName: member.company.contact_last,
        userStatus,
        organisationId: org.id,
        defaultAppId: talentApp?.id ?? null,
        roles: { create: { roleId: recruiterRole.id } },
      },
    });

    let membership = await prisma.membership.findFirst({
      where: { userId: user.id, organisationId: org.id },
    });
    if (!membership) {
      membership = await prisma.membership.create({
        data: {
          userId: user.id,
          organisationId: org.id,
          membershipTierId: tier.id,
          isActive: member.membership.status === "active",
          status: member.membership.status,
          managerName: member.membership.manager ?? null,
          expiry: member.membership.expiry
            ? new Date(member.membership.expiry as string)
            : null,
        },
      });
    }

    await prisma.membershipDashboardMember.upsert({
      where: { memberKey: member.id },
      update: { redeemedBenefitCodes: member.redeemed_benefits ?? [] },
      create: {
        memberKey: member.id,
        userId: user.id,
        membershipId: membership.id,
        redeemedBenefitCodes: member.redeemed_benefits ?? [],
      },
    });
  }

  console.log(`\nSeeded ${raw.length} organisations and recruiter users`);
}

//
// ─────────────────────────────────────────────────────────────
//   4. Seed Roles, Admin, Students
// ─────────────────────────────────────────────────────────────
//
async function seedSpecificRolesAndUsers() {
  console.log(
    "\nSeeding Roles, Admin, Recruiters, Students (clean dataset)...",
  );

  // ─────────────────────────────
  // ROLES
  // ─────────────────────────────
  const roles = ["ADMIN", "STUDENT", "RECRUITER"];
  const roleMap = new Map<string, number>();

  for (const r of roles) {
    const role = await prisma.role.upsert({
      where: { key: r },
      update: {},
      create: {
        key: r,
        label: r.charAt(0) + r.slice(1).toLowerCase(),
      },
    });
    roleMap.set(r, role.id);
  }

  const password = await hashPassword("password123");

  // ─────────────────────────────
  // ORGANISATIONS (used for blocking + consent testing)
  // ─────────────────────────────
  const orgs = await prisma.organisation.findMany();
  const orgMap = Object.fromEntries(orgs.map((o) => [o.slug, o.id]));

  const getOrgId = (slug: string) => orgMap[slug];

  // ─────────────────────────────
  // ADMIN
  // ─────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin@ucl.ac.uk" },
    update: {},
    create: {
      email: "admin@ucl.ac.uk",
      passwordHash: password,
      firstName: "System",
      lastName: "Admin",
      roles: { create: { roleId: roleMap.get("ADMIN")! } },
    },
  });

  // ─────────────────────────────
  // STUDENT 1 — Open / High visibility
  // ─────────────────────────────
  const student1 = await prisma.user.upsert({
    where: { email: "student1@ucl.ac.uk" },
    update: {},
    create: {
      email: "student1@ucl.ac.uk",
      passwordHash: password,
      firstName: "Aisha",
      lastName: "Rahman",
      roles: { create: { roleId: roleMap.get("STUDENT")! } },

      studentProfile: {
        create: {
          bio: "Final year Computer Science student at UCL interested in backend systems, APIs, and scalable infrastructure.",
        },
      },

      studentPersonalInformation: {
        create: {
          city: "London",
          country: "United Kingdom",
          designation: "Computer Science Undergraduate",
        },
      },

      studentUniversities: {
        create: {
          universityName: "University College London",
          fieldOfStudy: "Computer Science",
          degreeProgram: "BSc",
          grade: "First Class (Predicted)",
        },
      },

      studentSkills: {
        create: [
          { name: "TypeScript" },
          { name: "Node.js" },
          { name: "PostgreSQL" },
          { name: "Docker" },
        ],
      },

      studentAcheivementTags: {
        create: [
          { name: "Hackathon Winner" },
          { name: "Open Source Contributor" },
          { name: "Dean's List" },
        ],
      },

      studentProjects: {
        create: [
          {
            title: "Distributed Task Queue",
            description:
              "Built a Redis-based job queue system with worker autoscaling.",
          },
        ],
      },

      studentSocialLinks: {
        create: [
          { platform: "GITHUB", url: "https://github.com/aisharahman" },
          { platform: "LINKEDIN", url: "https://linkedin.com/in/aisharahman" },
        ],
      },

      consents: {
        create: {
          type: "PRIVACY_POLICY",
          accepted: true,
        },
      },
    },
  });

  // open to all companies
  await prisma.studentCompanyConsent.createMany({
    data: orgs.map((o) => ({
      studentId: student1.id,
      companyId: o.id,
      consented: true,
    })),
    skipDuplicates: true,
  });

  // ─────────────────────────────
  // STUDENT 2 — Selective / Privacy-focused
  // tests blocking + consent filtering
  // ─────────────────────────────
  const student2 = await prisma.user.upsert({
    where: { email: "student2@ucl.ac.uk" },
    update: {},
    create: {
      email: "student2@ucl.ac.uk",
      passwordHash: password,
      firstName: "James",
      lastName: "Okafor",
      roles: { create: { roleId: roleMap.get("STUDENT")! } },

      studentProfile: {
        create: {
          bio: "Data Science student interested in AI ethics, machine learning fairness, and applied statistics.",
        },
      },

      studentPersonalInformation: {
        create: {
          city: "Manchester",
          country: "United Kingdom",
          designation: "MSc Data Science Student",
        },
      },

      studentUniversities: {
        create: {
          universityName: "University College London",
          fieldOfStudy: "Data Science",
          degreeProgram: "MSc",
        },
      },

      studentSkills: {
        create: [
          { name: "Python" },
          { name: "Machine Learning" },
          { name: "Pandas" },
          { name: "SQL" },
        ],
      },

      studentAcheivementTags: {
        create: [{ name: "Research Assistant" }, { name: "Kaggle Competitor" }],
      },

      studentProjects: {
        create: [
          {
            title: "Bias Detection in ML Models",
            description:
              "Analyzed fairness metrics across classification models.",
          },
        ],
      },

      studentSocialLinks: {
        create: [{ platform: "GITHUB", url: "https://github.com/jamesokafor" }],
      },

      consents: {
        create: {
          type: "PRIVACY_POLICY",
          accepted: true,
        },
      },
    },
  });

  // BLOCKED COMPANIES (test filtering)
  await prisma.studentCompanyConsent.createMany({
    data: orgs.map((o) => ({
      studentId: student2.id,
      companyId: o.id,
      consented: o.slug !== "meta" && o.slug !== "google", // selective blocking
    })),
    skipDuplicates: true,
  });

  // ─────────────────────────────
  // STUDENT 3 — Product / AI focused
  // ─────────────────────────────
  const student3 = await prisma.user.upsert({
    where: { email: "student3@ucl.ac.uk" },
    update: {},
    create: {
      email: "student3@ucl.ac.uk",
      passwordHash: password,
      firstName: "Emily",
      lastName: "Chen",
      roles: { create: { roleId: roleMap.get("STUDENT")! } },

      studentProfile: {
        create: {
          bio: "AI and product-focused student building NLP tools and startup prototypes.",
        },
      },

      studentPersonalInformation: {
        create: {
          city: "London",
          country: "United Kingdom",
          designation: "AI / Product Engineering Student",
        },
      },

      studentUniversities: {
        create: {
          universityName: "University College London",
          fieldOfStudy: "Artificial Intelligence",
          degreeProgram: "MSc",
        },
      },

      studentSkills: {
        create: [
          { name: "Python" },
          { name: "PyTorch" },
          { name: "NLP" },
          { name: "React" },
        ],
      },

      studentAcheivementTags: {
        create: [
          { name: "Startup Founder (Student)" },
          { name: "AI Research Project" },
        ],
      },

      studentProjects: {
        create: [
          {
            title: "AI CV Screening Tool",
            description:
              "Built an NLP system to rank CVs using semantic similarity.",
          },
        ],
      },

      studentSocialLinks: {
        create: [
          { platform: "GITHUB", url: "https://github.com/emilychen" },
          { platform: "LINKEDIN", url: "https://linkedin.com/in/emilychen" },
        ],
      },

      consents: {
        create: {
          type: "PRIVACY_POLICY",
          accepted: true,
        },
      },
    },
  });

  // semi-open access
  await prisma.studentCompanyConsent.createMany({
    data: orgs.map((o) => ({
      studentId: student3.id,
      companyId: o.id,
      consented: o.slug !== "test-corp-suspended",
    })),
    skipDuplicates: true,
  });

  console.log(
    "\nSeeded 3 UCL students with realistic profiles + consent rules",
  );
}

//
// ─────────────────────────────────────────────────────────────
//   5. Seed Job Postings (Partner Project Approvals queue)
// ─────────────────────────────────────────────────────────────
//
async function seedJobPostings() {
  console.log("\nSeeding job postings...");

  type JobDef = {
    recruiterEmail: string;
    orgSlug: string;
    title: string;
    description: string;
    location: string;
    salaryBand?: string;
    roleType: string;
    approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
    daysAgo?: number;
  };

  const jobs: JobDef[] = [
    // ── APPROVED ─────────────────────────────────────────────
    {
      recruiterEmail: "j.mitchell@deepmind.example.com",
      orgSlug: "deepmind",
      title: "Software Engineer, AI Safety",
      description:
        "Join our AI Safety team to work on foundational research engineering problems. You will design and implement tooling for model evaluation, interpretability experiments, and safety-critical infrastructure.",
      location: "London, UK",
      salaryBand: "£70,000 – £90,000",
      roleType: "Full-time",
      approvalStatus: "APPROVED",
      daysAgo: 14,
    },
    {
      recruiterEmail: "o.walsh@goldmansachs.example.com",
      orgSlug: "goldman-sachs",
      title: "Technology Analyst — Summer Internship",
      description:
        "10-week summer programme within Global Markets Technology. Interns rotate through trading systems, risk analytics, and low-latency infrastructure teams.",
      location: "London, UK",
      salaryBand: "£1,200/week",
      roleType: "Internship",
      approvalStatus: "APPROVED",
      daysAgo: 10,
    },
    {
      recruiterEmail: "s.chen@microsoft.example.com",
      orgSlug: "microsoft",
      title: "Graduate Software Engineer — Azure",
      description:
        "Design and ship distributed systems features on Azure's core compute platform. Work alongside senior engineers across storage, networking, and orchestration.",
      location: "London, UK (Hybrid)",
      salaryBand: "£65,000 – £80,000",
      roleType: "Full-time",
      approvalStatus: "APPROVED",
      daysAgo: 7,
    },
    {
      recruiterEmail: "m.taylor@bloomberg.example.com",
      orgSlug: "bloomberg",
      title: "Software Engineer — Financial Data Systems",
      description:
        "Build the real-time data pipelines and APIs that power Bloomberg Terminal. Strong focus on high-throughput, low-latency backend systems in C++ and Python.",
      location: "London, UK",
      salaryBand: "£75,000 – £95,000",
      roleType: "Full-time",
      approvalStatus: "APPROVED",
      daysAgo: 5,
    },
    {
      recruiterEmail: "m.patel@google.example.com",
      orgSlug: "google",
      title: "STEP Intern — Software Engineering",
      description:
        "Google's Student Training in Engineering Program (STEP) is a 12-week internship for first and second-year undergraduates. Projects span Search, Maps, Cloud, and internal tooling.",
      location: "London, UK",
      salaryBand: "£900/week",
      roleType: "Internship",
      approvalStatus: "APPROVED",
      daysAgo: 3,
    },
    // ── PENDING ───────────────────────────────────────────────
    {
      recruiterEmail: "r.holt@palantir.example.com",
      orgSlug: "palantir",
      title: "Forward Deployed Engineer",
      description:
        "Work directly with defence, intelligence, and NHS clients to deploy and customise Palantir Foundry. Requires willingness to travel and engage with complex, sensitive operational environments.",
      location: "London, UK / Client Sites",
      salaryBand: "£80,000 – £100,000",
      roleType: "Full-time",
      approvalStatus: "PENDING",
      daysAgo: 2,
    },
    {
      recruiterEmail: "t.lane@deliveroo.example.com",
      orgSlug: "deliveroo",
      title: "Software Engineer — Rider Platform",
      description:
        "Own the backend services that dispatch, track, and optimise tens of thousands of riders across Europe. Work with Kafka, PostgreSQL, and Go in a high-availability environment.",
      location: "London, UK (Hybrid)",
      salaryBand: "£60,000 – £75,000",
      roleType: "Full-time",
      approvalStatus: "PENDING",
      daysAgo: 1,
    },
    {
      recruiterEmail: "t.harrison@bbc.example.com",
      orgSlug: "bbc",
      title: "Junior Software Developer — iPlayer",
      description:
        "Join the BBC iPlayer engineering team to build streaming features used by millions of viewers. Focus on React frontend and Node.js API work.",
      location: "London, UK",
      salaryBand: "£40,000 – £52,000",
      roleType: "Full-time",
      approvalStatus: "PENDING",
      daysAgo: 1,
    },
    {
      recruiterEmail: "a.patel@meta.example.com",
      orgSlug: "meta",
      title: "University Graduate — Software Engineer",
      description:
        "Meta's university graduate programme places new engineers directly into product teams across WhatsApp, Instagram, and core infrastructure. Expect rapid ownership and cross-functional collaboration.",
      location: "London, UK",
      salaryBand: "£85,000 – £105,000",
      roleType: "Full-time",
      approvalStatus: "PENDING",
      daysAgo: 0,
    },
    {
      recruiterEmail: "z.miles@monzo.example.com",
      orgSlug: "monzo",
      title: "Backend Engineer — Lending",
      description:
        "Build the core lending product at Monzo: overdrafts, personal loans, and credit risk infrastructure. Go services, Cassandra, and event-driven architecture.",
      location: "London, UK (Hybrid)",
      salaryBand: "£55,000 – £70,000",
      roleType: "Full-time",
      approvalStatus: "PENDING",
      daysAgo: 0,
    },
    // ── REJECTED ──────────────────────────────────────────────
    {
      recruiterEmail: "e.fischer@siemens.example.com",
      orgSlug: "siemens",
      title: "Embedded Systems Intern",
      description:
        "Develop firmware for industrial IoT sensors. C/C++ experience required. On-site in Munich for the full internship period.",
      location: "Munich, Germany",
      salaryBand: "£800/week",
      roleType: "Internship",
      approvalStatus: "REJECTED",
      daysAgo: 6,
    },
    {
      recruiterEmail: "m.arthur@ocado.example.com",
      orgSlug: "ocado",
      title: "Robotics Software Engineer",
      description:
        "Write motion-planning and perception software for warehouse automation robots. Requires prior ROS experience.",
      location: "Hatfield, UK",
      salaryBand: "£55,000 – £68,000",
      roleType: "Full-time",
      approvalStatus: "REJECTED",
      daysAgo: 4,
    },
  ];

  const admin = await prisma.user.findUnique({
    where: { email: "admin@ucl.ac.uk" },
  });

  for (const job of jobs) {
    const [user, org] = await Promise.all([
      prisma.user.findUnique({ where: { email: job.recruiterEmail } }),
      prisma.organisation.findUnique({ where: { slug: job.orgSlug } }),
    ]);
    if (!user || !org) continue;

    const existing = await prisma.jobPosting.findFirst({
      where: { createdByUserId: user.id, title: job.title },
    });
    if (existing) continue;

    const postedAt = new Date();
    postedAt.setDate(postedAt.getDate() - (job.daysAgo ?? 0));

    const isReviewed =
      job.approvalStatus === "APPROVED" || job.approvalStatus === "REJECTED";

    await prisma.jobPosting.create({
      data: {
        organisationId: org.id,
        createdByUserId: user.id,
        title: job.title,
        description: job.description,
        location: job.location,
        salaryBand: job.salaryBand ?? null,
        roleType: job.roleType,
        approvalStatus: job.approvalStatus,
        isActive: job.approvalStatus === "APPROVED",
        postedAt,
        reviewedById: isReviewed ? (admin?.id ?? null) : null,
        reviewedAt: isReviewed ? new Date() : null,
      },
    });
  }

  console.log(`\nSeeded ${jobs.length} job postings (5 approved, 5 pending, 2 rejected)`);
}

//
// ─────────────────────────────────────────────────────────────
//   Main
// ─────────────────────────────────────────────────────────────
//
async function main() {
  await seedMembershipTiers();
  await seedApps();
  await seedOrganisationsAndRecruiters();
  await seedSpecificRolesAndUsers();
  await seedJobPostings();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
