import { z } from "zod";

import { NextRequest, NextResponse } from "next/server";

import { getCurrentOrganization, setCurrentOrganizationId } from "@/lib/tenant/context";

const switchSchema = z.object({
  organizationId: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = switchSchema.parse(body);

    // Verify user has access to this organization
    const org = await getCurrentOrganization();
    if (!org || org.id !== validated.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await setCurrentOrganizationId(validated.organizationId);

    return NextResponse.json({
      success: true,
      organizationId: validated.organizationId,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to switch organization" },
      { status: 500 }
    );
  }
}
