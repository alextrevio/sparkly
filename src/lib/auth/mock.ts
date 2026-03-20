// Mock authentication data for development without Supabase.
// To re-enable real auth, remove usages of these mocks and restore
// the original supabase.auth.getUser() calls.

export const MOCK_USER = {
  id: "mock-user-001",
  email: "demo@sparkli.app",
  name: "Demo User",
};

export const MOCK_ORG = {
  id: "mock-org-001",
  name: "Demo Organization",
  slug: "demo-org",
  plan: "pro",
  credits_remaining: 9999,
};

/** Drop-in replacement for supabase.auth.getUser() */
export function getMockUser() {
  return {
    data: {
      user: {
        id: MOCK_USER.id,
        email: MOCK_USER.email,
        user_metadata: { name: MOCK_USER.name },
      },
    },
    error: null,
  };
}

/** Drop-in replacement for org_members + organizations query */
export function getMockMemberships() {
  return {
    data: [
      {
        org_id: MOCK_ORG.id,
        role: "owner" as const,
        organizations: {
          id: MOCK_ORG.id,
          name: MOCK_ORG.name,
          slug: MOCK_ORG.slug,
          plan: MOCK_ORG.plan,
          credits_remaining: MOCK_ORG.credits_remaining,
        },
      },
    ],
    error: null,
  };
}
