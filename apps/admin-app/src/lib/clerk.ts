import { clerkClient } from "@clerk/nextjs/server";

export async function deleteClerkUser(clerkUserId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await clerkClient();
    
    // Get user's organizations first
    const memberships = await client.users.getOrganizationMembershipList({ userId: clerkUserId });
    
    // Delete organizations where user is the only member or admin
    for (const membership of memberships.data) {
      try {
        const orgMembers = await client.organizations.getOrganizationMembershipList({
          organizationId: membership.organization.id,
        });
        
        // If user is the only member, delete the org
        if (orgMembers.data.length === 1) {
          await client.organizations.deleteOrganization(membership.organization.id);
        } else {
          // Otherwise just remove user from org
          await client.organizations.deleteOrganizationMembership({
            organizationId: membership.organization.id,
            userId: clerkUserId,
          });
        }
      } catch (orgError) {
        console.error(`Failed to handle org ${membership.organization.id}:`, orgError);
      }
    }
    
    // Delete the user
    await client.users.deleteUser(clerkUserId);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getClerkUser(clerkUserId: string) {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);
    return user;
  } catch {
    return null;
  }
}
